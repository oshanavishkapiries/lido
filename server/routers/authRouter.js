const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiter for magic link requests (3 per hour per IP)
const magicLinkLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many magic link requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Auth Routes
 */

// Request magic link (public)
router.post('/request-magic-link', magicLinkLimiter, authController.requestMagicLink);

// Verify magic link (public)
router.get('/verify/:token', authController.verifyMagicLink);

// Refresh access token (public, requires refresh token cookie)
router.post('/refresh', authController.refreshAccessToken);

// Logout (requires authentication)
router.post('/logout', authenticate, authController.logout);

// Get current user (requires authentication)
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
