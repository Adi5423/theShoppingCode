import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Point directly to the live Render API
const BASE_URL = 'https://theshoppingcode.onrender.com/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true' // Tells Localtunnel this is an API, not a browser
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
        console.error("\n[Axios Network Error]:", {
            url: error.config?.url,
            message: error.message,
            code: error.code,
            serverData: error.response?.data
        });

        // 2. User-Facing Error Parsing
        let uiMessage = "A network error occurred. Please check your connection.";

        if (error.response) {
            // Server responded with a 4xx/5xx code
            uiMessage = error.response.data?.error || "Server encountered an issue.";
        } else if (error.request) {
            // Request fired, but no response (DNS failure, timeout, firewall block)
            uiMessage = "Cannot reach the server. It might be offline.";
        }

        // Return a clean error string to the UI components
        return Promise.reject(new Error(uiMessage));
    }
);