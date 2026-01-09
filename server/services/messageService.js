const { Message } = require("../models/MessageModel");

class MessageService {
    async createMessage(sessionId, senderName, content, type = 'message') {
        const newMessage = new Message({
            sessionId,
            senderName,
            content,
            type,
            reactions: [],
            upvotes: {
                count: 0,
                users: []
            },
            isDeleted: false,
            timestamp: new Date()
        });

        return await newMessage.save();
    }

    async getMessages(sessionId, limit = 50, offset = 0) {
        const messages = await Message.find({
            sessionId,
            isDeleted: false
        })
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit);

        return messages;
    }

    async getAllMessages(sessionId) {
        const messages = await Message.find({
            sessionId,
            isDeleted: false
        }).sort({ timestamp: -1 });

        return messages;
    }

    async deleteMessage(messageId, deletedBy) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        message.isDeleted = true;
        message.deletedBy = deletedBy;
        message.deletedAt = new Date();

        return await message.save();
    }

    async addReaction(messageId, emoji, userName) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        // Find existing reaction with this emoji
        const existingReaction = message.reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
            // Check if user already reacted with this emoji
            if (!existingReaction.users.includes(userName)) {
                existingReaction.users.push(userName);
            }
        } else {
            // Add new reaction
            message.reactions.push({
                emoji,
                users: [userName]
            });
        }

        return await message.save();
    }

    async removeReaction(messageId, emoji, userName) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        const reaction = message.reactions.find(r => r.emoji === emoji);
        if (reaction) {
            reaction.users = reaction.users.filter(u => u !== userName);

            // Remove reaction if no users left
            if (reaction.users.length === 0) {
                message.reactions = message.reactions.filter(r => r.emoji !== emoji);
            }
        }

        return await message.save();
    }

    async upvoteMessage(messageId, userName) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        // Check if user already upvoted
        if (!message.upvotes.users.includes(userName)) {
            message.upvotes.users.push(userName);
            message.upvotes.count = message.upvotes.users.length;
        }

        return await message.save();
    }

    async removeUpvote(messageId, userName) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        message.upvotes.users = message.upvotes.users.filter(u => u !== userName);
        message.upvotes.count = message.upvotes.users.length;

        return await message.save();
    }

    async getMessageCount(sessionId) {
        return await Message.countDocuments({
            sessionId,
            isDeleted: false
        });
    }
}

module.exports = new MessageService();
