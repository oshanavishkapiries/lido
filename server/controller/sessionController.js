const catchAsync = require("../utils/catchAsync");
const { sendResponse, sendError } = require("../utils/responseHandler");
const sessionService = require("../services/sessionService");

const createSession = catchAsync(async (req, res, next) => {
  try {
    const { sessionName } = req.body;
    if (!sessionName) {
      return sendError(res, 400, "Host name is required");
    }

    const session = await sessionService.createSession(sessionName);
    sendResponse(
      res,
      201,
      { sessionId: session.sessionId },
      "Session created successfully"
    );
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

const getSessionById = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionService.getSessionById(sessionId);
    sendResponse(res, 200, session, "Session fetched successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

const endSession = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await sessionService.endSession(sessionId);
    sendResponse(res, 200, null, "Session ended successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

module.exports = {
  createSession,
  getSessionById,
  endSession,
};
