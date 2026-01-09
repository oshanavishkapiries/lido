/**
 * Message-related socket event handlers
 */
const messageService = require("../services/messageService");
const logger = require("../logger");

module.exports = (io) => {
    return {
        /**
         * Handle sending a message
         */
        handleSendMessage: async (socket, data) => {
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
        },

        /**
         * Handle typing indicator
         */
        handleTyping: (socket, data) => {
            const { sessionId, userName } = data;
            if (sessionId && userName) {
                socket.to(sessionId).emit("user-typing", { userName });
            }
        },

        /**
         * Handle stop typing indicator
         */
        handleStopTyping: (socket, data) => {
            const { sessionId, userName } = data;
            if (sessionId && userName) {
                socket.to(sessionId).emit("user-stop-typing", { userName });
            }
        },

        /**
         * Handle adding a reaction
         */
        handleAddReaction: async (socket, data) => {
            try {
                const { messageId, emoji, userName } = data;

                if (!messageId || !emoji || !userName) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                const message = await messageService.addReaction(messageId, emoji, userName);

                // Broadcast reaction update to all users in the session
                const { Message } = require("../models/MessageModel");
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
        },

        /**
         * Handle upvoting a message
         */
        handleUpvoteMessage: async (socket, data) => {
            try {
                const { messageId, userName } = data;

                if (!messageId || !userName) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                const message = await messageService.upvoteMessage(messageId, userName);

                // Broadcast upvote update to all users in the session
                const { Message } = require("../models/MessageModel");
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
        }
    };
};
