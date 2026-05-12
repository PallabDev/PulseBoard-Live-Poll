import './app/common/config/env.js'
import { createServer } from 'node:http';
import createApp from './app/app.js';
import { connectDB } from './app/common/db/conn.js';
import { initSocketServer } from './app/common/socket.js';

const startServer = async () => {
    await connectDB();
    const server = createServer(createApp());
    initSocketServer(server);
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}


startServer();
