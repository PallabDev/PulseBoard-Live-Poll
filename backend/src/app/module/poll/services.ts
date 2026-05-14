import type mongoose from "mongoose";
import { Poll, Question } from "./model.js";
import Vote from "../vote/model.js";
import ApiError from "../../common/utils/ApiError.js";
import { sanitizeRichText } from "../../common/utils/sanitizeHtml.js";

import type { ICreatePoll, ICreateQuestion, IUpdateOption, IUpdatePoll, IUpdateQuestion, IUpdateQuestionOrder } from "./validator.js"
type CreatePollServiceInput = ICreatePoll & {
    userId: mongoose.Types.ObjectId;
};
const expireActivePolls = async (filter: Record<string, unknown> = {}) => {
    await Poll.updateMany(
        {
            ...filter,
            status: "active",
            pollEndTime: { $lte: new Date() },
        },
        { $set: { status: "ended" } }
    );
};

export const createPollService = async ({ pollName, pollDescription, pollDurationInMinutes, isAnonymousAllowed, status, userId }: CreatePollServiceInput) => {
    const startTime = status === "active" ? new Date() : null;
    const poll = new Poll({
        pollName,
        pollDescription: sanitizeRichText(pollDescription),
        pollDurationInMinutes,
        pollStartTime: startTime,
        pollEndTime: startTime ? new Date(startTime.getTime() + pollDurationInMinutes * 60 * 1000) : null,
        isAnonymousAllowed,
        status: status ?? "draft",
        createdBy: userId
    });
    const savedPoll = await poll.save();
    return savedPoll;
}


type CreateQuestionServiceInput = ICreateQuestion & {
    pollId: string;
    userId: mongoose.Types.ObjectId;
};

export const createQuestionService = async ({ question, pollId, userId, questionNumber, isRequired, options }: CreateQuestionServiceInput) => {
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    const questionObj = new Question({
        question: sanitizeRichText(question),
        pollId,
        questionNumber,
        isRequired,
        options: options.map((option) => ({
            ...option,
            text: sanitizeRichText(option.text),
        })),
    });
    const savedQuestion = await questionObj.save();
    return savedQuestion;
}


type UpdateQuestionServiceInput = IUpdateQuestion & {
    pollId: string;
    questionId: string;
    userId: mongoose.Types.ObjectId;
};

export const updateQuestionService = async ({ pollId, questionId, userId, question, isRequired, options }: UpdateQuestionServiceInput) => {
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    const questionDoc = await Question.findOne({ _id: questionId, pollId });

    if (!questionDoc) {
        throw new ApiError(404, "Question not found");
    }

    if (question !== undefined) {
        questionDoc.question = sanitizeRichText(question);
    }

    if (isRequired !== undefined) {
        questionDoc.isRequired = isRequired;
    }

    if (options !== undefined) {
        const existingOptions = questionDoc.options as any[];
        const existingOptionsById = new Map(
            existingOptions.map((option) => [String(option._id), option])
        );
        const submittedOptionIds = new Set(
            options
                .map((option) => option._id)
                .filter((optionId): optionId is string => Boolean(optionId))
        );

        const removedOptionsWithVotes = existingOptions.filter(
            (option) => !submittedOptionIds.has(String(option._id)) && (option.votes ?? 0) > 0
        );

        if (removedOptionsWithVotes.length > 0) {
            throw new ApiError(400, "Cannot remove options that already have votes");
        }

        questionDoc.options = options.map((option) => {
            if (option._id) {
                const existingOption = existingOptionsById.get(option._id);

                if (!existingOption) {
                    throw new ApiError(400, "Option not found in this question");
                }

                return {
                    _id: existingOption._id,
                    text: sanitizeRichText(option.text),
                    order: option.order,
                    votes: existingOption.votes ?? 0,
                };
            }

            return {
                text: sanitizeRichText(option.text),
                order: option.order,
                votes: 0,
            };
        }) as any;
    }

    const updatedQuestion = await questionDoc.save();
    return updatedQuestion;
}


type DeleteQuestionServiceInput = {
    pollId: string;
    questionId: string;
    userId: mongoose.Types.ObjectId;
};

