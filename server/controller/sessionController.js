const catchAsync = require("../utils/catchAsync");
const { sendResponse, sendError } = require("../utils/responseHandler");
const sessionService = require("../services/sessionService");

const createSession = catchAsync(async (req, res, next) => {
  try {
    const { hostName } = req.body;
    if (!hostName) {
      return sendError(res, 400, "Host name is required");
    }

    const session = await sessionService.createSession(hostName);
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

module.exports = {
  createSession,
};
