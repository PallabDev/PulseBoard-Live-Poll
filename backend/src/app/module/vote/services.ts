import { Types } from 'mongoose';
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

type SubmitSocketVotesInput = Omit<SubmitSocketVoteInput, 'questionId' | 'optionId'> & {
    answers: Array<{
        questionId: string;
        optionId: string;
    }>;
};

const getParticipantFilter = (userId?: Types.ObjectId, userFingerPrint?: string) => (
    userId ? { userId } : { userFingerPrint }
);

const submitSocketVotesService = async ({
    pollId,
    answers,
    userId,
    userFingerPrint,
    firstName,
    lastName,
}: SubmitSocketVotesInput) => {
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

    if (!userId && poll.isAnonymousAllowed && (!userFingerPrint || !firstName || !lastName)) {
        throw new ApiError(400, 'Anonymous voting requires first name, last name, and browser fingerprint');
    }

    const answerQuestionIds = answers.map((answer) => answer.questionId);
    if (new Set(answerQuestionIds).size !== answerQuestionIds.length) {
        throw new ApiError(400, 'Only one answer is allowed per question');
    }

    if (answers.some((answer) => !Types.ObjectId.isValid(answer.questionId) || !Types.ObjectId.isValid(answer.optionId))) {
        throw new ApiError(400, 'Question or option id is invalid');
    }

    const questions = await Question.find({ pollId: poll._id }).sort({ questionNumber: 1 });
    const questionsById = new Map(questions.map((question) => [String(question._id), question]));
    const answersByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
    const missingRequiredQuestion = questions.find(
        (question) => (question.isRequired ?? true) && !answersByQuestionId.has(String(question._id))
    );

    if (missingRequiredQuestion) {
        throw new ApiError(400, `Question ${missingRequiredQuestion.questionNumber} is required`);
    }

    for (const answer of answers) {
        const question = questionsById.get(answer.questionId);

        if (!question) {
            throw new ApiError(404, 'Question not found');
        }

        const selectedOption = (question.options as any[]).find((option) => String(option._id) === answer.optionId);

        if (!selectedOption) {
            throw new ApiError(404, 'Option not found');
        }
    }

    const existingQuestionVotes = await Vote.collection.find({
        pollId: poll._id,
        questionId: { $in: answerQuestionIds.map((questionId) => new Types.ObjectId(questionId)) },
        ...getParticipantFilter(userId, userFingerPrint),
    }).toArray();

    if (existingQuestionVotes.length > 0) {
        throw new ApiError(409, 'This participant has already answered one or more selected questions');
    }

    const votes = answers.map((answer) => ({
            _id: new Types.ObjectId(),
            pollId: poll._id,
            questionId: new Types.ObjectId(answer.questionId),
            optionId: new Types.ObjectId(answer.optionId),
            userId: userId ?? null,
            userFingerPrint: userFingerPrint ?? null,
            firstName: firstName ?? null,
            lastName: lastName ?? null,
        }));

    await Vote.collection.insertMany(votes, { ordered: true });

    await Question.bulkWrite(
        answers.map((answer) => ({
            updateOne: {
                filter: {
                    _id: answer.questionId,
                    pollId: poll._id,
                    'options._id': answer.optionId,
                },
                update: { $inc: { 'options.$.votes': 1 } },
            },
        }))
    );

    const voteStats = await getPollVoteStats(poll._id);
    poll.totalVotes = voteStats.totalVotes;
    poll.totalParticipants = voteStats.totalParticipants;

    await poll.save();

    const [pollSnapshot, analyticsSnapshot] = await Promise.all([
        getPublicPollSnapshotByShareCode(poll.shareCode, userId),
        getPublicAnalyticsSnapshotByCode(poll.analyticsCode),
    ]);

    emitPublicPollUpdate(poll.shareCode, pollSnapshot);
    emitPublicAnalyticsUpdate(poll.analyticsCode, analyticsSnapshot);

    return {
        votes,
        pollSnapshot,
        analyticsSnapshot,
    };
};

export const submitSocketVoteService = async (input: SubmitSocketVoteInput) => {
    const response = await submitSocketVotesService({
        pollId: input.pollId,
        answers: [{
            questionId: input.questionId,
            optionId: input.optionId,
        }],
        userId: input.userId,
        userFingerPrint: input.userFingerPrint,
        firstName: input.firstName,
        lastName: input.lastName,
    });

    return {
        ...response,
        vote: response.votes[0],
    };
};

export { submitSocketVotesService };
