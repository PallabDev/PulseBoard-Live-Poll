import express, { type Response } from 'express';
import authRoutes from './module/auth/routes.js';
import pollRoutes from './module/poll/routes.js';
import cookieParser from "cookie-parser";
const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

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



    return app;
}
export default createApp;
