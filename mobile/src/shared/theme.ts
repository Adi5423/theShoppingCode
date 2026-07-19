/**
 * ─────────────────────────────────────────────────────────
 *  HYPERLOCAL MARKETPLACE — Design Token System
 *  Palette: "Deep Forest & Warm Sand"
 *  Primary: #004437 (deep emerald)  |  Accent: #D5B38E (warm gold)
 * ─────────────────────────────────────────────────────────
 */

// ── Color Palette ──────────────────────────────────────────

export const lightTheme = {
    colors: {
        // Core
        primary: '#004437',
        primaryMuted: '#E6F0ED',   // Very light emerald tint for subtle backgrounds
        accent: '#D5B38E',
        accentMuted: '#F5EDE3',   // Soft warm tint

        // Surfaces
        background: '#FAF8F5',   // Warm off-white (not clinical)
        surface: '#FFFFFF',
        surfaceElevated: '#FFFFFF',
        card: '#FFFFFF',

        // Text
        text: '#1A1D21',
        textSecondary: '#4A5568',
        textMuted: '#9CA3AF',
        textOnPrimary: '#FFFFFF',
        textOnAccent: '#2D1F0E',

        // Borders & Dividers
        border: '#E8E4DF',   // Warm gray border
        borderFocused: '#004437',
        divider: '#F0EDE8',

        // Semantic
        error: '#DC3545',
        errorBg: '#FDF2F2',
        errorMuted: '#F8D7DA',
        success: '#059669',
        successBg: '#ECFDF5',
        warning: '#D97706',
        warningBg: '#FFFBEB',
        info: '#0284C7',
        infoBg: '#F0F9FF',

        // Toast
        toastBg: '#1A1D21',
        toastText: '#FFFFFF',

        // Tab Bar
        tabBarBg: '#FFFFFF',
        tabBarBorder: '#F0EDE8',
        tabActive: '#004437',
        tabInactive: '#9CA3AF',

        // Misc
        skeleton: '#E8E4DF',
        overlay: 'rgba(0, 0, 0, 0.4)',
        shadow: '#000000',
    }
};

export const darkTheme = {
    colors: {
        // Core (Minimalist with a subtle Indigo pop)
        primary: '#818CF8',        // Soft, muted indigo for that "lil" differentiation
        primaryMuted: '#1E1B4B',   // Deep, subtle indigo for secondary backgrounds
        accent: '#A3A3A3',         // Keeping the accent neutral so it doesn't clash
        accentMuted: '#171717',

        // Surfaces (Keeping the true neutral darks)
        background: '#0A0A0A',     // Deepest black-grey
        surface: '#121212',
        surfaceElevated: '#1E1E1E',
        card: '#121212',

        // Text (Clean readability)
        text: '#EDEDED',
        textSecondary: '#A3A3A3',
        textMuted: '#737373',
        textOnPrimary: '#0A0A0A',  // Dark text on the indigo looks super sharp
        textOnAccent: '#0A0A0A',

        // Borders & Dividers
        border: '#262626',
        borderFocused: '#818CF8',  // Inputs/borders get the indigo highlight when focused
        divider: '#1A1A1A',

        // Semantic (Desaturated functional colors)
        error: '#EF4444',
        errorBg: '#2B1212',
        errorMuted: '#451C1C',
        success: '#22C55E',
        successBg: '#0F291E',
        warning: '#F59E0B',
        warningBg: '#2B1D0F',
        info: '#3B82F6',
        infoBg: '#121E2B',

        // Toast
        toastBg: '#EDEDED',
        toastText: '#0A0A0A',

        // Tab Bar
        tabBarBg: '#0A0A0A',
        tabBarBorder: '#262626',
        tabActive: '#818CF8',      // Active tab gets the subtle indigo
        tabInactive: '#737373',

        // Misc
        skeleton: '#1E1E1E',
        overlay: 'rgba(0, 0, 0, 0.7)',
        shadow: '#000000',
    }
};

// ── Typography ─────────────────────────────────────────────

export const typography = {
    fontFamily: {
        regular: 'System',   // Falls back to SF Pro / Roboto natively
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 11,
        sm: 13,
        base: 15,
        md: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        black: '800' as const,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        loose: 1.75,
    },
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1.0,
        widest: 1.5,
    }
};

// ── Spacing & Radius ──────────────────────────────────────

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
};

export const radius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

// ── Shadows ───────────────────────────────────────────────

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    modal: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
};

// ── Animation Timing ──────────────────────────────────────

export const animation = {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
};

// ── Type Export ────────────────────────────────────────────

export type ThemeColors = typeof lightTheme.colors;
export type Theme = typeof lightTheme;