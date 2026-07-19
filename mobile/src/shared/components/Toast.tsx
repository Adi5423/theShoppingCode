import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, type ToastType } from '../store/toastStore';
import { useThemeStore } from '../store/themeStore';
import { lightTheme, darkTheme, radius, spacing, typography, animation } from '../theme';

// ─────────────────────────────────────────────────────────
//  Toast — Slide-in notification overlay
//  Renders at the TOP of the screen, above all content.
//  Usage: useToastStore().show('Something happened', 'error')
// ─────────────────────────────────────────────────────────

const ICON_MAP: Record<ToastType, { name: keyof typeof Feather.glyphMap; color: string }> = {
    error:   { name: 'alert-circle',  color: '#DC3545' },
    success: { name: 'check-circle',  color: '#059669' },
    info:    { name: 'info',          color: '#0284C7' },
};

export const Toast = () => {
    const { visible, message, type, hide } = useToastStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const insets = useSafeAreaInsets();

    const translateY = useRef(new Animated.Value(-120)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    damping: animation.spring.damping,
                    stiffness: animation.spring.stiffness,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: animation.fast,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -120,
                    duration: animation.normal,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: animation.fast,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const icon = ICON_MAP[type];

    // Determine background colors based on type
    const bgMap: Record<ToastType, string> = {
        error:   isDarkMode ? '#2D1B1B' : '#FDF2F2',
        success: isDarkMode ? '#0D2E26' : '#ECFDF5',
        info:    isDarkMode ? '#1A2332' : '#F0F9FF',
    };
    const borderMap: Record<ToastType, string> = {
        error:   isDarkMode ? '#5C2828' : '#F8D7DA',
        success: isDarkMode ? '#1A5C47' : '#A7F3D0',
        info:    isDarkMode ? '#2A3F5F' : '#BAE6FD',
    };

    return (
        <Animated.View
            pointerEvents={visible ? 'auto' : 'none'}
            style={[
                styles.container,
                {
                    paddingTop: insets.top + spacing.xs,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={hide}
                style={[
                    styles.toast,
                    {
                        backgroundColor: bgMap[type],
                        borderColor: borderMap[type],
                    },
                ]}
            >
                <Feather name={icon.name as any} size={20} color={icon.color} />
                <Text
                    style={[
                        styles.message,
                        { color: theme.colors.text },
                    ]}
                    numberOfLines={3}
                >
                    {message}
                </Text>
                <Feather name="x" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingHorizontal: spacing.md,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.sm,
    },
    message: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },
});
