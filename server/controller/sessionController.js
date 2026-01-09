const catchAsync = require("../utils/catchAsync");
const { sendResponse, sendError } = require("../utils/responseHandler");
const sessionService = require("../services/sessionService");

const createSession = catchAsync(async (req, res, next) => {
  try {
    const { sessionName, hostName, settings } = req.body;

    if (!sessionName) {
      return sendError(res, 400, "Session name is required");
    }

    if (!hostName) {
      return sendError(res, 400, "Host name is required");
    }

    const session = await sessionService.createSession(sessionName, hostName, settings);
    sendResponse(
      res,
      201,
      {
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        hostName: session.hostName,
        settings: session.settings
      },
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

    if (!session) {
      return sendError(res, 404, "Session not found");
    }

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

const addParticipant = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { participantName } = req.body;

    if (!participantName) {
      return sendError(res, 400, "Participant name is required");
    }

    const session = await sessionService.addParticipant(sessionId, participantName);
    sendResponse(res, 200, session, "Participant added successfully");
  } catch (error) {
    if (error.message === 'Session has reached maximum participants') {
      return sendError(res, 403, error.message);
    }
    sendError(res, 500, error.message);
  }
});

const removeParticipant = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { participantName } = req.body;

    if (!participantName) {
      return sendError(res, 400, "Participant name is required");
    }

    await sessionService.removeParticipant(sessionId, participantName);
    sendResponse(res, 200, null, "Participant removed successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

const getParticipants = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const participants = await sessionService.getActiveParticipants(sessionId);
    sendResponse(res, 200, participants, "Participants fetched successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

const updateSettings = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { settings } = req.body;

    if (!settings) {
      return sendError(res, 400, "Settings are required");
    }

    const session = await sessionService.updateSessionSettings(sessionId, settings);
    sendResponse(res, 200, session.settings, "Settings updated successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

module.exports = {
  createSession,
  getSessionById,
  endSession,
  addParticipant,
  removeParticipant,
  getParticipants,
  updateSettings
};

