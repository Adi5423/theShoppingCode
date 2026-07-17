import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { theme } from '../../shared/theme';
import { apiClient } from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/authStore';

export const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');
    const [loading, setLoading] = useState(false);

    const signIn = useAuthStore(state => state.signIn);

    const handleSubmit = async () => {
        // Frontend Guardrail: Basic 10 digit check
        if (phone.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        const formattedPhone = `+91${phone}`;

        try {
            if (isLogin) {
                const res = await apiClient.post('/auth/login', { phone: formattedPhone, password });
                await signIn(res.data.token, res.data.user.role);
            } else {
                if (!name) return Alert.alert("Error", "Name is required for registration.");
                const res = await apiClient.post('/auth/register', {
                    phone: formattedPhone,
                    password,
                    name,
                    role,
                    otp: '123456' // Keep our dev bypass for the backend requirement
                });
                await signIn(res.data.token, res.data.user.role);
            }
        } catch (error: any) {
            Alert.alert("Authentication Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

                {!isLogin && (
                    <>
                        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} placeholderTextColor={theme.colors.textLight} />
                        <View style={styles.roleToggle}>
                            <TouchableOpacity style={[styles.roleBtn, role === 'CUSTOMER' && styles.roleBtnActive]} onPress={() => setRole('CUSTOMER')}>
                                <Text style={[styles.roleText, role === 'CUSTOMER' && styles.roleTextActive]}>Shopper</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.roleBtn, role === 'SHOPKEEPER' && styles.roleBtnActive]} onPress={() => setRole('SHOPKEEPER')}>
                                <Text style={[styles.roleText, role === 'SHOPKEEPER' && styles.roleTextActive]}>Shopkeeper</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <View style={styles.phoneInputContainer}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput style={[styles.input, styles.phoneInput]} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={10} placeholderTextColor={theme.colors.textLight} />
                </View>

                <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor={theme.colors.textLight} />

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchTextContainer}>
                    <Text style={styles.switchText}>{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: theme.spacing.lg },
    card: { backgroundColor: theme.colors.surface, padding: theme.spacing.xl, borderRadius: theme.radius.lg, elevation: 2 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.lg, textAlign: 'center' },
    input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.md },
    phoneInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
    countryCode: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.border, paddingVertical: 14, borderRadius: theme.radius.md, marginRight: theme.spacing.sm },
    phoneInput: { flex: 1, marginBottom: 0 },
    roleToggle: { flexDirection: 'row', marginBottom: theme.spacing.md, backgroundColor: theme.colors.background, borderRadius: theme.radius.md, padding: 4 },
    roleBtn: { flex: 1, padding: theme.spacing.sm, alignItems: 'center', borderRadius: theme.radius.sm },
    roleBtnActive: { backgroundColor: theme.colors.primary },
    roleText: { color: theme.colors.textLight, fontWeight: 'bold' },
    roleTextActive: { color: '#fff' },
    button: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.sm },
    buttonText: { color: theme.colors.surface, fontSize: 16, fontWeight: 'bold' },
    switchTextContainer: { marginTop: theme.spacing.lg, alignItems: 'center' },
    switchText: { color: theme.colors.primary, fontWeight: '600' }
});