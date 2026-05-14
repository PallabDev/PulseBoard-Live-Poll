export interface IPoll {
    id?: string;
    _id?: string;
    pollName: string;
    pollDescription: string;
    pollDurationInMinutes: number;
    pollStartTime: Date | null;
    pollEndTime: Date | null;
    isAnonymousAllowed: boolean;
    shareCode: string;
    analyticsCode: string;
    isResultPublished?: boolean;
    status: 'draft' | 'active' | 'ended';
    totalVotes: number;
    totalParticipants: number;
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IOption {
    id?: string;
    _id?: string;
    text: string;
    order: number;
    votes?: number;
}

export interface IQuestion {
    id?: string;
    _id?: string;
    question: string;
    pollId: string;
    questionNumber: number;
    isRequired?: boolean;
    options: IOption[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IPollSnapshot {
    poll: IPoll;
    questions: IQuestion[];
}
