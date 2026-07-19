import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
    type ViewStyle,
    type TextStyle,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightTheme, darkTheme, spacing, radius, typography } from '../theme';

// ─────────────────────────────────────────────────────────
//  Button — Reusable themed button with variants
//  Variants: primary | secondary | ghost
//  Built-in: loading spinner, press animation
// ─────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    /** Full width (default true) */
    fullWidth?: boolean;
}

export const Button = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
    fullWidth = true,
}: ButtonProps) => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const isDisabled = disabled || loading;

    // ── Style computation ──
    const getContainerStyle = (): ViewStyle => {
        const base: ViewStyle = {
            opacity: isDisabled ? 0.55 : 1,
            width: fullWidth ? '100%' : undefined,
        };

        switch (variant) {
            case 'primary':
                return {
                    ...base,
                    backgroundColor: theme.colors.primary,
                };
            case 'secondary':
                return {
                    ...base,
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: theme.colors.border,
                };
            case 'ghost':
                return {
                    ...base,
                    backgroundColor: 'transparent',
                };
        }
    };

    const getTextStyle = (): TextStyle => {
        switch (variant) {
            case 'primary':
                return { color: theme.colors.textOnPrimary };
            case 'secondary':
                return { color: theme.colors.text };
            case 'ghost':
                return { color: theme.colors.primary, textDecorationLine: 'underline' };
        }
    };

    const spinnerColor = variant === 'primary' ? theme.colors.textOnPrimary : theme.colors.primary;

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: fullWidth ? '100%' : undefined }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                style={[
                    styles.container,
                    getContainerStyle(),
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={spinnerColor} size="small" />
                ) : (
                    <>
                        {icon && icon}
                        <Text style={[styles.text, getTextStyle(), textStyle]}>
                            {title}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        gap: spacing.sm,
        minHeight: 52,
    },
    text: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
});
