import { z } from "zod";

export const signupSchema = z.object({
    fullname: z.string().min(3, {
        message: "Full name must be at least 3 characters long",
    }),

    email: z.email({
        message: "Invalid email address",
    }),

    password: z.string().min(6, {
        message: "Password must be at least 6 characters long",
    }),
});

// signin schema

export const signinSchema = z.object({
    email: z.email({
        message: "Invalid email address",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters long",
    }),
});

// verify email schema

export const verifyEmailSchema = z.object({
    token: z.string().min(1, {
        message: "Verification token is required",
    }),
});

// forgot password schema

export const forgotPasswordSchema = z.object({
    email: z.email({
        message: "Invalid email address",
    }),
});

// reset password schema

export const resetPasswordSchema = z.object({
    token: z.string().min(1, {
        message: "Reset token is required",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters long",
    }),
});

// refresh token schema

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, {
        message: "Refresh token is required",
    }),
});
