const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * User Routes (all require authentication)
 */

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.put('/profile', authenticate, userController.updateProfile);

// Get user's sessions
router.get('/sessions', authenticate, userController.getUserSessions);

module.exports = router;
