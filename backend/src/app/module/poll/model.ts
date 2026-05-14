import mongoose, { Schema, Document } from 'mongoose';


export interface IPoll {
    pollName: string;
    pollDescription: string;
    pollDurationInMinutes: number;
    pollStartTime: Date | null;
    pollEndTime: Date | null;
    isAnonymousAllowed: boolean;
    shareCode: string;
    analyticsCode: string;
    isResultPublished: boolean;
    status: 'draft' | 'active' | 'ended';
    totalVotes: number;
    totalParticipants: number;
    createdBy: mongoose.Types.ObjectId;
}


const PollSchema: Schema = new Schema<IPoll>({
    pollName: { type: String, required: true },
    pollDescription: { type: String, required: true },
    pollDurationInMinutes: { type: Number, required: true },
    pollStartTime: { type: Date, default: null },
    pollEndTime: { type: Date, default: null },
    isAnonymousAllowed: { type: Boolean, required: true, default: false },
    shareCode: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString(),
    },
    analyticsCode: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString(),
    },
    isResultPublished: {
        type: Boolean,
        required: true,
        default: false,
    },

    status: {
        type: String,
        enum: ['draft', 'active', 'ended'],
        default: 'draft',
        required: true
    },
    totalVotes: {
        type: Number,
        required: true,
        default: 0
    },
    totalParticipants: {
        type: Number,
        required: true,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    }

}, { timestamps: true });





interface IOption {
    text: string;
    order: number;
    votes: number;
}
export interface IQuestion {
    question: string;
    pollId: mongoose.Types.ObjectId;
    questionNumber: number;
    options: IOption[];
    createdAt: Date;
    updatedAt: Date;
}



const QuestionSchema: Schema = new Schema<IQuestion>({
    question: { type: String, required: true },
    pollId: {
        type: Schema.Types.ObjectId, required: true,
        ref: 'Poll',
        index: true
    },
    options: {
        type: [
            {
                text: {
                    type: String,
                    required: true
                },
                order: {
                    type: Number,
                    required: true
                },
                votes: {
                    type: Number,
                    default: 0
                }
            }
        ],
        validate: {
            validator: function (val: IOption[]) {
                return val.length >= 2 && val.length <= 4;
            },
            message: 'Options must contain between 2 and 4 items'
        }
    },
    questionNumber: { type: Number, required: true },
}, { timestamps: true });




const Poll = mongoose.model<IPoll>('Poll', PollSchema);
const Question = mongoose.model<IQuestion>('Question', QuestionSchema);

export { Poll, Question };
