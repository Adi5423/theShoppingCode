import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, UIManager, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, spacing, radius } from '../../shared/theme';
import { apiClient } from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/authStore';
import { useThemeStore } from '../../shared/store/themeStore';

// Enable smooth transitions on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const AuthScreen = () => {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    const [isLogin, setIsLogin] = useState(true);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [name, setName] = useState('');
    const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');

    const [loading, setLoading] = useState(false);
    const [uiError, setUiError] = useState(''); // NEW: Inline error state

    const signIn = useAuthStore(state => state.signIn);

    const triggerAnimation = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const handleToggleMode = () => {
        triggerAnimation();
        toggleTheme();
    };

    const switchAuthMode = () => {
        triggerAnimation();
        setIsLogin(!isLogin);
        setUiError('');
    };

    const showError = (msg: string) => {
        triggerAnimation();
        setUiError(msg);
        setTimeout(() => {
            triggerAnimation();
            setUiError('');
        }, 4000); // Auto-hide after 4 seconds
    };

    const handleSubmit = async () => {
        setUiError('');
        if (phone.length !== 10) return showError("Please enter a valid 10-digit phone number.");
        if (password.length < 6) return showError("Password must be at least 6 characters.");

        setLoading(true);
        const formattedPhone = `+91${phone}`;

        try {
            if (isLogin) {
                const res = await apiClient.post('/auth/login', { phone: formattedPhone, password });
                await signIn(res.data.token, res.data.user.role);
            } else {
                if (!name) return showError("Name is required for registration.");
                const res = await apiClient.post('/auth/register', {
                    phone: formattedPhone, password, name, role, otp: '123456'
                });
                await signIn(res.data.token, res.data.user.role);
            }
        } catch (error: any) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* Top Bar with Dark Mode Toggle */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleToggleMode} style={styles.themeToggle}>
                    <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

                {/* Inline Error Banner */}
                {uiError !== '' && (
                    <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error }]}>
                        <Ionicons name="warning" size={20} color={theme.colors.error} style={{ marginRight: spacing.sm }} />
                        <Text style={[styles.errorText, { color: theme.colors.error }]}>{uiError}</Text>
                    </View>
                )}

                {!isLogin && (
                    <>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Full Name" value={name} onChangeText={setName} placeholderTextColor={theme.colors.textLight} autoCapitalize="words" />
                        <View style={[styles.roleToggle, { backgroundColor: theme.colors.background }]}>
                            <TouchableOpacity style={[styles.roleBtn, role === 'CUSTOMER' && { backgroundColor: theme.colors.primary }]} onPress={() => setRole('CUSTOMER')}>
                                <Text style={[styles.roleText, { color: role === 'CUSTOMER' ? '#fff' : theme.colors.textLight }]}>Shopper</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.roleBtn, role === 'SHOPKEEPER' && { backgroundColor: theme.colors.primary }]} onPress={() => setRole('SHOPKEEPER')}>
                                <Text style={[styles.roleText, { color: role === 'SHOPKEEPER' ? '#fff' : theme.colors.textLight }]}>Shopkeeper</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <View style={styles.phoneInputContainer}>
                    <Text style={[styles.countryCode, { color: theme.colors.text, backgroundColor: theme.colors.border }]}>+91</Text>
                    <TextInput style={[styles.input, styles.phoneInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={10} placeholderTextColor={theme.colors.textLight} />
                </View>

                {/* Password Input with Dynamic Eye Icon */}
                <View style={[styles.passwordContainer, { backgroundColor: theme.colors.background, borderColor: isPasswordFocused ? theme.colors.primary : theme.colors.border }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: theme.colors.text }]}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor={theme.colors.textLight}
                        autoCapitalize="none"
                        onFocus={() => { triggerAnimation(); setIsPasswordFocused(true); }}
                        onBlur={() => { triggerAnimation(); setIsPasswordFocused(false); }}
                    />
                    {isPasswordFocused && (
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>

                {isLogin && (
                    <TouchableOpacity style={styles.forgotPasswordBtn}>
                        <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={switchAuthMode} style={styles.switchTextContainer}>
                    <Text style={[styles.switchText, { color: theme.colors.primary }]}>{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

// Static layouts, dynamic colors are applied inline above
const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.lg },
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: spacing.xl, marginBottom: spacing.md },
    themeToggle: { padding: spacing.sm, borderRadius: radius.full },
    card: { padding: spacing.xl, borderRadius: radius.lg, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: spacing.lg, textAlign: 'center' },

    errorBanner: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1 },
    errorText: { fontSize: 14, fontWeight: '500', flex: 1 },

    input: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.md },
    phoneInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    countryCode: { fontSize: 16, fontWeight: 'bold', paddingHorizontal: spacing.md, paddingVertical: 14, borderRadius: radius.md, marginRight: spacing.sm, overflow: 'hidden' },
    phoneInput: { flex: 1, marginBottom: 0 },

    passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, marginBottom: spacing.sm },
    passwordInput: { flex: 1, padding: spacing.md, fontSize: 16 },
    eyeIcon: { padding: spacing.md },

    forgotPasswordBtn: { alignSelf: 'flex-end', marginBottom: spacing.lg },
    forgotPasswordText: { fontWeight: '500', fontSize: 14 },

    roleToggle: { flexDirection: 'row', marginBottom: spacing.md, borderRadius: radius.md, padding: 4 },
    roleBtn: { flex: 1, padding: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
    roleText: { fontWeight: 'bold' },

    button: { padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.sm },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    switchTextContainer: { marginTop: spacing.xl, alignItems: 'center' },
    switchText: { fontWeight: '600', fontSize: 15 }
});