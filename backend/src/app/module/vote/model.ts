import mongoose, { Document, Schema } from 'mongoose';
export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    questionId: mongoose.Types.ObjectId;
    optionId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    userFingerPrint?: string;
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const VoteSchema = new Schema<IVote>({
    pollId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Poll',
        index: true,
    },
    questionId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    optionId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    userFingerPrint: {
        type: String,
        trim: true,
        default: null,
    },
    firstName: {
        type: String,
        trim: true,
        default: null,
    },
    lastName: {
        type: String,
        trim: true,
        default: null,
    },
}, { timestamps: true });

VoteSchema.index(
    { pollId: 1, questionId: 1, userId: 1 },
    {
        unique: true,
        partialFilterExpression: { userId: { $exists: true, $ne: null } },
    }
);

VoteSchema.index(
    { pollId: 1, questionId: 1, userFingerPrint: 1 },
    {
        unique: true,
        partialFilterExpression: { userFingerPrint: { $exists: true, $ne: null } },
    }
);

VoteSchema.path('userId').validate(function (this: IVote, value: mongoose.Types.ObjectId | null) {
    return Boolean(value) || Boolean(this.userFingerPrint && this.firstName && this.lastName);
}, 'Either userId or anonymous voter details are required');

const Vote = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
