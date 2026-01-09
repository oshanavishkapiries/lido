const catchAsync = require("../utils/catchAsync");
const { sendResponse, sendError } = require("../utils/responseHandler");
const sessionService = require("../services/sessionService");
const AppError = require("../utils/AppError");

/**
 * Create Session (Requires Authentication)
 * POST /api/v1/session/create
 */
const createSession = catchAsync(async (req, res, next) => {
  try {
    const { sessionName, settings } = req.body;
    const user = req.user; // From authenticate middleware

    if (!sessionName) {
      return sendError(res, 400, "Session name is required");
    }

    // Create session with authenticated user as host
    const session = await sessionService.createSession(
      sessionName,
      user.name, // hostName
      settings,
      user.userId, // hostId
      user.email // hostEmail
    );

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

/**
 * Get Session By ID (Public)
 * GET /api/v1/session/:sessionId
 */
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

/**
 * End Session (Host Only)
 * DELETE /api/v1/session/:sessionId
 */
const endSession = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    // Get session to verify host
    const session = await sessionService.getSessionById(sessionId);

    if (!session) {
      return sendError(res, 404, "Session not found");
    }

    // Check if user is the host
    if (session.hostId.toString() !== user.userId.toString()) {
      return sendError(res, 403, "Only the host can end the session");
    }

    await sessionService.endSession(sessionId);
    sendResponse(res, 200, null, "Session ended successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

/**
 * Add Participant (Public - via Socket.io)
 * This is kept for backward compatibility
 */
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

/**
 * Remove Participant (Host Only)
 * DELETE /api/v1/session/:sessionId/participants
 */
const removeParticipant = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { participantName } = req.body;
    const user = req.user;

    if (!participantName) {
      return sendError(res, 400, "Participant name is required");
    }

    // Get session to verify host
    const session = await sessionService.getSessionById(sessionId);

    if (!session) {
      return sendError(res, 404, "Session not found");
    }

    // Check if user is the host
    if (session.hostId.toString() !== user.userId.toString()) {
      return sendError(res, 403, "Only the host can remove participants");
    }

    await sessionService.removeParticipant(sessionId, participantName);
    sendResponse(res, 200, null, "Participant removed successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

/**
 * Get Participants (Public)
 * GET /api/v1/session/:sessionId/participants
 */
const getParticipants = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const participants = await sessionService.getActiveParticipants(sessionId);
    sendResponse(res, 200, participants, "Participants fetched successfully");
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

/**
 * Update Settings (Host Only)
 * PUT /api/v1/session/:sessionId/settings
 */
const updateSettings = catchAsync(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { settings } = req.body;
    const user = req.user;

    if (!settings) {
      return sendError(res, 400, "Settings are required");
    }

    // Get session to verify host
    const session = await sessionService.getSessionById(sessionId);

    if (!session) {
      return sendError(res, 404, "Session not found");
    }

    // Check if user is the host
    if (session.hostId.toString() !== user.userId.toString()) {
      return sendError(res, 403, "Only the host can update settings");
    }

    const updatedSession = await sessionService.updateSessionSettings(sessionId, settings);
    sendResponse(res, 200, updatedSession.settings, "Settings updated successfully");
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
