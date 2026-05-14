import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
    avatarUrl?: string;
    isVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationTokenExpires?: Date;
    passwordResetToken?: string;
    passwordResetTokenExpires?: Date;
    refreshToken?: string;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationTokenExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpires: { type: Date },
    refreshToken: { type: String },
}, { timestamps: true });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
