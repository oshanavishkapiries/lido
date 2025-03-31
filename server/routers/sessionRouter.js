const express = require("express");
const {
  createSession,
  getSessionById,
  endSession,
} = require("../controller/sessionController");

const router = express.Router();

router.post("/create", createSession);

router.get("/:sessionId", getSessionById);

router.put("/:sessionId/end", endSession);

module.exports = router;
