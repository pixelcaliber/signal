import dotenv from 'dotenv';
dotenv.config();

export default {
    server: {
        port: process.env.PORT || 3001
    },
    cors: {
        allowedOrigins: [
            "https://hype-fv8s7nl6l-pixelcalibers-projects.vercel.app",
            "https://hype-eta.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://127.0.0.1:5500"
        ]
    },
    turn: {
        apiKey: process.env.TURN_API_KEY,
        apiUrl: "https://pixelcaliber.metered.live/api/v1/turn/credentials"
    }
};