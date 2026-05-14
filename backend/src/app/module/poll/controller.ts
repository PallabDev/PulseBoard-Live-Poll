import type { Request, Response } from "express";

// common utils
import ApiResponse from "../../common/utils/ApiResponse.js";
import ApiError from "../../common/utils/ApiError.js";

// services
import { createPollService, createQuestionService, deletePollService, deleteQuestionService, updateOptionService, updatePollService, updateQuestionOrderService, updateQuestionService, getAllPollsService, getPollByIdService } from "./services.js";
import { getPublicAnalyticsSnapshotByCode, getPublicPollSnapshotByShareCode } from "../public/services.js";
import { emitPublicAnalyticsUpdate, emitPublicPollUpdate } from "../../common/socket.js";

// zod validator schema
import { createPollSchema, createQuestionSchema, updatePollSchema, updateQuestionOrderSchema, updateQuestionSchema, updateSingleOptionSchema } from "./validator.js";


const createPoll = async (req: Request, res: Response) => {
    const result = createPollSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const poll = await createPollService({ ...result.data, userId: req.user!._id });
        return res.status(201).json(ApiResponse.success("Poll created successfully", poll));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Create poll error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }

}


const createQuestion = async (req: Request, res: Response) => {
    const { pollId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    const result = createQuestionSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const question = await createQuestionService({ pollId, ...result.data });
        return res.status(201).json(ApiResponse.success("Question created successfully", question));

    }
    catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Create question error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }


}


const updateQuestion = async (req: Request, res: Response) => {
    const { pollId, questionId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    if (!questionId || Array.isArray(questionId)) {
        return res.status(400).json(ApiResponse.error("Question id is required"));
    }

    const result = updateQuestionSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const question = await updateQuestionService({
            pollId,
            questionId,
            userId: req.user!._id,
            ...result.data,
        });
        return res.status(200).json(ApiResponse.success("Question updated successfully", question));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Update question error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}


const deleteQuestion = async (req: Request, res: Response) => {
    const { pollId, questionId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    if (!questionId || Array.isArray(questionId)) {
        return res.status(400).json(ApiResponse.error("Question id is required"));
    }

    try {
        const question = await deleteQuestionService({
            pollId,
            questionId,
            userId: req.user!._id,
        });
        return res.status(200).json(ApiResponse.success("Question deleted successfully", question));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Delete question error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}


const updateQuestionOrder = async (req: Request, res: Response) => {
    const { pollId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    const result = updateQuestionOrderSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const questions = await updateQuestionOrderService({
            pollId,
            userId: req.user!._id,
            questions: result.data,
        });
        return res.status(200).json(ApiResponse.success("Question order updated successfully", questions));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Update question order error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}

const updateOption = async (req: Request, res: Response) => {
    const { pollId, questionId, optionId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    if (!questionId || Array.isArray(questionId)) {
        return res.status(400).json(ApiResponse.error("Question id is required"));
    }

    if (!optionId || Array.isArray(optionId)) {
        return res.status(400).json(ApiResponse.error("Option id is required"));
    }

    const result = updateSingleOptionSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const question = await updateOptionService({
            pollId,
            questionId,
            optionId,
            userId: req.user!._id,
            ...result.data,
        });
        return res.status(200).json(ApiResponse.success("Option updated successfully", question));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Update option error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}


const updatePoll = async (req: Request, res: Response) => {
    const { pollId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    const result = updatePollSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const poll = await updatePollService({
            pollId,
            userId: req.user!._id,
            ...result.data,
        });

        const [pollSnapshot, analyticsSnapshot] = await Promise.all([
            getPublicPollSnapshotByShareCode(poll.shareCode),
            getPublicAnalyticsSnapshotByCode(poll.analyticsCode),
        ]);
        emitPublicPollUpdate(poll.shareCode, pollSnapshot);
        emitPublicAnalyticsUpdate(poll.analyticsCode, analyticsSnapshot);

        return res.status(200).json(ApiResponse.success("Poll updated successfully", poll));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Update poll error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}

const deletePoll = async (req: Request, res: Response) => {
    const { pollId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    try {
        const poll = await deletePollService({
            pollId,
            userId: req.user!._id,
        });
        return res.status(200).json(ApiResponse.success("Poll deleted successfully", poll));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Delete poll error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}

const getAllPolls = async (req: Request, res: Response) => {
    try {
        const polls = await getAllPollsService(req.user!._id);
        return res.status(200).json(ApiResponse.success("Polls fetched successfully", polls));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Get all polls error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}

const getPollById = async (req: Request, res: Response) => {
    const { pollId } = req.params;
    if (!pollId || Array.isArray(pollId)) {
        return res.status(400).json(ApiResponse.error("Poll id is required"));
    }

    try {
        const pollData = await getPollByIdService(pollId, req.user!._id);
        return res.status(200).json(ApiResponse.success("Poll fetched successfully", pollData));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Get poll by id error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}

export { createPoll, createQuestion, deletePoll, deleteQuestion, updateOption, updatePoll, updateQuestion, updateQuestionOrder, getAllPolls, getPollById };
