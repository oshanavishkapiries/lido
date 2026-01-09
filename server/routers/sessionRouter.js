const express = require("express");
const {
  createSession,
  getSessionById,
  endSession,
  addParticipant,
  removeParticipant,
  getParticipants,
  updateSettings
} = require("../controller/sessionController");
const { authenticate, authorizeHost } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Session Routes
 */

// Create session (requires authentication)
router.post("/create", authenticate, createSession);

// Get session by ID (public)
router.get("/:sessionId", getSessionById);

// End session (requires authentication + host authorization)
router.delete("/:sessionId", authenticate, endSession);

// Add participant (public - used by Socket.io)
router.post("/:sessionId/join", addParticipant);

// Remove participant (requires authentication + host authorization)
router.delete("/:sessionId/participants", authenticate, removeParticipant);

// Get participants (public)
router.get("/:sessionId/participants", getParticipants);

// Update settings (requires authentication + host authorization)
router.put("/:sessionId/settings", authenticate, updateSettings);

module.exports = router;
