const mongoose = require('mongoose');
const { Schema } = mongoose;

// Session Schema
const sessionSchema = new Schema({
  hostName: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);

// User Schema
const userSchema = new Schema({
  sessionId: { type: String, required: true, ref: 'Session' },
  userName: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new Schema({
  sessionId: { type: String, required: true, ref: 'Session' },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Session, User, Message };