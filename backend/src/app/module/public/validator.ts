import { z } from 'zod';

export const shareCodeParamsSchema = z.object({
    shareCode: z.string().trim().min(1, {
        message: 'Share code is required',
    }),
});

export const analyticsCodeParamsSchema = z.object({
    analyticsCode: z.string().trim().min(1, {
        message: 'Analytics code is required',
    }),
});

export const submitVoteSocketSchema = z.object({
    pollId: z.string().trim().min(1, {
        message: 'Poll id is required',
    }),
    questionId: z.string().trim().min(1, {
        message: 'Question id is required',
    }),
    optionId: z.string().trim().min(1, {
        message: 'Option id is required',
    }),
    accessToken: z.string().trim().min(1).optional(),
    userFingerPrint: z.string().trim().min(1).optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
}).superRefine((data, ctx) => {
    const anonymousFields = [data.userFingerPrint, data.firstName, data.lastName].filter(Boolean);

    // If no accessToken in payload and no anonymous fields, we'll check cookies in the socket handler.
    // So we don't strictly fail here if anonymousFields.length === 0, 
    // unless we definitely don't have a token in cookies (which we can't know here).
    // However, if they provided partial anonymous fields, that's still an error.
    if (!data.accessToken && anonymousFields.length > 0 && anonymousFields.length < 3) {
        ctx.addIssue({
            code: 'custom',
            message: 'Anonymous voting requires fingerprint, first name, and last name',
            path: ['userFingerPrint'],
        });
    }
});

export type ISubmitVoteSocket = z.infer<typeof submitVoteSocketSchema>;
