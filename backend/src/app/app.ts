import express, { type Response } from 'express';
import authRoutes from './auth/routes.js';
const createApp = () => {
    const app = express();
    app.use(express.json());

    // create a health route
    app.get('/health', (req, res: Response) => {
        res.json({
            status: 'ok',
            uptime: process.uptime(),
        });
    });

    // auth routes
    app.use('/api/auth', authRoutes);



    return app;
}
export default createApp;

