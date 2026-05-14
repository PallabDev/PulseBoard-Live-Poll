import mongoose from 'mongoose';
import ApiError from '../../common/utils/ApiError.js';
import { Poll, Question } from '../poll/model.js';
import Vote from '../vote/model.js';
import { sanitizeRichText } from '../../common/utils/sanitizeHtml.js';

const normalizeQuestion = (question: any) => ({
    id: String(question._id),
    question: sanitizeRichText(question.question),
    questionNumber: question.questionNumber,
    isRequired: question.isRequired ?? true,
    options: Array.isArray(question.options)
        ? question.options
            .slice()
            .sort((a: any, b: any) => a.order - b.order)
            .map((option: any) => ({
                id: String(option._id),
                text: sanitizeRichText(option.text),
                order: option.order,
                votes: option.votes ?? 0,
            }))
        : [],
});

export const getPollVoteStats = async (pollId: mongoose.Types.ObjectId) => {
    const votes = await Vote.collection.find({ pollId }, {
        projection: {
            userId: 1,
            userFingerPrint: 1,
        },
    }).toArray();
    const participantKeys = new Set<string>();

    for (const vote of votes) {
        if (vote.userId) {
            participantKeys.add(`user:${String(vote.userId)}`);
        } else if (vote.userFingerPrint) {
            participantKeys.add(`anonymous:${vote.userFingerPrint}`);
        }
    }

    return {
        totalVotes: votes.length,
        totalParticipants: participantKeys.size,
    };
};

const expirePollIfNeeded = async (poll: any) => {
    if (poll.status === 'active' && poll.pollEndTime && poll.pollEndTime.getTime() <= Date.now()) {
        await Poll.updateOne({ _id: poll._id }, { $set: { status: 'ended' } });
        poll.status = 'ended';
    }
};

export const getPublicPollSnapshotByShareCode = async (shareCode: string, viewerUserId?: mongoose.Types.ObjectId) => {
    const poll = await Poll.findOne({ shareCode }).lean();

    if (!poll) {
        throw new ApiError(404, 'Poll not found');
    }

    await expirePollIfNeeded(poll);

    const questions = await Question.find({ pollId: poll._id })
        .sort({ questionNumber: 1 })
        .lean();
    const isExpired = poll.status === 'ended' || Boolean(poll.pollEndTime && poll.pollEndTime.getTime() <= Date.now());
    const shouldExposeQuestions = Boolean(poll.isResultPublished) || (!isExpired && (poll.isAnonymousAllowed || viewerUserId));

    return {
        poll: {
            id: String(poll._id),
            pollName: poll.pollName,
            pollDescription: sanitizeRichText(poll.pollDescription),
            pollDurationInMinutes: poll.pollDurationInMinutes,
            pollStartTime: poll.pollStartTime,
            pollEndTime: poll.pollEndTime,
            isAnonymousAllowed: poll.isAnonymousAllowed,
            isResultPublished: poll.isResultPublished ?? false,
            shareCode: poll.shareCode,
            status: poll.status,
        },
        questions: shouldExposeQuestions ? questions.map((question) => {
            const normalized = normalizeQuestion(question);
            return {
                ...normalized,
                options: normalized.options.map((option: { id: string; text: string; order: number; votes: number }) => {
                    const publicOption: { id: string; text: string; order: number; votes?: number } = {
                        id: option.id,
                        text: option.text,
                        order: option.order,
                    };

                    if (poll.isResultPublished) {
                        publicOption.votes = option.votes;
                    }

                    return publicOption;
                }),
            };
        }) : [],
    };
};

