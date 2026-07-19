import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../shared/store/authStore';
import { useThemeStore } from '../../shared/store/themeStore';
import { lightTheme, darkTheme, spacing, radius, typography, shadows } from '../../shared/theme';

export const ShopkeeperSettings = () => {
    const signOut = useAuthStore(state => state.signOut);
    const { isDarkMode, toggleTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
            </View>
            <View style={styles.content}>
                {/* Theme Toggle */}
                <TouchableOpacity
                    onPress={toggleTheme}
                    style={[styles.option, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.sm]}
                    activeOpacity={0.7}
                >
                    <View style={[styles.optionIcon, { backgroundColor: isDarkMode ? '#2A2218' : '#FEF3C7' }]}>
                        <Feather name={isDarkMode ? 'sun' : 'moon'} size={18} color={isDarkMode ? '#FBBF24' : '#6366F1'} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                            Appearance
                        </Text>
                        <Text style={[styles.optionSub, { color: theme.colors.textMuted }]}>
                            {isDarkMode ? 'Dark mode' : 'Light mode'}
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                    onPress={signOut}
                    style={[styles.option, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.errorMuted }]}
                    activeOpacity={0.7}
                >
                    <View style={[styles.optionIcon, { backgroundColor: theme.colors.errorMuted }]}>
                        <Feather name="log-out" size={18} color={theme.colors.error} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={[styles.optionTitle, { color: theme.colors.error }]}>Sign Out</Text>
                        <Text style={[styles.optionSub, { color: theme.colors.error }]}>
                            Log out of your account
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 70, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold },
    content: { padding: spacing.lg },
    option: {
        flexDirection: 'row', alignItems: 'center',
        padding: spacing.md, borderRadius: radius.md,
        borderWidth: 1, marginBottom: spacing.sm, gap: spacing.md,
    },
    optionIcon: {
        width: 40, height: 40, borderRadius: radius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    optionContent: { flex: 1 },
    optionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
    optionSub: { fontSize: typography.fontSize.sm, marginTop: 2 },
});
