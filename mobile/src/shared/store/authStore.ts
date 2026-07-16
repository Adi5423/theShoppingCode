import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    role: 'CUSTOMER' | 'SHOPKEEPER' | null;
    signIn: (token: string, role: 'CUSTOMER' | 'SHOPKEEPER') => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    role: null,
    signIn: async (token, role) => {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userRole', role);
        set({ token, role });
    },
    signOut: async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userRole');
        set({ token: null, role: null });
    }
}));