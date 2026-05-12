import express, { type Response } from 'express';
import authRoutes from './module/auth/routes.js';
import pollRoutes from './module/poll/routes.js';
import publicRoutes from './module/public/routes.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    }))

    // create a health route
    app.get('/health', (req, res: Response) => {
        res.json({
            status: 'ok',
            uptime: process.uptime(),
        });
    });

    // auth routes
    app.use('/api/auth', authRoutes);
    app.use('/api/poll', pollRoutes);
    app.use('/api/public', publicRoutes);



    return app;
}
export default createApp;
