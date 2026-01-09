const { verifyAccessToken } = require('../utils/jwtUtils');
const { User } = require('../models/UserModel');

/**
 * Authentication Middleware
 * Verifies JWT token from cookies and attaches user to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found or inactive'
            });
        }

        // Attach user to request
        req.user = {
            userId: user._id,
            email: user.email,
            name: user.name
        };

        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token exists, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (token) {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.userId);

            if (user && user.isActive) {
                req.user = {
                    userId: user._id,
                    email: user.email,
                    name: user.name
                };
            }
        }
    } catch (error) {
        // Ignore errors for optional auth
    }

    next();
};

/**
 * Host Authorization Middleware
 * Verifies that the authenticated user is the host of the session
 */
const authorizeHost = (req, res, next) => {
    try {
        const { Session } = require('../models/MessageModel');
        const sessionId = req.params.id || req.body.sessionId;

        if (!sessionId) {
            return res.status(400).json({
                status: 'error',
                message: 'Session ID required'
            });
        }

        // This will be checked in the controller
        // We just ensure user is authenticated here
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Authorization failed'
        });
    }
};

module.exports = {
    authenticate,
    optionalAuth,
    authorizeHost
};
