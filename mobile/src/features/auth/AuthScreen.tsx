import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { lightTheme, darkTheme, spacing, radius, typography, shadows, animation } from '../../shared/theme';
import { apiClient } from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/authStore';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { InputField } from '../../shared/components/InputField';
import { Button } from '../../shared/components/Button';

// ─────────────────────────────────────────────────────────
//  AuthScreen — Login & Registration
//  Features: inline errors, toast notifications (no Alert),
//  animated transitions, role selection cards, delayed
//  password masking
// ─────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AuthScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();

    const [isLogin, setIsLogin] = useState(true);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');
    const [loading, setLoading] = useState(false);

    // ── Field-level errors ──
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');

    const signIn = useAuthStore(state => state.signIn);

    // ── Layout animation for login/register transition ──
    const formHeight = useRef(new Animated.Value(0)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(formHeight, {
                toValue: isLogin ? 0 : 1,
                duration: animation.normal,
                useNativeDriver: false,
            }),
            Animated.timing(formOpacity, {
                toValue: isLogin ? 0 : 1,
                duration: animation.normal,
                useNativeDriver: false,
            }),
        ]).start();
    }, [isLogin]);

    // ── Validation ──
    const validatePhone = (val: string) => {
        if (val.length > 0 && val.length !== 10) {
            setPhoneError('Enter a valid 10-digit number');
            return false;
        }
        setPhoneError('');
        return val.length === 10;
    };

    const validatePassword = (val: string) => {
        if (val.length > 0 && val.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }
        setPasswordError('');
        return val.length >= 6;
    };

    const handleSubmit = async () => {
        // Clear previous errors
        setPhoneError('');
        setPasswordError('');
        setNameError('');

        // Validate all fields
        let valid = true;

        if (phone.length !== 10) {
            setPhoneError('Enter a valid 10-digit number');
            valid = false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }
        if (!isLogin && name.trim().length === 0) {
            setNameError('Name is required');
            valid = false;
        }

        if (!valid) return;

        setLoading(true);
        const formattedPhone = `+91${phone}`;

        try {
            if (isLogin) {
                const res = await apiClient.post('/auth/login', { phone: formattedPhone, password });
                toast.show('Welcome back!', 'success');
                await signIn(res.data.token, res.data.user.role);
            } else {
                const res = await apiClient.post('/auth/register', {
                    phone: formattedPhone,
                    password,
                    name,
                    role,
                    otp: '123456',
                });
                toast.show('Account created successfully!', 'success');
                await signIn(res.data.token, res.data.user.role);
            }
        } catch (error: any) {
            toast.show(error.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setPhone('');
        setPassword('');
        setName('');
        setPhoneError('');
        setPasswordError('');
        setNameError('');
    };

    // ── Animated height for register-only fields ──
    const registerFieldsHeight = formHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 180], // Approximate height for name + role selector
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.screen, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Branded Header ── */}
                <View style={styles.brandSection}>
                    <View style={[styles.iconGlow, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="shopping-bag" size={36} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
                        TheShoppingCode
                    </Text>
                    <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
                        {isLogin ? 'Welcome back' : 'Create your account'}
                    </Text>
                </View>

                {/* ── Card ── */}
                <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}>

                    {/* Register-only fields with animated height */}
                    <Animated.View
                        style={{
                            height: registerFieldsHeight,
                            opacity: formOpacity,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Name Field */}
                        <InputField
                            icon="user"
                            placeholder="Full Name"
                            value={name}
                            onChangeText={(val) => { setName(val); if (nameError) setNameError(''); }}
                            error={nameError}
                        />

                        {/* Role Selector Cards */}
                        <View style={styles.roleRow}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[
                                    styles.roleCard,
                                    {
                                        backgroundColor: role === 'CUSTOMER'
                                            ? theme.colors.primaryMuted
                                            : theme.colors.background,
                                        borderColor: role === 'CUSTOMER'
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                    },
                                ]}
                                onPress={() => setRole('CUSTOMER')}
                            >
                                <Feather
                                    name="shopping-cart"
                                    size={20}
                                    color={role === 'CUSTOMER' ? theme.colors.primary : theme.colors.textMuted}
                                />
                                <Text style={[
                                    styles.roleLabel,
                                    {
                                        color: role === 'CUSTOMER'
                                            ? theme.colors.primary
                                            : theme.colors.textSecondary,
                                    },
                                ]}>
                                    Shopper
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[
                                    styles.roleCard,
                                    {
                                        backgroundColor: role === 'SHOPKEEPER'
                                            ? theme.colors.primaryMuted
                                            : theme.colors.background,
                                        borderColor: role === 'SHOPKEEPER'
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                    },
                                ]}
                                onPress={() => setRole('SHOPKEEPER')}
                            >
                                <Feather
                                    name="home"
                                    size={20}
                                    color={role === 'SHOPKEEPER' ? theme.colors.primary : theme.colors.textMuted}
                                />
                                <Text style={[
                                    styles.roleLabel,
                                    {
                                        color: role === 'SHOPKEEPER'
                                            ? theme.colors.primary
                                            : theme.colors.textSecondary,
                                    },
                                ]}>
                                    Shopkeeper
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Phone Field */}
                    <InputField
                        icon="phone"
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={(val) => { setPhone(val); if (phoneError) setPhoneError(''); }}
                        maxLength={10}
                        error={phoneError}
                        onBlur={() => validatePhone(phone)}
                        rightElement={
                            <Text style={[styles.countryCode, { color: theme.colors.textMuted }]}>+91</Text>
                        }
                    />

                    {/* Password Field */}
                    <InputField
                        icon="lock"
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        delayedMasking={!showPassword}
                        value={password}
                        onChangeText={(val) => { setPassword(val); if (passwordError) setPasswordError(''); }}
                        error={passwordError}
                        onBlur={() => validatePassword(password)}
                        rightElement={
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Feather
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={18}
                                    color={theme.colors.textMuted}
                                />
                            </TouchableOpacity>
                        }
                    />

                    {/* Forgot Password */}
                    {isLogin && (
                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={[styles.forgotText, { color: theme.colors.accent }]}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Submit Button */}
                    <Button
                        title={isLogin ? 'Sign In' : 'Create Account'}
                        onPress={handleSubmit}
                        loading={loading}
                        style={{ marginTop: spacing.sm }}
                    />

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
                        <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
                    </View>

                    {/* Toggle Login/Register */}
                    <Button
                        title={isLogin ? 'Create a New Account' : 'Sign in to Existing Account'}
                        onPress={toggleMode}
                        variant="secondary"
                    />
                </View>

                {/* Bottom spacer for keyboard */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },

    // ── Brand Header ──
    brandSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconGlow: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    brandTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
        marginBottom: spacing.xs,
    },
    brandSubtitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.regular,
    },

    // ── Card ──
    card: {
        padding: spacing.xl,
        borderRadius: radius.xl,
        borderWidth: 1,
    },

    // ── Role Selector ──
    roleRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    roleCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm + 2,
        borderRadius: radius.md,
        borderWidth: 1.5,
        gap: spacing.xs,
    },
    roleLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    // ── Country Code ──
    countryCode: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        marginRight: spacing.xs,
    },

    // ── Forgot Password ──
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: spacing.md,
        marginTop: -spacing.sm,
    },
    forgotText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },

    // ── Divider ──
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: typography.fontSize.sm,
    },
});