import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { submitVoteSocketSchema } from '../module/public/validator.js';
import { submitSocketVoteService } from '../module/vote/services.js';
import { verifyAccessToken } from './utils/tokens.js';
import User from '../module/auth/model.js';

let io: Server | null = null;

const pollRoom = (shareCode: string) => `poll:${shareCode}`;
const analyticsRoom = (analyticsCode: string) => `analytics:${analyticsCode}`;

export const initSocketServer = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: true,
            credentials: true,
        },
    });

    io.on('connection', (socket: Socket) => {
        socket.on('public:poll:join', (payload: { shareCode?: string } | string) => {
            const shareCode = typeof payload === 'string' ? payload : payload?.shareCode;

            if (typeof shareCode !== 'string' || !shareCode.trim()) {
                return;
            }

            socket.join(pollRoom(shareCode.trim()));
        });

        socket.on('public:analytics:join', (payload: { analyticsCode?: string } | string) => {
            const analyticsCode = typeof payload === 'string' ? payload : payload?.analyticsCode;

            if (typeof analyticsCode !== 'string' || !analyticsCode.trim()) {
                return;
            }

            socket.join(analyticsRoom(analyticsCode.trim()));
        });

        socket.on('public:vote:submit', async (
            payload: unknown,
            callback?: (response: { success: boolean; message: string; data?: { voteId: string; questionId: string; optionId: string } }) => void
        ) => {
            try {
                const result = submitVoteSocketSchema.safeParse(payload);

                if (!result.success) {
                    const message = result.error.issues.map((issue) => issue.message).join(', ');
                    if (typeof callback === 'function') {
                        callback({ success: false, message });
                    }
                    return;
                }

                let userId = undefined;

                if (result.data.accessToken) {
                    const decoded = verifyAccessToken(result.data.accessToken) as { userId?: string };
                    const tokenUserId = decoded?.userId;

                    if (!tokenUserId) {
                        throw new Error('Invalid access token');
                    }

                    const user = await User.findById(tokenUserId).select('_id');

                    if (!user) {
                        throw new Error('User not found');
                    }

                    userId = user._id;
                }

                const response = await submitSocketVoteService({
                    pollId: result.data.pollId,
                    questionId: result.data.questionId,
                    optionId: result.data.optionId,
                    userId,
                    userFingerPrint: result.data.userFingerPrint,
                    firstName: result.data.firstName,
                    lastName: result.data.lastName,
                });

                if (typeof callback === 'function') {
                    callback({
                        success: true,
                        message: 'Vote submitted successfully',
                        data: {
                            voteId: String(response.vote._id),
                            questionId: result.data.questionId,
                            optionId: result.data.optionId,
                        },
                    });
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to submit vote';

                if (typeof callback === 'function') {
                    callback({
                        success: false,
                        message,
                    });
                }
            }
        });
    });

    return io;
};

export const emitPublicPollUpdate = (shareCode: string, payload: unknown) => {
    io?.to(pollRoom(shareCode)).emit('poll:update', payload);
};

export const emitPublicAnalyticsUpdate = (analyticsCode: string, payload: unknown) => {
    io?.to(analyticsRoom(analyticsCode)).emit('analytics:update', payload);
};
