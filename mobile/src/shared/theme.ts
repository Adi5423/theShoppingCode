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
        primary:          '#004437',
        primaryMuted:     '#E6F0ED',   // Very light emerald tint for subtle backgrounds
        accent:           '#D5B38E',
        accentMuted:      '#F5EDE3',   // Soft warm tint

        // Surfaces
        background:       '#FAF8F5',   // Warm off-white (not clinical)
        surface:          '#FFFFFF',
        surfaceElevated:  '#FFFFFF',
        card:             '#FFFFFF',

        // Text
        text:             '#1A1D21',
        textSecondary:    '#4A5568',
        textMuted:        '#9CA3AF',
        textOnPrimary:    '#FFFFFF',
        textOnAccent:     '#2D1F0E',

        // Borders & Dividers
        border:           '#E8E4DF',   // Warm gray border
        borderFocused:    '#004437',
        divider:          '#F0EDE8',

        // Semantic
        error:            '#DC3545',
        errorBg:          '#FDF2F2',
        errorMuted:       '#F8D7DA',
        success:          '#059669',
        successBg:        '#ECFDF5',
        warning:          '#D97706',
        warningBg:        '#FFFBEB',
        info:             '#0284C7',
        infoBg:           '#F0F9FF',

        // Toast
        toastBg:          '#1A1D21',
        toastText:        '#FFFFFF',

        // Tab Bar
        tabBarBg:         '#FFFFFF',
        tabBarBorder:     '#F0EDE8',
        tabActive:        '#004437',
        tabInactive:      '#9CA3AF',

        // Misc
        skeleton:         '#E8E4DF',
        overlay:          'rgba(0, 0, 0, 0.4)',
        shadow:           '#000000',
    }
};

export const darkTheme = {
    colors: {
        // Core
        primary:          '#00C896',   // Brighter emerald for dark bg contrast
        primaryMuted:     '#0D2E26',   // Deep muted emerald
        accent:           '#D5B38E',
        accentMuted:      '#2A2218',

        // Surfaces
        background:       '#0F1419',   // Rich charcoal
        surface:          '#1A2332',   // Slate
        surfaceElevated:  '#243044',
        card:             '#1A2332',

        // Text
        text:             '#F1F5F9',
        textSecondary:    '#94A3B8',
        textMuted:        '#64748B',
        textOnPrimary:    '#0F1419',
        textOnAccent:     '#2D1F0E',

        // Borders & Dividers
        border:           '#2A3544',
        borderFocused:    '#00C896',
        divider:          '#1E2D3D',

        // Semantic
        error:            '#F87171',
        errorBg:          '#2D1B1B',
        errorMuted:       '#451A1A',
        success:          '#34D399',
        successBg:        '#0D2E26',
        warning:          '#FBBF24',
        warningBg:        '#2A2218',
        info:             '#38BDF8',
        infoBg:           '#0C2340',

        // Toast
        toastBg:          '#F1F5F9',
        toastText:        '#0F1419',

        // Tab Bar
        tabBarBg:         '#141D27',
        tabBarBorder:     '#1E2D3D',
        tabActive:        '#00C896',
        tabInactive:      '#64748B',

        // Misc
        skeleton:         '#2A3544',
        overlay:          'rgba(0, 0, 0, 0.6)',
        shadow:           '#000000',
    }
};

// ── Typography ─────────────────────────────────────────────

export const typography = {
    fontFamily: {
        regular:    'System',   // Falls back to SF Pro / Roboto natively
        medium:     'System',
        semibold:   'System',
        bold:       'System',
    },
    fontSize: {
        xs:    11,
        sm:    13,
        base:  15,
        md:    16,
        lg:    18,
        xl:    20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    fontWeight: {
        regular:  '400' as const,
        medium:   '500' as const,
        semibold: '600' as const,
        bold:     '700' as const,
        black:    '800' as const,
    },
    lineHeight: {
        tight:  1.2,
        normal: 1.5,
        loose:  1.75,
    },
    letterSpacing: {
        tight:  -0.5,
        normal: 0,
        wide:   0.5,
        wider:  1.0,
        widest: 1.5,
    }
};

// ── Spacing & Radius ──────────────────────────────────────

export const spacing = {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    '2xl': 40,
    '3xl': 48,
};

export const radius = {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
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
    fast:      150,
    normal:    300,
    slow:      500,
    spring: {
        damping:   15,
        stiffness: 150,
        mass:      1,
    },
};

// ── Type Export ────────────────────────────────────────────

export type ThemeColors = typeof lightTheme.colors;
export type Theme = typeof lightTheme;