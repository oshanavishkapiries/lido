/**
 * Main Socket.io event handler
 * Orchestrates all socket event handlers from separate modules
 */
const sessionHandlers = require("./socketHandlers/sessionHandlers");
const messageHandlers = require("./socketHandlers/messageHandlers");
const pollHandlers = require("./socketHandlers/pollHandlers");
const logger = require("./logger");

module.exports = (io) => {
    // Store active users per session
    const activeSessions = new Map(); // sessionId -> Set of socket IDs
    const socketToUser = new Map(); // socket.id -> { sessionId, userName }

    // Initialize handlers
    const sessionHandlerFns = sessionHandlers(io, activeSessions, socketToUser);
    const messageHandlerFns = messageHandlers(io);
    const pollHandlerFns = pollHandlers(io);

    io.on("connection", (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // Session events
        socket.on("join-session", (data) => sessionHandlerFns.handleJoinSession(socket, data));
        socket.on("leave-session", (data) => sessionHandlerFns.handleLeaveSession(socket, data));

        // Message events
        socket.on("send-message", (data) => messageHandlerFns.handleSendMessage(socket, data));
        socket.on("typing", (data) => messageHandlerFns.handleTyping(socket, data));
        socket.on("stop-typing", (data) => messageHandlerFns.handleStopTyping(socket, data));
        socket.on("add-reaction", (data) => messageHandlerFns.handleAddReaction(socket, data));
        socket.on("upvote-message", (data) => messageHandlerFns.handleUpvoteMessage(socket, data));

        // Poll events
        socket.on("create-poll", (data) => pollHandlerFns.handleCreatePoll(socket, data));
        socket.on("vote-poll", (data) => pollHandlerFns.handleVotePoll(socket, data));

        // Disconnect
        socket.on("disconnect", () => sessionHandlerFns.handleDisconnect(socket));
    });

    return io;
};
