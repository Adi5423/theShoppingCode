import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ─────────────────────────────────────────────────────────
//  API Client — Axios instance with JWT, timeout,
//  server warmup support, and prod-grade error parsing
// ─────────────────────────────────────────────────────────

const BASE_URL = 'https://theshoppingcode.onrender.com/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15s timeout — generous for Render cold starts
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
    },
});

// Request Interceptor: Attach JWT
apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response Interceptor: Prod-grade error parsing
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 1. Forensic Developer Logging
        console.error('\n[API Error]:', {
            url: error.config?.url,
            message: error.message,
            code: error.code,
            status: error.response?.status,
            serverData: error.response?.data,
        });

        // 2. User-Facing Error Parsing
        let uiMessage = 'Something went wrong. Please try again.';

        if (error.code === 'ECONNABORTED') {
            // Timeout — likely server cold start
            uiMessage = 'The server is waking up. Please try again in a moment.';
        } else if (error.response) {
            // Server responded with a 4xx/5xx code
            const status = error.response.status;
            const serverMsg = error.response.data?.error;

            if (status === 401) {
                uiMessage = 'Your session has expired. Please sign in again.';
            } else if (status === 429) {
                uiMessage = 'Too many requests. Please wait a moment.';
            } else if (status >= 500) {
                uiMessage = 'Server error. Our team has been notified.';
            } else if (serverMsg) {
                uiMessage = serverMsg;
            }
        } else if (error.request) {
            // Request fired, but no response (DNS failure, offline, etc.)
            uiMessage = 'Cannot reach the server. Check your connection.';
        }

        return Promise.reject(new Error(uiMessage));
    }
);