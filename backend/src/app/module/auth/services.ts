import User, { type IUser } from "./model.js";
import { generateHash, compareHash, generateAccessRefreshToken, verifyRefreshToken } from "../../common/utils/tokens.js";
import ApiError from "../../common/utils/ApiError.js";
import { sendEmail, type EmailOptions } from "../../common/utils/Mail.js";
import crypto from "crypto";

export const toAuthUser = (user: Pick<IUser, '_id' | 'fullname' | 'email' | 'createdAt' | 'updatedAt'>) => ({
    _id: String(user._id),
    id: String(user._id),
    fullname: user.fullname,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export const signupService = async (fullname: string, email: string, password: string) => {
    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }

    // hash the password
    const hashedPassword = await generateHash(password);

    // create new user
    const newUser = new User({
        fullname,
        email,
        password: hashedPassword,
    });

    // generate email verification token & also save it to the user document
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    newUser.emailVerificationToken = await generateHash(emailVerificationToken);
    //valid for 15 minutes
    newUser.emailVerificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);


    await newUser.save();

    // send mail if configured; local signup should not fail because email is unavailable
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    const emailOptions: EmailOptions = {
        to: email,
        subject: "Verify your email for PulseBoard",
        text: `Hi ${fullname},\n\nPlease verify your email by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 15 minutes.\n\nIf you did not sign up for PulseBoard, please ignore this email.\n\nBest regards,\nPulseBoard Team`,
    };

    try {
        await sendEmail(emailOptions);
    } catch (error) {
        console.warn("Signup verification email was not sent:", error);
    }

    // return the user data without password
    return toAuthUser(newUser);
};

// signin service
export const signinService = async (email: string, password: string) => {
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }

    if (!user.isVerified) {
        throw new ApiError(400, "Please verify your email before signing in");
    }

    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid email or password");
    }

    // generate access and refresh tokens
    const { accessToken, refreshToken } = generateAccessRefreshToken({ userId: user._id });

    user.refreshToken = await generateHash(refreshToken);
    await user.save();

    return {
        accessToken,
        refreshToken,
        user: toAuthUser(user),
    };
};

// verify email service
export const verifyEmailService = async (token: string) => {
    // find all users with a non-expired verification token
    const users = await User.find({
        emailVerificationTokenExpires: { $gt: new Date() },
        emailVerificationToken: { $ne: null },
    });

    let matchedUser = null;
    for (const user of users) {
        const isMatch = await compareHash(token, user.emailVerificationToken!);
        if (isMatch) {
            matchedUser = user;
            break;
        }
    }

    if (!matchedUser) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    matchedUser.isVerified = true;
    matchedUser.emailVerificationToken = undefined;
    matchedUser.emailVerificationTokenExpires = undefined;
    await matchedUser.save();

    return toAuthUser(matchedUser);
};

// forgot password service
export const forgotPasswordService = async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        // don't reveal whether the email exists
        return;
    }

    // generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = await generateHash(resetToken);
    user.passwordResetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailOptions: EmailOptions = {
        to: email,
        subject: "Reset your password for PulseBoard",
        text: `Hi ${user.fullname},\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nPulseBoard Team`,
    };

    await sendEmail(emailOptions);
};

// reset password service
export const resetPasswordService = async (token: string, newPassword: string) => {
    const users = await User.find({
        passwordResetToken: { $ne: null },
        passwordResetTokenExpires: { $gt: new Date() },
    });

    let matchedUser = null;
    for (const user of users) {
        const isMatch = await compareHash(token, user.passwordResetToken!);
        if (isMatch) {
            matchedUser = user;
            break;
        }
    }

    if (!matchedUser) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    matchedUser.password = await generateHash(newPassword);
    matchedUser.passwordResetToken = undefined;
    matchedUser.passwordResetTokenExpires = undefined;
    await matchedUser.save();

    return toAuthUser(matchedUser);
};

// refresh token service
export const refreshTokenService = async (incomingRefreshToken: string) => {
    // verify the JWT signature
    let decoded;
    try {
        decoded = verifyRefreshToken(incomingRefreshToken) as { userId: string };
    } catch {
        throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    if (!user.refreshToken) {
        throw new ApiError(401, "Refresh token has been revoked");
    }

    if (!await compareHash(incomingRefreshToken, user.refreshToken)) {
        throw new ApiError(401, "Refresh token does not match");
    }

    // generate new token pair
    const { accessToken, refreshToken } = generateAccessRefreshToken({ userId: user._id });

    user.refreshToken = await generateHash(refreshToken);
    await user.save();

    return {
        accessToken,
        refreshToken,
        user: toAuthUser(user),
    };
};
