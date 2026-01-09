const express = require("express");
const {
    getMessages,
    deleteMessage,
    addReaction,
    removeReaction,
    upvoteMessage,
    removeUpvote
} = require("../controller/messageController");

const router = express.Router();

// Get messages for a session with pagination
router.get("/:sessionId", getMessages);

// Delete a message
router.delete("/:messageId", deleteMessage);

// Add reaction to a message
router.post("/:messageId/reaction", addReaction);

// Remove reaction from a message
router.delete("/:messageId/reaction", removeReaction);

// Upvote a message
router.post("/:messageId/upvote", upvoteMessage);

// Remove upvote from a message
router.delete("/:messageId/upvote", removeUpvote);

module.exports = router;
