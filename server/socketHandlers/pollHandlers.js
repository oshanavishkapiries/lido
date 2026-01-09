/**
 * Poll-related socket event handlers
 */
const pollService = require("../services/pollService");
const logger = require("../logger");

module.exports = (io) => {
    return {
        /**
         * Handle creating a poll
         */
        handleCreatePoll: async (socket, data) => {
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
        },

        /**
         * Handle voting on a poll
         */
        handleVotePoll: async (socket, data) => {
            try {
                const { pollId, optionIndex, userName } = data;

                if (pollId === undefined || optionIndex === undefined || !userName) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                await pollService.vote(pollId, optionIndex, userName);
                const results = await pollService.getPollResults(pollId);

                // Get session ID from poll
                const pollDoc = await require("../models/MessageModel").Poll.findById(pollId);
                if (pollDoc) {
                    io.to(pollDoc.sessionId).emit("poll-updated", results);
                }

                logger.info(`Vote recorded for poll ${pollId} by ${userName}`);
            } catch (error) {
                logger.error(`Error voting on poll: ${error.message}`);
                socket.emit("error", { message: error.message });
            }
        }
    };
};
