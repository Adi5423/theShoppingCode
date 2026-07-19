import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { useThemeStore } from '../store/themeStore';

// ─────────────────────────────────────────────────────────
//  ThemedStatusBar — Auto-switches light/dark content
// ─────────────────────────────────────────────────────────

export const ThemedStatusBar = () => {
    const { isDarkMode } = useThemeStore();

    return (
        <RNStatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
        />
    );
};
