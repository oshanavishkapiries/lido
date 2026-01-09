const messageService = require("./services/messageService");
const sessionService = require("./services/sessionService");
const pollService = require("./services/pollService");
const logger = require("./logger");

module.exports = (io) => {
    // Store active users per session
    const activeSessions = new Map(); // sessionId -> Set of socket IDs
    const socketToUser = new Map(); // socket.id -> { sessionId, userName }

    io.on("connection", (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // Join a session
        socket.on("join-session", async (data) => {
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
        });

        // Leave a session
        socket.on("leave-session", async (data) => {
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
        });

        // Send a message
        socket.on("send-message", async (data) => {
            try {
                const { sessionId, userName, message, type = 'message' } = data;

                if (!sessionId || !userName || !message) {
                    socket.emit("error", { message: "sessionId, userName, and message are required" });
                    return;
                }

                // Save message to database
                const savedMessage = await messageService.createMessage(
                    sessionId,
                    userName,
                    message,
                    type
                );

                // Broadcast message to all users in the session (including sender)
                io.to(sessionId).emit("new-message", {
                    id: savedMessage._id,
                    sessionId: savedMessage.sessionId,
                    senderName: savedMessage.senderName,
                    content: savedMessage.content,
                    type: savedMessage.type,
                    reactions: savedMessage.reactions,
                    upvotes: savedMessage.upvotes,
                    timestamp: savedMessage.timestamp
                });

                logger.info(`Message sent in session ${sessionId} by ${userName}`);
            } catch (error) {
                logger.error(`Error sending message: ${error.message}`);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Typing indicator
        socket.on("typing", (data) => {
            const { sessionId, userName } = data;
            if (sessionId && userName) {
                socket.to(sessionId).emit("user-typing", { userName });
            }
        });

        // Stop typing indicator
        socket.on("stop-typing", (data) => {
            const { sessionId, userName } = data;
            if (sessionId && userName) {
                socket.to(sessionId).emit("user-stop-typing", { userName });
            }
        });

        // Create poll
        socket.on("create-poll", async (data) => {
            try {
                const { sessionId, question, options, createdBy, duration } = data;

                if (!sessionId || !question || !options || !createdBy) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                const poll = await pollService.createPoll(
                    sessionId,
                    question,
                    options,
                    createdBy,
                    duration
                );

                // Broadcast new poll to all users in the session
                io.to(sessionId).emit("poll-created", poll);

                logger.info(`Poll created in session ${sessionId} by ${createdBy}`);
            } catch (error) {
                logger.error(`Error creating poll: ${error.message}`);
                socket.emit("error", { message: "Failed to create poll" });
            }
        });

        // Vote on poll
        socket.on("vote-poll", async (data) => {
            try {
                const { pollId, optionIndex, userName } = data;

                if (pollId === undefined || optionIndex === undefined || !userName) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                await pollService.vote(pollId, optionIndex, userName);
                const results = await pollService.getPollResults(pollId);

                // Get session ID from poll
                const poll = await pollService.getPollResults(pollId);
                const sessionId = poll.pollId; // We need to get this from the poll

                // Broadcast updated poll results to all users
                const pollDoc = await require("./models/MessageModel").Poll.findById(pollId);
                if (pollDoc) {
                    io.to(pollDoc.sessionId).emit("poll-updated", results);
                }

                logger.info(`Vote recorded for poll ${pollId} by ${userName}`);
            } catch (error) {
                logger.error(`Error voting on poll: ${error.message}`);
                socket.emit("error", { message: error.message });
            }
        });

        // Add reaction
        socket.on("add-reaction", async (data) => {
            try {
                const { messageId, emoji, userName } = data;

                if (!messageId || !emoji || !userName) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                const message = await messageService.addReaction(messageId, emoji, userName);

                // Broadcast reaction update to all users in the session
                const { Message } = require("./models/MessageModel");
                const messageDoc = await Message.findById(messageId);
                if (messageDoc) {
                    io.to(messageDoc.sessionId).emit("reaction-added", {
                        messageId,
                        reactions: message.reactions
                    });
                }
            } catch (error) {
                logger.error(`Error adding reaction: ${error.message}`);
                socket.emit("error", { message: "Failed to add reaction" });
            }
        });

        // Upvote message
        socket.on("upvote-message", async (data) => {
            try {
                const { messageId, userName } = data;

                if (!messageId || !userName) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                const message = await messageService.upvoteMessage(messageId, userName);

                // Broadcast upvote update to all users in the session
                const { Message } = require("./models/MessageModel");
                const messageDoc = await Message.findById(messageId);
                if (messageDoc) {
                    io.to(messageDoc.sessionId).emit("message-upvoted", {
                        messageId,
                        upvotes: message.upvotes
                    });
                }
            } catch (error) {
                logger.error(`Error upvoting message: ${error.message}`);
                socket.emit("error", { message: "Failed to upvote message" });
            }
        });

        // Handle disconnect
        socket.on("disconnect", async () => {
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
        });
    });

    return io;
};
