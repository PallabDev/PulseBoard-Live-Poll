import { createServer } from 'node:http';
import createApp from './app/app.js';
import dotenv from "dotenv";
dotenv.config({
    path: './.env',
    quiet: true,
});
import { connectDB } from './app/db/conn.js';

const startServer = async () => {
    await connectDB();
    const server = createServer(createApp());
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}


startServer();