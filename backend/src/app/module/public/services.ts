import mongoose from 'mongoose';
import ApiError from '../../common/utils/ApiError.js';
import { Poll, Question } from '../poll/model.js';

const normalizeQuestion = (question: any) => ({
    id: String(question._id),
    question: question.question,
    questionNumber: question.questionNumber,
    options: Array.isArray(question.options)
        ? question.options
            .slice()
            .sort((a: any, b: any) => a.order - b.order)
            .map((option: any) => ({
                id: String(option._id),
                text: option.text,
                order: option.order,
                votes: option.votes ?? 0,
            }))
        : [],
});

export const getPublicPollSnapshotByShareCode = async (shareCode: string) => {
    const poll = await Poll.findOne({ shareCode }).lean();

    if (!poll) {
        throw new ApiError(404, 'Poll not found');
    }

    const questions = await Question.find({ pollId: poll._id })
        .sort({ questionNumber: 1 })
        .lean();

    return {
        poll: {
            id: String(poll._id),
            pollName: poll.pollName,
            pollDescription: poll.pollDescription,
            pollDurationInMinutes: poll.pollDurationInMinutes,
            pollStartTime: poll.pollStartTime,
            pollEndTime: poll.pollEndTime,
            isAnonymousAllowed: poll.isAnonymousAllowed,
            shareCode: poll.shareCode,
            status: poll.status,
        },
        questions: questions.map((question) => {
            const normalized = normalizeQuestion(question);
            return {
                ...normalized,
                options: normalized.options.map((option: { id: string; text: string; order: number; votes: number }) => ({
                    id: option.id,
                    text: option.text,
                    order: option.order,
                })),
            };
        }),
    };
};

export const getPublicAnalyticsSnapshotByCode = async (analyticsCode: string) => {
    const poll = await Poll.findOne({ analyticsCode }).lean();

    if (!poll) {
        throw new ApiError(404, 'Poll not found');
    }

    const questions = await Question.find({ pollId: poll._id })
        .sort({ questionNumber: 1 })
        .lean();

    return {
        poll: {
            id: String(poll._id),
            pollName: poll.pollName,
            pollDescription: poll.pollDescription,
            pollDurationInMinutes: poll.pollDurationInMinutes,
            pollStartTime: poll.pollStartTime,
            pollEndTime: poll.pollEndTime,
            isAnonymousAllowed: poll.isAnonymousAllowed,
            analyticsCode: poll.analyticsCode,
            shareCode: poll.shareCode,
            status: poll.status,
            totalVotes: poll.totalVotes,
            totalParticipants: poll.totalParticipants,
        },
        questions: questions.map((question) => normalizeQuestion(question)),
    };
};

export const ensureObjectId = (value: string, label: string) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new ApiError(400, `${label} is invalid`);
    }
};
