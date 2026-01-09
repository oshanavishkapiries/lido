const mongoose = require("mongoose");

/**
 * MagicLink Schema
 * Stores magic link tokens for passwordless authentication
 */
const magicLinkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    used: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster token lookups
magicLinkSchema.index({ token: 1 });
magicLinkSchema.index({ expiresAt: 1 });

// Auto-delete expired tokens after 24 hours
magicLinkSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const MagicLink = mongoose.model("MagicLink", magicLinkSchema);

module.exports = { MagicLink };
