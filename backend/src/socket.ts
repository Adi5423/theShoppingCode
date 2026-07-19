import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const actualToken = token.replace('Bearer ', '');
            const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || 'fallback_secret') as any;
            
            socket.data.user = decoded; // { id, role }
            next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] User connected: ${socket.data.user.id} (${socket.data.user.role})`);
        
        // Users join a room with their own ID to receive private events (orders, notifications)
        socket.join(socket.data.user.id);

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.data.user.id}`);
        });
    });
};
