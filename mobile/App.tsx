import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Toast } from './src/shared/components/Toast';
import { ThemedStatusBar } from './src/shared/components/StatusBar';
import { useThemeStore } from './src/shared/store/themeStore';
import { lightTheme, darkTheme } from './src/shared/theme';
import { apiClient } from './src/shared/api/client';

// ─────────────────────────────────────────────────────────
//  App — Root component
//  Wraps everything with SafeAreaProvider, renders the
//  Toast overlay on top, and fires a server warmup ping.
// ─────────────────────────────────────────────────────────

export default function App() {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    // Fire a warmup ping to wake the Render free-tier server
    useEffect(() => {
        apiClient.get('/health').catch(() => {
            // Silent — this is just to wake the server
        });
    }, []);

    return (
        <SafeAreaProvider>
            <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
                <ThemedStatusBar />
                <AppNavigator />
                <Toast />
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});