import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';

// ─────────────────────────────────────────────────────────
//  Theme Store — Persisted, system-aware dark/light toggle
// ─────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'app_theme_preference';

interface ThemeState {
    isDarkMode: boolean;
    isLoaded: boolean;
    toggleTheme: () => void;
    loadPersistedTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    // Default to system preference on cold start
    isDarkMode: Appearance.getColorScheme() === 'dark',
    isLoaded: false,

    toggleTheme: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        // Fire-and-forget persist — don't block the UI
        SecureStore.setItemAsync(THEME_STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
    },

    loadPersistedTheme: async () => {
        try {
            const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
            if (stored === 'dark' || stored === 'light') {
                set({ isDarkMode: stored === 'dark', isLoaded: true });
            } else {
                // No stored preference — use system default
                set({ isLoaded: true });
            }
        } catch {
            set({ isLoaded: true });
        }
    },
}));
