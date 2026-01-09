const { Poll } = require("../models/MessageModel");

class PollService {
    async createPoll(sessionId, question, options, createdBy, duration = null) {
        const pollOptions = options.map(optionText => ({
            text: optionText,
            votes: []
        }));

        const expiresAt = duration ? new Date(Date.now() + duration * 60000) : null;

        const newPoll = new Poll({
            sessionId,
            question,
            options: pollOptions,
            createdBy,
            isActive: true,
            allowMultipleVotes: false,
            createdAt: new Date(),
            expiresAt
        });

        return await newPoll.save();
    }

    async vote(pollId, optionIndex, userName) {
        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        if (!poll.isActive) {
            throw new Error('Poll is not active');
        }

        // Check if poll has expired
        if (poll.expiresAt && new Date() > poll.expiresAt) {
            poll.isActive = false;
            poll.closedAt = new Date();
            await poll.save();
            throw new Error('Poll has expired');
        }

        // Check if option index is valid
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            throw new Error('Invalid option index');
        }

        // Check if user already voted
        if (!poll.allowMultipleVotes) {
            const hasVoted = poll.options.some(option =>
                option.votes.some(vote => vote.userName === userName)
            );

            if (hasVoted) {
                throw new Error('User has already voted');
            }
        }

        // Add vote
        poll.options[optionIndex].votes.push({
            userName,
            votedAt: new Date()
        });

        return await poll.save();
    }

    async getPollResults(pollId) {
        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        const results = {
            pollId: poll._id,
            question: poll.question,
            isActive: poll.isActive,
            totalVotes: poll.options.reduce((sum, opt) => sum + opt.votes.length, 0),
            options: poll.options.map(option => ({
                text: option.text,
                voteCount: option.votes.length,
                percentage: 0 // Will calculate below
            })),
            createdBy: poll.createdBy,
            createdAt: poll.createdAt,
            expiresAt: poll.expiresAt,
            closedAt: poll.closedAt
        };

        // Calculate percentages
        if (results.totalVotes > 0) {
            results.options.forEach(option => {
                option.percentage = ((option.voteCount / results.totalVotes) * 100).toFixed(2);
            });
        }

        return results;
    }

    async getActivePolls(sessionId) {
        const polls = await Poll.find({
            sessionId,
            isActive: true
        }).sort({ createdAt: -1 });

        // Check for expired polls and close them
        const now = new Date();
        for (const poll of polls) {
            if (poll.expiresAt && now > poll.expiresAt) {
                poll.isActive = false;
                poll.closedAt = now;
                await poll.save();
            }
        }

        return polls.filter(p => p.isActive);
    }

    async getAllPolls(sessionId) {
        return await Poll.find({ sessionId }).sort({ createdAt: -1 });
    }

    async closePoll(pollId) {
        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        poll.isActive = false;
        poll.closedAt = new Date();

        return await poll.save();
    }

    async hasUserVoted(pollId, userName) {
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return false;
        }

        return poll.options.some(option =>
            option.votes.some(vote => vote.userName === userName)
        );
    }
}

module.exports = new PollService();
