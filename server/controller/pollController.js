const catchAsync = require("../utils/catchAsync");
const { sendResponse, sendError } = require("../utils/responseHandler");
const pollService = require("../services/pollService");

const createPoll = catchAsync(async (req, res, next) => {
    try {
        const { sessionId, question, options, createdBy, duration } = req.body;

        if (!sessionId || !question || !options || !createdBy) {
            return sendError(res, 400, "sessionId, question, options, and createdBy are required");
        }

        if (!Array.isArray(options) || options.length < 2) {
            return sendError(res, 400, "At least 2 options are required");
        }

        const poll = await pollService.createPoll(
            sessionId,
            question,
            options,
            createdBy,
            duration
        );

        sendResponse(res, 201, poll, "Poll created successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const vote = catchAsync(async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const { optionIndex, userName } = req.body;

        if (optionIndex === undefined || !userName) {
            return sendError(res, 400, "optionIndex and userName are required");
        }

        const poll = await pollService.vote(pollId, optionIndex, userName);
        sendResponse(res, 200, poll, "Vote recorded successfully");
    } catch (error) {
        if (error.message === 'User has already voted' || error.message === 'Poll has expired') {
            return sendError(res, 400, error.message);
        }
        sendError(res, 500, error.message);
    }
});

const getResults = catchAsync(async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const results = await pollService.getPollResults(pollId);
        sendResponse(res, 200, results, "Poll results fetched successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const getActivePolls = catchAsync(async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const polls = await pollService.getActivePolls(sessionId);
        sendResponse(res, 200, polls, "Active polls fetched successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const getAllPolls = catchAsync(async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const polls = await pollService.getAllPolls(sessionId);
        sendResponse(res, 200, polls, "All polls fetched successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

const closePoll = catchAsync(async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const poll = await pollService.closePoll(pollId);
        sendResponse(res, 200, poll, "Poll closed successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
});

module.exports = {
    createPoll,
    vote,
    getResults,
    getActivePolls,
    getAllPolls,
    closePoll
};
