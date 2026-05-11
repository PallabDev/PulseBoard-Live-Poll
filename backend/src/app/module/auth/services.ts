import User from "./model.js";
import { generateHash, compareHash, generateAccessRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../common/utils/tokens.js";
import ApiError from "../../common/utils/ApiError.js";
import { sendEmail, type EmailOptions } from "../../common/utils/Mail.js";
import crypto from "crypto";

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


    // send mail
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    const emailOptions: EmailOptions = {
        to: email,
        subject: "Verify your email for PulseBoard",
        text: `Hi ${fullname},\n\nPlease verify your email by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 15 minutes.\n\nIf you did not sign up for PulseBoard, please ignore this email.\n\nBest regards,\nPulseBoard Team`,
    };


    await sendEmail(emailOptions);
    await newUser.save();

    // return the user data without password
    return {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    };
};

// signin service
export const signinService = async (email: string, password: string) => {
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }

    if (!user.isVerified) {
        throw new ApiError(400, "User is not verified");
    }

    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid email or password");
    }

    // generate access and refresh tokens
    const { accessToken, refreshToken } = generateAccessRefreshToken({ userId: user._id });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
};
