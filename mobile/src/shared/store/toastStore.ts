import { create } from 'zustand';

// ─────────────────────────────────────────────────────────
//  Toast Store — Global notification state
// ─────────────────────────────────────────────────────────

export type ToastType = 'error' | 'success' | 'info';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
    onPress?: () => void;
    show: (message: string, type?: ToastType, onPress?: () => void) => void;
    hide: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    type: 'info',
    onPress: undefined,

    show: (message, type = 'info', onPress?: () => void) => {
        // Clear any existing timer
        if (dismissTimer) clearTimeout(dismissTimer);

        set({ visible: true, message, type, onPress });

        // Auto-dismiss after 3.5s
        dismissTimer = setTimeout(() => {
            set({ visible: false });
        }, 3500);
    },

    hide: () => {
        if (dismissTimer) clearTimeout(dismissTimer);
        set({ visible: false });
    },
}));
