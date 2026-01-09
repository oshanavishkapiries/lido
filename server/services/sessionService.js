const { Session } = require("../models/MessageModel");
const generateUniqueId = require("../utils/generateId");

class SessionService {
  async createSession(sessionName, hostName, settings = {}, hostId = null, hostEmail = null) {
    const sessionId = generateUniqueId();

    const defaultSettings = {
      allowAnonymous: true,
      maxParticipants: 100,
      enablePolls: true,
      enableQA: true,
      enableReactions: true,
      ...settings
    };

    const newSession = new Session({
      sessionName,
      sessionId,
      hostName,
      hostId, // NEW: User ID of host
      hostEmail, // NEW: Email of host
      settings: defaultSettings,
      participants: [{
        userId: hostId, // NEW: Link participant to user
        name: hostName,
        email: hostEmail, // NEW: Add email
        joinedAt: new Date(),
        isActive: true,
        lastSeen: new Date()
      }],
      createdAt: new Date(),
      isActive: true
    });

    return await newSession.save();
  }

  async getSessionById(sessionId) {
    const session = await Session.findOne({ sessionId });
    return session;
  }

  async endSession(sessionId) {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    session.isActive = false;
    session.endedAt = new Date();

    // Mark all participants as inactive
    session.participants.forEach(participant => {
      participant.isActive = false;
    });

    return await session.save();
  }

  async addParticipant(sessionId, participantName) {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.isActive) {
      throw new Error('Session is not active');
    }

    // Check if participant already exists
    const existingParticipant = session.participants.find(
      p => p.name === participantName && p.isActive
    );

    if (existingParticipant) {
      // Update last seen
      existingParticipant.lastSeen = new Date();
    } else {
      // Check max participants limit
      const activeParticipants = session.participants.filter(p => p.isActive);
      if (activeParticipants.length >= session.settings.maxParticipants) {
        throw new Error('Session has reached maximum participants');
      }

      // Add new participant
      session.participants.push({
        name: participantName,
        joinedAt: new Date(),
        isActive: true,
        lastSeen: new Date()
      });
    }

    return await session.save();
  }

  async removeParticipant(sessionId, participantName) {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.participants.find(
      p => p.name === participantName && p.isActive
    );

    if (participant) {
      participant.isActive = false;
      participant.lastSeen = new Date();
    }

    return await session.save();
  }

  async getActiveParticipants(sessionId) {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    return session.participants.filter(p => p.isActive);
  }

  async updateSessionSettings(sessionId, settings) {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    session.settings = {
      ...session.settings,
      ...settings
    };

    return await session.save();
  }

  async updateParticipantLastSeen(sessionId, participantName) {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.participants.find(
      p => p.name === participantName && p.isActive
    );

    if (participant) {
      participant.lastSeen = new Date();
      await session.save();
    }

    return session;
  }
}

module.exports = new SessionService();
