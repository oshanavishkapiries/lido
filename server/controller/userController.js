const { User } = require('../models/UserModel');
const { Session } = require('../models/MessageModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get User Profile
 * GET /api/v1/users/profile
 */
const getProfile = catchAsync(async (req, res, next) => {
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
                lastLoginAt: user.lastLoginAt,
                sessionsCount: user.sessions.length
            }
        }
    });
});

/**
 * Update User Profile
 * PUT /api/v1/users/profile
 */
const updateProfile = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return next(new AppError('Name is required', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { name: name.trim() },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
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
 * Get User's Sessions
 * GET /api/v1/users/sessions
 */
const getUserSessions = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Get all sessions created by this user
    const sessions = await Session.find({
        hostId: user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        data: {
            sessions: sessions.map(session => ({
                id: session.sessionId,
                name: session.sessionName,
                isActive: session.isActive,
                participantCount: session.participants.filter(p => p.isActive).length,
                createdAt: session.createdAt,
                endedAt: session.endedAt
            }))
        }
    });
});

module.exports = {
    getProfile,
    updateProfile,
    getUserSessions
};
