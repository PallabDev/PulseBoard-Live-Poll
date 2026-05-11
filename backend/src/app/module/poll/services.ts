import type mongoose from "mongoose";
import { Poll, Question } from "./model.js";

import type { ICreatePoll, ICreateQuestion } from "./validator.js"
type CreatePollServiceInput = ICreatePoll & {
    userId: mongoose.Types.ObjectId;
};
export const createPollService = async ({ pollName, pollDescription, pollStartTime, pollEndTime, isAnonymousAllowed, userId }: CreatePollServiceInput) => {
    const poll = new Poll({ pollName, pollDescription, pollStartTime, pollEndTime, isAnonymousAllowed, userId });
    const savedPoll = await poll.save();
    return savedPoll;
}


export const createQuestionService = async ({ question, pollId, questionNumber, options }: ICreateQuestion) => {
    const questionObj = new Question({ question, pollId, questionNumber, options });
    const savedQuestion = await questionObj.save();
    return savedQuestion;
}
