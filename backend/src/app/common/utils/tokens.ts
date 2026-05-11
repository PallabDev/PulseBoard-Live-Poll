import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const generateHash = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const compareHash = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};


const generateToken = (payload: object, secret: Secret, options?: SignOptions): string => {
    return jwt.sign(payload, secret, options);
};

const generateAccessRefreshToken = (
    payload: object
): { accessToken: string; refreshToken: string } => {

    const accessSecret: Secret = process.env.JWT_ACCESS_SECRET!;
    const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET!;

    const accessOptions: SignOptions = {
        expiresIn: process.env.JWT_ACCESS_EXPIRY as SignOptions["expiresIn"],
    };

    const refreshOptions: SignOptions = {
        expiresIn: process.env.JWT_REFRESH_EXPIRY as SignOptions["expiresIn"],
    };

    const accessToken = generateToken(payload, accessSecret, accessOptions);
    const refreshToken = generateToken(payload, refreshSecret, refreshOptions);

    return {
        accessToken,
        refreshToken,
    };
};

const verifyToken = (token: string, secret: Secret): object | string => {
    try {
        return jwt.verify(token, secret); // returns the decoded payload if the token is valid
    } catch (err) {
        throw new Error("Invalid token");
    }
};

const verifyAccessToken = (token: string): object | string => {
    const secret: Secret = process.env.JWT_ACCESS_SECRET!;
    return verifyToken(token, secret);
};

const verifyRefreshToken = (token: string): object | string => {
    const secret: Secret = process.env.JWT_REFRESH_SECRET!;
    return verifyToken(token, secret);
};




export {
    generateHash,
    compareHash,
    generateAccessRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
