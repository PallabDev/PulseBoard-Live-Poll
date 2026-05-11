import { type Request, type Response } from "express";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { signupSchema, signinSchema } from "./validator.js";
import { ZodError } from "zod";
import { signupService } from "./services.js";
import { signinService } from "./services.js";
import { CookieConfiguration } from "../config/cookies.config.js"
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

// signin controller

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await signinSchema.safeParseAsync({ email, password });
    if (!result.success) {
        const errors = (result.error as ZodError).issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const { accessToken, refreshToken, user } = await signinService(email, password);
        const cookieMaxAge = {
            accessToken: 15 * 60 * 1000, // 15 minutes
            refreshToken: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, {
                ...CookieConfiguration,
                maxAge: cookieMaxAge.accessToken,
            })
            .cookie("refreshToken", refreshToken, {
                ...CookieConfiguration,
                maxAge: cookieMaxAge.refreshToken,
            })
            .json(
                ApiResponse.success(
                    "User signed in successfully",
                    {
                        accessToken,
                        refreshToken,
                        user,
                    }
                )
            );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }

        console.error("Signin error:", error);

        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}
