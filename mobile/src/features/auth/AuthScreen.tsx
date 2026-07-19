import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Using Feather for cleaner line-art
import { lightTheme, darkTheme, spacing, radius } from '../../shared/theme';
import { apiClient } from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/authStore';
import { useThemeStore } from '../../shared/store/themeStore';

export const AuthScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    const [isLogin, setIsLogin] = useState(true);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');
    const [loading, setLoading] = useState(false);

    const signIn = useAuthStore(state => state.signIn);

    const handleSubmit = async () => {
        if (phone.length !== 10) return Alert.alert("Error", "Enter a 10-digit number.");
        setLoading(true);
        const formattedPhone = `+91${phone}`;
        try {
            if (isLogin) {
                const res = await apiClient.post('/auth/login', { phone: formattedPhone, password });
                await signIn(res.data.token, res.data.user.role);
            } else {
                const res = await apiClient.post('/auth/register', { phone: formattedPhone, password, name, role, otp: '123456' });
                await signIn(res.data.token, res.data.user.role);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>

                {/* Minimalist Icon Header */}
                <View style={styles.iconHeader}>
                    <Feather name="shopping-bag" size={40} color={theme.colors.primary} />
                </View>

                {!isLogin && (
                    <>
                        <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
                            <Feather name="user" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                            <TextInput style={[styles.input, { color: theme.colors.text }]} placeholder="Full Name" value={name} onChangeText={setName} placeholderTextColor={theme.colors.textLight} />
                        </View>

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

                <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
                    <Feather name="phone" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <Text style={{ color: theme.colors.text, fontWeight: 'bold', marginRight: 8 }}>+91</Text>
                    <TextInput style={[styles.input, { color: theme.colors.text }]} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={10} placeholderTextColor={theme.colors.textLight} />
                </View>

                <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
                    <Feather name="lock" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput style={[styles.input, { color: theme.colors.text }]} placeholder="Password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} placeholderTextColor={theme.colors.textLight} autoCapitalize="none" />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>
                </View>

                {isLogin && (
                    <TouchableOpacity style={styles.forgotPasswordBtn}>
                        <Text style={[styles.forgotText, { color: theme.colors.textLight }]}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{isLogin ? 'Login' : 'Create Account'}</Text>}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <Text style={[styles.dividerText, { color: theme.colors.textLight }]}>or</Text>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                </View>

                <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.colors.border }]} onPress={() => { setIsLogin(!isLogin); setPhone(''); setPassword(''); }}>
                    <Text style={[styles.outlineBtnText, { color: theme.colors.text }]}>{isLogin ? 'Register a New Account' : 'Log in to Existing Account'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
    card: { padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    iconHeader: { alignItems: 'center', marginBottom: spacing.xl },

    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 50, marginBottom: spacing.md },
    inputIcon: { marginRight: spacing.sm },
    input: { flex: 1, fontSize: 16 },

    roleToggle: { flexDirection: 'row', marginBottom: spacing.md, borderRadius: radius.md, padding: 4 },
    roleBtn: { flex: 1, padding: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
    roleText: { fontWeight: '600' },

    forgotPasswordBtn: { alignSelf: 'flex-end', marginBottom: spacing.lg },
    forgotText: { fontSize: 12, fontWeight: '500' },

    primaryBtn: { padding: 14, borderRadius: radius.md, alignItems: 'center', marginBottom: spacing.lg },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    divider: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: spacing.md, fontSize: 14 },

    outlineBtn: { padding: 14, borderRadius: radius.md, alignItems: 'center', borderWidth: 1 },
    outlineBtnText: { fontSize: 15, fontWeight: '600' }
});