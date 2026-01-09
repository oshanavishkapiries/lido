const { User } = require('../models/UserModel');
const { MagicLink } = require('../models/MagicLinkModel');
const { generateAccessToken, generateRefreshToken, generateMagicLinkToken, hashToken, verifyRefreshToken } = require('../utils/jwtUtils');
const { sendMagicLinkEmail } = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../logger');

/**
 * Request Magic Link
 * POST /api/v1/auth/request-magic-link
 */
const requestMagicLink = catchAsync(async (req, res, next) => {
    const { email, name } = req.body;

    if (!email) {
        return next(new AppError('Email is required', 400));
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        // Create new user if doesn't exist
        if (!name) {
            return next(new AppError('Name is required for new users', 400));
        }

        user = await User.create({
            email: email.toLowerCase(),
            name: name.trim()
        });

        logger.info(`New user created: ${email}`);
    } else {
        // Update last login attempt
        user.lastLoginAt = new Date();
        await user.save();
    }

    // Generate magic link token
    const token = generateMagicLinkToken();
    const hashedToken = hashToken(token);

    // Save magic link to database
    await MagicLink.create({
        userId: user._id,
        email: user.email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        used: false
    });

    // Create magic link URL
    const magicLinkUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

    // Send email
    await sendMagicLinkEmail(user.email, user.name, magicLinkUrl);

    res.status(200).json({
        status: 'success',
        message: 'Magic link sent to your email',
        data: {
            email: user.email
        }
    });
});

/**
 * Verify Magic Link and Login
 * GET /api/v1/auth/verify/:token
 */
const verifyMagicLink = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    if (!token) {
        return next(new AppError('Token is required', 400));
    }

    // Hash the token to compare with database
    const hashedToken = hashToken(token);

    // Find magic link
    const magicLink = await MagicLink.findOne({
        token: hashedToken,
        used: false,
        expiresAt: { $gt: new Date() }
    });

    if (!magicLink) {
        return next(new AppError('Invalid or expired magic link', 401));
    }

    // Get user
    const user = await User.findById(magicLink.userId);

    if (!user || !user.isActive) {
        return next(new AppError('User not found or inactive', 401));
    }

    // Mark magic link as used
    magicLink.used = true;
    await magicLink.save();

    // Update user last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT tokens
    const accessToken = generateAccessToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Set cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        }
    });
});

/**
 * Refresh Access Token
 * POST /api/v1/auth/refresh
 */
const refreshAccessToken = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return next(new AppError('Refresh token required', 401));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
        return next(new AppError('User not found or inactive', 401));
    }

    // Generate new access token
    const accessToken = generateAccessToken({ userId: user._id, email: user.email });

    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully'
    });
});

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = catchAsync(async (req, res, next) => {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

/**
 * Get Current User
 * GET /api/v1/auth/me
 */
const getCurrentUser = catchAsync(async (req, res, next) => {
    // User is already attached by authenticate middleware
    const user = await User.findById(req.user.userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        }
    });
});

module.exports = {
    requestMagicLink,
    verifyMagicLink,
    refreshAccessToken,
    logout,
    getCurrentUser
};
