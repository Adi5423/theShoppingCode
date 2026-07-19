import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    Animated,
    type TextInputProps,
    type ViewStyle,
    type KeyboardTypeOptions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { lightTheme, darkTheme, spacing, radius, typography, animation } from '../theme';

// ─────────────────────────────────────────────────────────
//  InputField — Themed input with icon, inline error,
//  focus animation, and delayed password masking.
// ─────────────────────────────────────────────────────────

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
    /** Feather icon name for the left slot */
    icon?: keyof typeof Feather.glyphMap;
    /** Error message shown beneath the field */
    error?: string;
    /** Optional right-side element (e.g., eye toggle) */
    rightElement?: React.ReactNode;
    /** Container style override */
    containerStyle?: ViewStyle;
    /** Label text above the input */
    label?: string;
    /**
     * If true, uses delayed masking — last typed char stays
     * visible for ~800ms before converting to bullet.
     * Only works when secureTextEntry is also true.
     */
    delayedMasking?: boolean;
}

export const InputField = ({
    icon,
    error,
    rightElement,
    containerStyle,
    label,
    delayedMasking = false,
    secureTextEntry,
    value = '',
    onChangeText,
    ...rest
}: InputFieldProps) => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    const [isFocused, setIsFocused] = useState(false);
    const borderColor = useRef(new Animated.Value(0)).current;
    const errorOpacity = useRef(new Animated.Value(error ? 1 : 0)).current;

    // ── Delayed masking state ──
    const [maskedValue, setMaskedValue] = useState('');
    const maskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const realValueRef = useRef(value);

    // Keep ref in sync
    useEffect(() => {
        realValueRef.current = value;
    }, [value]);

    // Compute the display value for delayed masking
    useEffect(() => {
        if (!delayedMasking || !secureTextEntry) {
            setMaskedValue(value);
            return;
        }

        if (value.length === 0) {
            setMaskedValue('');
            return;
        }

        // Show last char, mask rest
        const bullets = '•'.repeat(Math.max(0, value.length - 1));
        const lastChar = value[value.length - 1];
        setMaskedValue(bullets + lastChar);

        // After delay, mask everything
        if (maskTimerRef.current) clearTimeout(maskTimerRef.current);
        maskTimerRef.current = setTimeout(() => {
            setMaskedValue('•'.repeat(realValueRef.current.length));
        }, 800);

        return () => {
            if (maskTimerRef.current) clearTimeout(maskTimerRef.current);
        };
    }, [value, delayedMasking, secureTextEntry]);

    // ── Focus animation ──
    useEffect(() => {
        Animated.timing(borderColor, {
            toValue: isFocused ? 1 : 0,
            duration: animation.fast,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    // ── Error animation ──
    useEffect(() => {
        Animated.timing(errorOpacity, {
            toValue: error ? 1 : 0,
            duration: animation.normal,
            useNativeDriver: true,
        }).start();
    }, [error]);

    const interpolatedBorder = borderColor.interpolate({
        inputRange: [0, 1],
        outputRange: [
            error ? theme.colors.error : theme.colors.border,
            error ? theme.colors.error : theme.colors.borderFocused,
        ],
    });

    const useDelayedDisplay = delayedMasking && secureTextEntry;

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                    {label}
                </Text>
            )}
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: interpolatedBorder,
                    },
                ]}
            >
                {icon && (
                    <Feather
                        name={icon as any}
                        size={18}
                        color={isFocused ? theme.colors.primary : theme.colors.textMuted}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        { color: theme.colors.text },
                    ]}
                    placeholderTextColor={theme.colors.textMuted}
                    // If using delayed masking, we handle display ourselves
                    secureTextEntry={useDelayedDisplay ? false : secureTextEntry}
                    value={useDelayedDisplay ? maskedValue : value}
                    onChangeText={useDelayedDisplay ? (text) => {
                        // When user types, figure out the real change
                        const realValue = realValueRef.current;
                        if (text.length > maskedValue.length) {
                            // Character added — append the new char(s)
                            const added = text.slice(maskedValue.length);
                            onChangeText?.(realValue + added);
                        } else if (text.length < maskedValue.length) {
                            // Character(s) removed
                            const diff = maskedValue.length - text.length;
                            onChangeText?.(realValue.slice(0, -diff));
                        }
                    } : onChangeText}
                    onFocus={(e) => {
                        setIsFocused(true);
                        rest.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        rest.onBlur?.(e);
                    }}
                    autoCapitalize="none"
                    {...rest}
                />
                {rightElement}
            </Animated.View>
            {error && (
                <Animated.View style={[styles.errorRow, { opacity: errorOpacity }]}>
                    <Feather name="alert-circle" size={12} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {error}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        height: 52,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.regular,
        paddingVertical: 0,  // Remove default vertical padding
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
        gap: 4,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
    },
});
