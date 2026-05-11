import { z } from "zod";

const getPlainTextFromRichText = (value: string) =>
    value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

const richTextString = (fieldName: string, minTextLength = 1) =>
    z
        .string()
        .trim()
        .min(1, {
            message: `${fieldName} is required`,
        })
        .refine((value) => getPlainTextFromRichText(value).length >= minTextLength, {
            message: minTextLength > 1
                ? `${fieldName} must be at least ${minTextLength} characters long`
                : `${fieldName} is required`,
        });

const createOptionSchema = z.object({
    text: richTextString("Option text"),
    order: z
        .number()
        .int()
        .positive({
            message: "Order must be a positive integer"
        })
});

const updateQuestionOptionSchema = createOptionSchema.extend({
    _id: z.string().min(1, {
        message: "Option id is invalid"
    }).optional(),
});

const validateOrderedItems = <
    T extends {
        order: number;
    }
>(items: T[], ctx: z.RefinementCtx, pathLabel: string) => {
    const orders = items.map((item) => item.order);

    if (new Set(orders).size !== orders.length) {
        ctx.addIssue({
            code: "custom",
            message: `${pathLabel} order must be unique`,
        });
    }

    const sortedOrders = [...orders].sort((a, b) => a - b);
    const hasContinuousOrder = sortedOrders.every((order, index) => order === index + 1);

    if (!hasContinuousOrder) {
        ctx.addIssue({
            code: "custom",
            message: `${pathLabel} order must be continuous starting from 1`,
        });
    }
};

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

export const updatePollSchema = z.object({
    pollName: z.string().min(3, {
        message: "Poll name must be at least 3 characters long",
    }).optional(),
    pollDescription: z.string().min(3, {
        message: "Poll description must be at least 3 characters long",
    }).optional(),
    pollDurationInMinutes: z.number().int().min(1, {
        message: "Poll duration must be at least 1 minute",
    }).max(30, {
        message: "Poll duration can not be more than 30 minutes",
    }).optional(),
    isAnonymousAllowed: z.boolean().optional(),
    status: z.enum(["draft", "active", "ended"]).optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required to update the poll",
    }
);


export const createQuestionSchema = z.object({
    question: richTextString("Question", 3),

    questionNumber: z
        .number()
        .int()
        .positive({
            message: "Question number must be a positive integer"
        }),

    options: z
        .array(createOptionSchema)
        .min(2, {
            message: "At least 2 options are required"
        })
        .max(4, {
            message: "Maximum 4 options are allowed"
        })
}).superRefine((data, ctx) => {
    validateOrderedItems(data.options, ctx, "Option");
});

export const updateQuestionSchema = z.object({
    question: richTextString("Question", 3).optional(),
    options: z
        .array(updateQuestionOptionSchema)
        .min(2, {
            message: "At least 2 options are required"
        })
        .max(4, {
            message: "Maximum 4 options are allowed"
        })
        .optional(),
}).superRefine((data, ctx) => {
    if (data.question === undefined && data.options === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "At least one field is required to update the question",
        });
    }

    if (data.options) {
        validateOrderedItems(data.options, ctx, "Option");

        const optionIds = data.options
            .map((option) => option._id)
            .filter((optionId): optionId is string => Boolean(optionId));

        if (new Set(optionIds).size !== optionIds.length) {
            ctx.addIssue({
                code: "custom",
                message: "Option id must be unique",
            });
        }
    }
});

export const updateQuestionOrderSchema = z
    .array(
        z.object({
            questionId: z.string().min(1, {
                message: "Question id is required",
            }),
            questionNumber: z
                .number()
                .int()
                .positive({
                    message: "Question number must be a positive integer",
                }),
        })
    )
    .min(1, {
        message: "At least one question is required",
    })
    .superRefine((items, ctx) => {
        const questionIds = items.map((item) => item.questionId);
        if (new Set(questionIds).size !== questionIds.length) {
            ctx.addIssue({
                code: "custom",
                message: "Question id must be unique",
            });
        }

        validateOrderedItems(
            items.map((item) => ({ order: item.questionNumber })),
            ctx,
            "Question"
        );
    });

export const updateSingleOptionSchema = z.object({
    text: richTextString("Option text"),
}).strict();


export type ICreateQuestion = z.infer<typeof createQuestionSchema>;
export type ICreatePoll = z.infer<typeof createPollSchema>
export type IUpdatePoll = z.infer<typeof updatePollSchema>
export type IUpdateQuestion = z.infer<typeof updateQuestionSchema>
export type IUpdateQuestionOrder = z.infer<typeof updateQuestionOrderSchema>
export type IUpdateOption = z.infer<typeof updateSingleOptionSchema>
