const { Session } = require("../models/MessageModel");
const generateUniqueId = require("../utils/generateId");

class SessionService {
  async createSession(hostName) {
    const sessionId = generateUniqueId();
    const newSession = new Session({
      hostName,
      sessionId,
      status: "active",
      createdAt: new Date(),
      lastActive: new Date(),
    });
    return await newSession.save();
  }
}

module.exports = new SessionService();
