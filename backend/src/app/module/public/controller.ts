import type { Request, Response } from 'express';
import ApiError from '../../common/utils/ApiError.js';
import ApiResponse from '../../common/utils/ApiResponse.js';
import { getPublicAnalyticsSnapshotByCode, getPublicPollSnapshotByShareCode } from './services.js';
import { analyticsCodeParamsSchema, shareCodeParamsSchema } from './validator.js';

export const getPublicPoll = async (req: Request, res: Response) => {
    const result = shareCodeParamsSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json(ApiResponse.error('Share code is required'));
    }

    try {
        const snapshot = await getPublicPollSnapshotByShareCode(result.data.shareCode);
        return res.status(200).json(ApiResponse.success('Poll fetched successfully', snapshot));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }

        console.error('Get public poll error:', error);
        return res.status(500).json(ApiResponse.error('Internal server error'));
    }
};

export const getPublicAnalytics = async (req: Request, res: Response) => {
    const result = analyticsCodeParamsSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json(ApiResponse.error('Analytics code is required'));
    }

    try {
        const snapshot = await getPublicAnalyticsSnapshotByCode(result.data.analyticsCode);
        return res.status(200).json(ApiResponse.success('Analytics fetched successfully', snapshot));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(ApiResponse.error(error.message));
        }

        console.error('Get public analytics error:', error);
        return res.status(500).json(ApiResponse.error('Internal server error'));
    }
};
