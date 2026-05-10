// write signup service here by taking fullname, email and password 

import User from "./model.js";

import { hashPassword, comparePassword, generateAccessRefreshToken, verifyToken } from "../utils/tokens.js";
import ApiError from "../utils/ApiError.js";

export const signupService = async (fullname: string, email: string, password: string) => {
    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }

    // hash the password
    const hashedPassword = await hashPassword(password);

    // create new user
    const newUser = new User({
        fullname,
        email,
        password: hashedPassword,
    });

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