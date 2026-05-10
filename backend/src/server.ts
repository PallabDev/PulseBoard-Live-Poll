import { createServer } from 'node:http';
import createApp from './app/app.js';

const startServer = () => {
    const server = createServer(createApp());
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}


startServer();