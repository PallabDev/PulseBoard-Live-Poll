import { z } from "zod";

export const createPollSchema = z.object({
    pollName: z.string().min(3, {
        message: "Poll name must be at least 3 characters long",
    }),
    pollDescription: z.string().min(3, {
        message: "Poll description must be at least 3 characters long",
    }),
    pollStartTime: z.date(),
    pollEndTime: z.date(),
    isAnonymousAllowed: z.boolean().default(false),
});


export const createQuestionSchema = z.object({
    question: z
        .string()
        .min(3, {
            message: "Question must be at least 3 characters long"
        }),

    pollId: z
        .string()
        .min(1, {
            message: "Poll id is required"
        }),

    questionNumber: z
        .number()
        .int()
        .positive({
            message: "Question number must be a positive integer"
        }),

    options: z
        .array(
            z.object({
                text: z
                    .string()
                    .min(1, {
                        message: "Option text is required"
                    }),

                order: z
                    .number()
                    .int()
                    .positive({
                        message: "Order must be a positive integer"
                    })
            })
        )
        .min(2, {
            message: "At least 2 options are required"
        })
        .max(4, {
            message: "Maximum 4 options are allowed"
        })
});


export type ICreateQuestion = z.infer<typeof createQuestionSchema>;
export type ICreatePoll = z.infer<typeof createPollSchema>
