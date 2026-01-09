/**
 * Session-related socket event handlers
 */
const sessionService = require("../services/sessionService");
const logger = require("../logger");

module.exports = (io, activeSessions, socketToUser) => {
    return {
        /**
         * Handle user joining a session
         */
        handleJoinSession: async (socket, data) => {
            try {
                const { sessionId, userName } = data;

                if (!sessionId || !userName) {
                    socket.emit("error", { message: "sessionId and userName are required" });
                    return;
                }

                // Verify session exists and is active
                const session = await sessionService.getSessionById(sessionId);
                if (!session) {
                    socket.emit("error", { message: "Session not found" });
                    return;
                }

                if (!session.isActive) {
                    socket.emit("error", { message: "Session is not active" });
                    return;
                }

                // Add participant to session
                try {
                    await sessionService.addParticipant(sessionId, userName);
                } catch (error) {
                    socket.emit("error", { message: error.message });
                    return;
                }

                // Join socket room
                socket.join(sessionId);

                // Track active session
                if (!activeSessions.has(sessionId)) {
                    activeSessions.set(sessionId, new Set());
                }
                activeSessions.get(sessionId).add(socket.id);
                socketToUser.set(socket.id, { sessionId, userName });

                // Get active participants
                const participants = await sessionService.getActiveParticipants(sessionId);

                // Notify user they joined successfully
                socket.emit("joined-session", {
                    sessionId,
                    userName,
                    participants
                });

                // Notify others in the session
                socket.to(sessionId).emit("participant-joined", {
                    userName,
                    participants,
                    timestamp: new Date()
                });

                logger.info(`User ${userName} joined session ${sessionId}`);
            } catch (error) {
                logger.error(`Error joining session: ${error.message}`);
                socket.emit("error", { message: "Failed to join session" });
            }
        },

        /**
         * Handle user leaving a session
         */
        handleLeaveSession: async (socket, data) => {
            try {
                const { sessionId, userName } = data;

                if (!sessionId || !userName) {
                    return;
                }

                // Remove participant from session
                await sessionService.removeParticipant(sessionId, userName);

                // Leave socket room
                socket.leave(sessionId);

                // Remove from tracking
                if (activeSessions.has(sessionId)) {
                    activeSessions.get(sessionId).delete(socket.id);
                    if (activeSessions.get(sessionId).size === 0) {
                        activeSessions.delete(sessionId);
                    }
                }
                socketToUser.delete(socket.id);

                // Get updated participants
                const participants = await sessionService.getActiveParticipants(sessionId);

                // Notify others in the session
                socket.to(sessionId).emit("participant-left", {
                    userName,
                    participants,
                    timestamp: new Date()
                });

                logger.info(`User ${userName} left session ${sessionId}`);
            } catch (error) {
                logger.error(`Error leaving session: ${error.message}`);
            }
        },

        /**
         * Handle socket disconnect
         */
        handleDisconnect: async (socket) => {
            try {
                const userData = socketToUser.get(socket.id);

                if (userData) {
                    const { sessionId, userName } = userData;

                    // Remove participant from session
                    await sessionService.removeParticipant(sessionId, userName);

                    // Remove from tracking
                    if (activeSessions.has(sessionId)) {
                        activeSessions.get(sessionId).delete(socket.id);
                        if (activeSessions.get(sessionId).size === 0) {
                            activeSessions.delete(sessionId);
                        }
                    }
                    socketToUser.delete(socket.id);

                    // Get updated participants
                    const participants = await sessionService.getActiveParticipants(sessionId);

                    // Notify others in the session
                    socket.to(sessionId).emit("participant-left", {
                        userName,
                        participants,
                        timestamp: new Date()
                    });

                    logger.info(`User ${userName} disconnected from session ${sessionId}`);
                }

                logger.info(`Socket disconnected: ${socket.id}`);
            } catch (error) {
                logger.error(`Error handling disconnect: ${error.message}`);
            }
        }
    };
};
