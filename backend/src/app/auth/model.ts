import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
    avatarUrl?: string;
    emailResetToken?: string;
    refreshToken?: string;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    emailResetToken: { type: String },
    refreshToken: { type: String },
}, { timestamps: true });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;