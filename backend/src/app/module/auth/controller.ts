import { type Request, type Response } from "express";
import ApiError from "../../common/utils/ApiError.js";
import ApiResponse from "../../common/utils/ApiResponse.js";
import { signupSchema, signinSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema } from "./validator.js";
import { ZodError } from "zod";
import { signupService, signinService, verifyEmailService, forgotPasswordService, resetPasswordService, refreshTokenService, toAuthUser } from "./services.js";
import { CookieConfiguration } from "../../common/config/cookies.config.js"
import { generateHash } from "../../common/utils/tokens.js";
import User from "./model.js";

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


export const userinfo = async (req: Request, res: Response) => {
    return res.status(200).json(ApiResponse.success("User fetched successfully", {
        user: req.user ? toAuthUser(req.user) : null,
        accessToken: req.cookies.accessToken || req.headers.authorization?.split(" ")[1]
    }));
}


export const signout = async (req: Request, res: Response) => {
    // clear refresh token from DB
    try {
        const user = req.user;
        if (user) {
            await User.findByIdAndUpdate(user._id, { refreshToken: null });
        }
    } catch (error) {
        console.error("Error clearing refresh token:", error);
    }

    res.clearCookie("accessToken", CookieConfiguration);
    res.clearCookie("refreshToken", CookieConfiguration);
    return res.status(200).json(ApiResponse.success("User signed out successfully"));
}


// verify email controller

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await verifyEmailSchema.safeParseAsync({ token });
    if (!result.success) {
        const errors = (result.error as ZodError).issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const userData = await verifyEmailService(token);
        return res.status(200).json(ApiResponse.success("Email verified successfully", userData));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Verify email error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}


// forgot password controller

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await forgotPasswordSchema.safeParseAsync({ email });
    if (!result.success) {
        const errors = (result.error as ZodError).issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        await forgotPasswordService(email);
        // always return success to not reveal email existence
        return res.status(200).json(ApiResponse.success("If an account with that email exists, a password reset link has been sent."));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Forgot password error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}


// reset password controller

export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const result = await resetPasswordSchema.safeParseAsync({ token, password });
    if (!result.success) {
        const errors = (result.error as ZodError).issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const userData = await resetPasswordService(token, password);
        return res.status(200).json(ApiResponse.success("Password reset successfully", userData));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }
        console.error("Reset password error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}


// refresh token controller

export const refreshTokenController = async (req: Request, res: Response) => {
    // read refresh token from cookie or body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    const result = await refreshTokenSchema.safeParseAsync({ refreshToken: incomingRefreshToken });
    if (!result.success) {
        const errors = (result.error as ZodError).issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(401).json(ApiResponse.error("Validation failed", errors));
    }

    try {
        const { accessToken, refreshToken, user } = await refreshTokenService(incomingRefreshToken);
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
                    "Token refreshed successfully",
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
        console.error("Refresh token error:", error);
        return res.status(500).json(ApiResponse.error("Internal server error"));
    }
}
