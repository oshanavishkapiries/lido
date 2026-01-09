const catchAsync = require("../utils/catchAsync");
const { sendResponse, sendError } = require("../utils/responseHandler");
const messageService = require("../services/messageService");

const getMessages = catchAsync(async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await messageService.getMessages(
            sessionId,
            parseInt(limit),
            parseInt(offset)
        );

        const totalCount = await messageService.getMessageCount(sessionId);

        sendResponse(
            res,
            200,
            {
                messages,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: totalCount
                }
            },
            "Messages fetched successfully"
        );
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const deleteMessage = catchAsync(async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { deletedBy } = req.body;

        if (!deletedBy) {
            return sendError(res, 400, "deletedBy is required");
        }

        await messageService.deleteMessage(messageId, deletedBy);
        sendResponse(res, 200, null, "Message deleted successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const addReaction = catchAsync(async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { emoji, userName } = req.body;

        if (!emoji || !userName) {
            return sendError(res, 400, "emoji and userName are required");
        }

        const message = await messageService.addReaction(messageId, emoji, userName);
        sendResponse(res, 200, message, "Reaction added successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const removeReaction = catchAsync(async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { emoji, userName } = req.body;

        if (!emoji || !userName) {
            return sendError(res, 400, "emoji and userName are required");
        }

        const message = await messageService.removeReaction(messageId, emoji, userName);
        sendResponse(res, 200, message, "Reaction removed successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const upvoteMessage = catchAsync(async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { userName } = req.body;

        if (!userName) {
            return sendError(res, 400, "userName is required");
        }

        const message = await messageService.upvoteMessage(messageId, userName);
        sendResponse(res, 200, message, "Message upvoted successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const removeUpvote = catchAsync(async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { userName } = req.body;

        if (!userName) {
            return sendError(res, 400, "userName is required");
        }

        const message = await messageService.removeUpvote(messageId, userName);
        sendResponse(res, 200, message, "Upvote removed successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

module.exports = {
    getMessages,
    deleteMessage,
    addReaction,
    removeReaction,
    upvoteMessage,
    removeUpvote
};