export const deleteQuestionService = async ({ pollId, questionId, userId }: DeleteQuestionServiceInput) => {
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    const questionDoc = await Question.findOne({ _id: questionId, pollId });

    if (!questionDoc) {
        throw new ApiError(404, "Question not found");
    }

    await Vote.deleteMany({ pollId: poll._id, questionId: questionDoc._id });
    await questionDoc.deleteOne();

    const votes = await Vote.collection.find({ pollId: poll._id }, {
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

    poll.totalVotes = votes.length;
    poll.totalParticipants = participantKeys.size;
    await poll.save();

    return questionDoc;
}


type UpdateOptionServiceInput = IUpdateOption & {
    pollId: string;
    questionId: string;
    optionId: string;
    userId: mongoose.Types.ObjectId;
};

export const updateOptionService = async ({ pollId, questionId, optionId, userId, text }: UpdateOptionServiceInput) => {
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    const questionDoc = await Question.findOne({ _id: questionId, pollId });

    if (!questionDoc) {
        throw new ApiError(404, "Question not found");
    }

    const optionDoc = (questionDoc.options as any[]).find((option) => String(option._id) === optionId);

    if (!optionDoc) {
        throw new ApiError(404, "Option not found");
    }

    optionDoc.text = sanitizeRichText(text);

    const updatedQuestion = await questionDoc.save();
    return updatedQuestion;
}


type UpdateQuestionOrderServiceInput = {
    pollId: string;
    userId: mongoose.Types.ObjectId;
    questions: IUpdateQuestionOrder;
};

export const updateQuestionOrderService = async ({ pollId, userId, questions }: UpdateQuestionOrderServiceInput) => {
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    const existingQuestions = await Question.find({ pollId }).select("_id").lean();

    if (existingQuestions.length !== questions.length) {
        throw new ApiError(400, "Please send the complete question order list");
    }

    const existingQuestionIds = new Set(existingQuestions.map((question) => String(question._id)));

    for (const question of questions) {
        if (!existingQuestionIds.has(question.questionId)) {
            throw new ApiError(400, "Question does not belong to this poll");
        }
    }

    await Question.bulkWrite(
        questions.map((question) => ({
            updateOne: {
                filter: { _id: question.questionId, pollId },
                update: { $set: { questionNumber: question.questionNumber } },
            },
        }))
    );

    const updatedQuestions = await Question.find({ pollId }).sort({ questionNumber: 1 });
    return updatedQuestions;
}


type UpdatePollServiceInput = IUpdatePoll & {
    pollId: string;
    userId: mongoose.Types.ObjectId;
};

export const updatePollService = async ({ pollId, userId, pollName, pollDescription, pollDurationInMinutes, isAnonymousAllowed, isResultPublished, status }: UpdatePollServiceInput) => {
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    if (pollName !== undefined) {
        poll.pollName = pollName;
    }

    if (pollDescription !== undefined) {
        poll.pollDescription = sanitizeRichText(pollDescription);
    }

    if (pollDurationInMinutes !== undefined) {
        poll.pollDurationInMinutes = pollDurationInMinutes;

        if (poll.pollStartTime) {
            poll.pollEndTime = new Date(
                poll.pollStartTime.getTime() + pollDurationInMinutes * 60 * 1000
            );
        }
    }

    if (isAnonymousAllowed !== undefined) {
        poll.isAnonymousAllowed = isAnonymousAllowed;
    }

    if (isResultPublished !== undefined) {
        if (isResultPublished && poll.status === "active" && poll.pollEndTime && poll.pollEndTime.getTime() <= Date.now()) {
            poll.status = "ended";
        }

        if (isResultPublished && poll.status !== "ended") {
            throw new ApiError(400, "Poll results can only be published after the poll has ended");
        }

        poll.isResultPublished = isResultPublished;
    }

    if (status !== undefined) {
        if (status === "active" && poll.status !== "active") {
            const startTime = new Date();
            poll.pollStartTime = startTime;
            poll.pollEndTime = new Date(
                startTime.getTime() + poll.pollDurationInMinutes * 60 * 1000
            );
        }

        poll.status = status;
    }

    const updatedPoll = await poll.save();
    return updatedPoll;
}

type DeletePollServiceInput = {
    pollId: string;
    userId: mongoose.Types.ObjectId;
};

export const deletePollService = async ({ pollId, userId }: DeletePollServiceInput) => {
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });

    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    await Vote.deleteMany({ pollId: poll._id });
    await Question.deleteMany({ pollId: poll._id });
    await poll.deleteOne();

    return poll;
}

export const getAllPollsService = async (userId: mongoose.Types.ObjectId) => {
    await expireActivePolls({ createdBy: userId });
    const polls = await Poll.find({ createdBy: userId }).sort({ createdAt: -1 });
    return polls;
}

export const getPollByIdService = async (pollId: string, userId: mongoose.Types.ObjectId) => {
    await expireActivePolls({ _id: pollId, createdBy: userId });
    const poll = await Poll.findOne({ _id: pollId, createdBy: userId });
    
    if (!poll) {
        throw new ApiError(404, "Poll not found");
    }

    const questions = await Question.find({ pollId }).sort({ questionNumber: 1 });
    
    return {
        poll,
        questions
    };
}
