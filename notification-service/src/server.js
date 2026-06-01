const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const registerNotificationHandlers = require('./handlers/notificationHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Health check route (Useful for AWS EC2 target group deployment)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'Notification Service' });
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO with CORS allowance for Frontend (React) and Backend (Spring Boot)
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this to specific URLs (e.g., "http://localhost:3000") in production
        methods: ["GET", "POST"]
    }
});

// Attach notification events handler
registerNotificationHandlers(io);

// Start the server
server.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});