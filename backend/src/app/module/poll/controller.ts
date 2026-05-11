import type { Request, Response } from "express";

// common utils
import ApiResponse from "../../common/utils/ApiResponse.js";
import ApiError from "../../common/utils/ApiError.js";

// services
import { createPollService, createQuestionService } from "./services.js";

// zod validator schema
import type { ZodError } from "zod"
import { createPollSchema, createQuestionSchema } from "./validator.js";


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
    const result = createQuestionSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const question = await createQuestionService({ ...result.data });
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



export { createPoll, createQuestion };
