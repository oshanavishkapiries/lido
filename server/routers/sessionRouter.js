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

const router = express.Router();

router.post("/create", createSession);

router.get("/:sessionId", getSessionById);

router.put("/:sessionId/end", endSession);

router.post("/:sessionId/join", addParticipant);

router.post("/:sessionId/leave", removeParticipant);

router.get("/:sessionId/participants", getParticipants);

router.put("/:sessionId/settings", updateSettings);

module.exports = router;

