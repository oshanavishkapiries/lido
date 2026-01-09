const mongoose = require('mongoose');
const { Schema } = mongoose;

// Session Schema
const sessionSchema = new Schema({
  sessionName: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  hostName: { type: String, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // NEW: Reference to User
  hostEmail: { type: String, required: true }, // NEW: Host email for quick access
  isActive: { type: Boolean, default: true },
  settings: {
    allowAnonymous: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 100 },
    enablePolls: { type: Boolean, default: true },
    enableQA: { type: Boolean, default: true },
    enableReactions: { type: Boolean, default: true }
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // NEW: null for guests
    name: { type: String, required: true },
    email: { type: String }, // NEW: null for guests
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
});

// Add indexes for better query performance
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ isActive: 1 });

const Session = mongoose.model('Session', sessionSchema);

// Message Schema
const messageSchema = new Schema({
  sessionId: { type: String, required: true, ref: 'Session' },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['message', 'question', 'announcement'],
    default: 'message'
  },
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: String }] // Array of usernames who reacted
  }],
  upvotes: {
    count: { type: Number, default: 0 },
    users: [{ type: String }] // Array of usernames who upvoted
  },
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: String },
  deletedAt: { type: Date },
  timestamp: { type: Date, default: Date.now }
});

// Add indexes for better query performance
messageSchema.index({ sessionId: 1, timestamp: -1 });
messageSchema.index({ isDeleted: 1 });

const Message = mongoose.model('Message', messageSchema);

// Poll Schema
const pollSchema = new Schema({
  sessionId: { type: String, required: true, ref: 'Session' },
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: [{
      userName: { type: String, required: true },
      votedAt: { type: Date, default: Date.now }
    }]
  }],
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  allowMultipleVotes: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  closedAt: { type: Date }
});

// Add indexes
pollSchema.index({ sessionId: 1, isActive: 1 });
pollSchema.index({ expiresAt: 1 });

const Poll = mongoose.model('Poll', pollSchema);

module.exports = { Session, Message, Poll };