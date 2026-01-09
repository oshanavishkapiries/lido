const mongoose = require("mongoose");

/**
 * User Schema
 * Represents authenticated users who can create and manage sessions
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sessions: [{
        type: String, // Session IDs
        ref: 'Session'
    }]
});

// Index for faster email lookups
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

module.exports = { User };