export const getPublicAnalyticsSnapshotByCode = async (analyticsCode: string, userId?: mongoose.Types.ObjectId) => {
    const poll = await Poll.findOne({
        analyticsCode,
        ...(userId ? { createdBy: userId } : {}),
    }).lean();

    if (!poll) {
        throw new ApiError(404, 'Poll not found');
    }

    await expirePollIfNeeded(poll);

    const questions = await Question.find({ pollId: poll._id })
        .sort({ questionNumber: 1 })
        .lean();
    const voteStats = await getPollVoteStats(poll._id);

    return {
        poll: {
            id: String(poll._id),
            pollName: poll.pollName,
            pollDescription: sanitizeRichText(poll.pollDescription),
            pollDurationInMinutes: poll.pollDurationInMinutes,
            pollStartTime: poll.pollStartTime,
            pollEndTime: poll.pollEndTime,
            isAnonymousAllowed: poll.isAnonymousAllowed,
            isResultPublished: poll.isResultPublished ?? false,
            analyticsCode: poll.analyticsCode,
            shareCode: poll.shareCode,
            status: poll.status,
            totalVotes: voteStats.totalVotes,
            totalParticipants: voteStats.totalParticipants,
        },
        questions: questions.map((question) => normalizeQuestion(question)),
    };
};

export const getParticipantSummaryByAnalyticsCode = async (analyticsCode: string, page = 1, limit = 10, userId?: mongoose.Types.ObjectId) => {
    const poll = await Poll.findOne({
        analyticsCode,
        ...(userId ? { createdBy: userId } : {}),
    }).lean();

    if (!poll) {
        throw new ApiError(404, 'Poll not found');
    }

    await expirePollIfNeeded(poll);

    const questions = await Question.find({ pollId: poll._id })
        .sort({ questionNumber: 1 })
        .lean();

    const questionById = new Map(
        questions.map((question) => [
            String(question._id),
            {
                questionNumber: question.questionNumber,
                question: sanitizeRichText(question.question),
                options: new Map(
                    (question.options as any[]).map((option) => [
                        String(option._id),
                        {
                            id: String(option._id),
                            text: sanitizeRichText(option.text),
                            order: option.order,
                        },
                    ])
                ),
            },
        ])
    );

    const votes = await Vote.aggregate([
        { $match: { pollId: poll._id } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
                pipeline: [{ $project: { fullname: 1, email: 1 } }],
            },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ]);

    const participantMap = new Map<string, any>();

    for (const vote of votes as any[]) {
        const user = vote.user;
        const participantKey = user
            ? `user:${String(user._id)}`
            : `anonymous:${vote.userFingerPrint}`;

        if (!participantMap.has(participantKey)) {
            participantMap.set(participantKey, {
                id: participantKey,
                name: user?.fullname || [vote.firstName, vote.lastName].filter(Boolean).join(' ') || 'Anonymous participant',
                email: user?.email || null,
                type: user ? 'registered' : 'guest',
                totalAnswers: 0,
                lastAnsweredAt: vote.createdAt,
                answers: [],
            });
        }

        const participant = participantMap.get(participantKey);
        const question = questionById.get(String(vote.questionId));
        const option = question?.options.get(String(vote.optionId));

        participant.totalAnswers += 1;
        participant.answers.push({
            questionId: String(vote.questionId),
            questionNumber: question?.questionNumber ?? null,
            question: question?.question ?? 'Question deleted',
            optionId: String(vote.optionId),
            optionText: option?.text ?? 'Option deleted',
            answeredAt: vote.createdAt,
        });
    }

    const participants = [...participantMap.values()].sort(
        (a, b) => new Date(b.lastAnsweredAt).getTime() - new Date(a.lastAnsweredAt).getTime()
    );
    const totalParticipants = participants.length;
    const totalPages = Math.max(1, Math.ceil(totalParticipants / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;

    return {
        poll: {
            id: String(poll._id),
            pollName: poll.pollName,
            analyticsCode: poll.analyticsCode,
            totalQuestions: questions.length,
        },
        participants: participants.slice(start, start + limit),
        pagination: {
            page: safePage,
            limit,
            totalParticipants,
            totalPages,
        },
    };
};

export const ensureObjectId = (value: string, label: string) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new ApiError(400, `${label} is invalid`);
    }
};
