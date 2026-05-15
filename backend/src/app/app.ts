import express, { type Response } from 'express';
import authRoutes from './module/auth/routes.js';
import pollRoutes from './module/poll/routes.js';
import publicRoutes from './module/public/routes.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: true,
    legacyHeaders: false,
});

const createApp = () => {
    const app = express();
    app.set('trust proxy', 1);
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(express.json({ limit: '250kb' }));
    app.use(cookieParser());
    app.use(cors({
        origin: allowedOrigins,
        credentials: true
    }));
    app.use('/api', apiLimiter);

    // create a health route
    app.get('/health', (req, res: Response) => {
        res.json({
            status: 'ok',
            uptime: process.uptime(),
        });
    });

    // auth routes
    app.use('/api/auth', authLimiter, authRoutes);
    app.use('/api/poll', pollRoutes);
    app.use('/api/public', publicRoutes);

    app.use((err: unknown, req: express.Request, res: Response, next: express.NextFunction) => {
        if (res.headersSent) {
            return next(err);
        }

        console.error('Unhandled application error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    });


    return app;
}
export default createApp;
