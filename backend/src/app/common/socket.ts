import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { submitVoteSocketSchema } from '../module/public/validator.js';
import { submitSocketVoteService } from '../module/vote/services.js';
import { verifyAccessToken, verifyRefreshToken } from './utils/tokens.js';
import User from '../module/auth/model.js';

let io: Server | null = null;

const pollRoom = (shareCode: string) => `poll:${shareCode}`;
const analyticsRoom = (analyticsCode: string) => `analytics:${analyticsCode}`;

const parseCookieHeader = (cookieHeader?: string) => {
    if (!cookieHeader) {
        return {};
    }

    return cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
        const separatorIndex = cookie.indexOf('=');
        if (separatorIndex === -1) {
            return acc;
        }

        const name = cookie.slice(0, separatorIndex).trim();
        const value = cookie.slice(separatorIndex + 1).trim();

        if (name) {
            acc[name] = decodeURIComponent(value);
        }

        return acc;
    }, {});
};

const resolveSocketUserId = async (socket: Socket, payloadAccessToken?: string) => {
    const cookies = parseCookieHeader(socket.request.headers.cookie);
    const authHeader = socket.request.headers.authorization;
    const headerAccessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const handshakeAccessToken = typeof socket.handshake.auth?.accessToken === 'string'
        ? socket.handshake.auth.accessToken
        : undefined;

    const accessTokens = [
        payloadAccessToken,
        handshakeAccessToken,
        headerAccessToken,
        cookies.accessToken,
    ].filter(Boolean) as string[];

    for (const token of accessTokens) {
        try {
            const decoded = verifyAccessToken(token) as { userId?: string };
            if (!decoded?.userId) {
                continue;
            }

            const user = await User.findById(decoded.userId).select('_id');
            if (user) {
                return user._id;
            }
        } catch {
            // Try the next credential source; access tokens may expire while the socket stays open.
        }
    }

    if (cookies.refreshToken) {
        try {
            const decoded = verifyRefreshToken(cookies.refreshToken) as { userId?: string };
            if (!decoded?.userId) {
                return undefined;
            }

            const user = await User.findById(decoded.userId).select('_id refreshToken');
            if (user?.refreshToken === cookies.refreshToken) {
                return user._id;
            }
        } catch {
            return undefined;
        }
    }

    return undefined;
};

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

                const userId = await resolveSocketUserId(socket, result.data.accessToken);

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
