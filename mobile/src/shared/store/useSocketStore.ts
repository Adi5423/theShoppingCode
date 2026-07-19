import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';
import { useAuthStore } from './authStore';

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    
    connect: () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        // Extract base URL from API_URL by removing /api
        const baseUrl = BASE_URL.replace('/api', '');

        const socket = io(baseUrl, {
            auth: { token },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected');
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            set({ isConnected: false });
        });

        set({ socket });
    },
    
    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    }
}));
