import { type Request, type Response } from "express";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { signupSchema } from "./validator.js";
import { ZodError } from "zod";
import { signupService } from "./services.js";



export const signup = async (req: Request, res: Response) => {

    const { fullname, email, password } = req.body;
    const result = await signupSchema.safeParseAsync({ fullname, email, password });
    if (!result.success) {
        const errors = (result.error as ZodError).issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));

        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const userData = await signupService(fullname, email, password);

        return res.status(201).json(ApiResponse.success("User registered successfully", userData));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));

        }
        console.error("Signup error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}

