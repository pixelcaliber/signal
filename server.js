import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import config from './config/default.js';
import cors from 'cors';
import { createServer } from 'http';
import express from 'express';
import routes from './routes/route.js';
import turnRoutes from './routes/turn.js';

const app = express();
app.use(bodyParser.json());

const server = createServer(app);

app.use(cors({
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use('/', routes);
app.use('/api/turn', turnRoutes);

const io = new Server(server, {
    cors: {
        origin: config.cors.allowedOrigins,
        methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

const rooms = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create_room', (callback) => {
        const roomId = generateRoomId();
        rooms.set(roomId, new Set([socket.id]));
        socket.join(roomId);
        callback(roomId);

        io.to(roomId).emit('room_users', {
            users: Array.from(rooms.get(roomId))
        });
        console.log(`Room ${roomId} created by ${socket.id}`);
    });

    socket.on('join_room', (roomId, callback) => {
        if (!rooms.has(roomId)) {
            callback(false);
            return;
        }

        const room = rooms.get(roomId);
        room.add(socket.id);
        socket.join(roomId);
        callback(true);

        io.to(roomId).emit('room_users', {
            users: Array.from(room)
        });
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('room_message', (data) => {
        console.log(`Relaying message: ${data.type}`);
        if (data.receiverId === 'all') {
            socket.to(data.roomId).emit('room_message', {
                senderId: socket.id,
                receiverId: 'all',
                type: data.type,
                payload: data.payload
            });
        } else {
            socket.to(data.receiverId).emit('room_message', {
                senderId: socket.id,
                receiverId: data.receiverId,
                type: data.type,
                payload: data.payload
            });
        }
    });

    socket.on('leave_room', (roomId) => {
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.delete(socket.id);

            if (room.size === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted - no users left`);
            } else {
                io.to(roomId).emit('room_users', {
                    users: Array.from(room)
                });
            }
        }
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        rooms.forEach((users, roomId) => {
            if (users.has(socket.id)) {
                users.delete(socket.id);
                if (users.size === 0) {
                    rooms.delete(roomId);
                } else {
                    io.to(roomId).emit('room_users', {
                        users: Array.from(users)
                    });
                }
            }
        });
    });
});

function generateRoomId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Signal server running on port ${PORT}`);
});
