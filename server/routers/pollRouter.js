const express = require("express");
const {
    createPoll,
    vote,
    getResults,
    getActivePolls,
    getAllPolls,
    closePoll
} = require("../controller/pollController");

const router = express.Router();

// Create a new poll
router.post("/", createPoll);

// Vote on a poll
router.post("/:pollId/vote", vote);

// Get poll results
router.get("/:pollId/results", getResults);

// Get active polls for a session
router.get("/session/:sessionId/active", getActivePolls);

// Get all polls for a session
router.get("/session/:sessionId", getAllPolls);

// Close a poll
router.put("/:pollId/close", closePoll);

module.exports = router;
