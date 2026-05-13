import type { Types } from 'mongoose';
import ApiError from '../../common/utils/ApiError.js';
import Vote from './model.js';
import { Poll, Question } from '../poll/model.js';
import { getPollVoteStats, getPublicAnalyticsSnapshotByCode, getPublicPollSnapshotByShareCode } from '../public/services.js';
import { emitPublicAnalyticsUpdate, emitPublicPollUpdate } from '../../common/socket.js';

type SubmitSocketVoteInput = {
    pollId: string;
    questionId: string;
    optionId: string;
    userId?: Types.ObjectId;
    userFingerPrint?: string;
    firstName?: string;
    lastName?: string;
};

export const submitSocketVoteService = async ({
    pollId,
    questionId,
    optionId,
    userId,
    userFingerPrint,
    firstName,
    lastName,
}: SubmitSocketVoteInput) => {
    const poll = await Poll.findById(pollId);

    if (!poll) {
        throw new ApiError(404, 'Poll not found');
    }

    if (poll.status !== 'active') {
        throw new ApiError(400, 'Poll is not active');
    }

    if (poll.pollEndTime && poll.pollEndTime.getTime() < Date.now()) {
        poll.status = 'ended';
        await poll.save();
        throw new ApiError(400, 'Poll has ended');
    }

    if (!userId && !poll.isAnonymousAllowed) {
        throw new ApiError(403, 'Anonymous voting is not allowed for this poll');
    }

    const question = await Question.findOne({ _id: questionId, pollId: poll._id });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    const selectedOption = (question.options as any[]).find((option) => String(option._id) === optionId);

    if (!selectedOption) {
        throw new ApiError(404, 'Option not found');
    }

    const existingQuestionVote = await Vote.collection.findOne({
        pollId: poll._id,
        questionId: question._id,
        ...(userId ? { userId } : { userFingerPrint }),
    });

    if (existingQuestionVote) {
        throw new ApiError(409, 'This participant has already answered this question');
    }

    const vote = await Vote.create({
        pollId: poll._id,
        questionId: question._id,
        optionId,
        userId: userId ?? null,
        userFingerPrint: userFingerPrint ?? null,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
    });

    selectedOption.votes = (selectedOption.votes ?? 0) + 1;
    await question.save();

    const voteStats = await getPollVoteStats(poll._id);
    poll.totalVotes = voteStats.totalVotes;
    poll.totalParticipants = voteStats.totalParticipants;

    await poll.save();

    const [pollSnapshot, analyticsSnapshot] = await Promise.all([
        getPublicPollSnapshotByShareCode(poll.shareCode),
        getPublicAnalyticsSnapshotByCode(poll.analyticsCode),
    ]);

    emitPublicPollUpdate(poll.shareCode, pollSnapshot);
    emitPublicAnalyticsUpdate(poll.analyticsCode, analyticsSnapshot);

    return {
        vote,
        pollSnapshot,
        analyticsSnapshot,
    };
};
