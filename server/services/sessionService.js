const { Session } = require("../models/MessageModel");
const generateUniqueId = require("../utils/generateId");

class SessionService {
  async createSession(sessionName) {
    const sessionId = generateUniqueId();
    const newSession = new Session({
      sessionName,
      sessionId,
      status: "active",
      createdAt: new Date(),
      lastActive: new Date(),
    });
    return await newSession.save();
  }

  async getSessionById(sessionId) {
    const session = await Session.findOne({ sessionId });
    return session;
  }

  async endSession(sessionId) {
    const session = await Session.findOne({ sessionId });
    session.isActive = false;
    return await session.save();
  }
}

module.exports = new SessionService();
