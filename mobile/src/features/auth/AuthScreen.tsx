import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../../shared/theme';
import { apiClient } from '../../shared/api/client';
import { useAuthStore } from '../../shared/store/authStore';

export const AuthScreen = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [loading, setLoading] = useState(false);

    // For dev: Let's default to a CUSTOMER login, you can add a toggle later if needed
    const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');

    const signIn = useAuthStore(state => state.signIn);

    const handleRequestOtp = async () => {
        setLoading(true);
        try {
            await apiClient.post('/auth/request-otp', { phone });
            setStep('OTP');
        } catch (error: any) {
            // Now we can actually see WHY it failed in your terminal
            console.error("OTP Request failed:", error.message);
            if (error.response) console.error("Server Data:", error.response.data);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await apiClient.post('/auth/verify-otp', { phone, otp, name: 'New User', role });
            await signIn(res.data.token, res.data.user.role);
        } catch (error: any) {
            // Display the clean error to the user!
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{step === 'PHONE' ? 'Welcome Back' : 'Enter OTP'}</Text>
                <Text style={styles.subtitle}>
                    {step === 'PHONE' ? 'Enter your phone number to continue' : `Code sent to ${phone}`}
                </Text>

                {step === 'PHONE' ? (
                    <TextInput
                        style={styles.input}
                        placeholder="+91 9876543210" // Guide them to use the country code
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        maxLength={13} // Enforces +91 plus 10 digits
                        placeholderTextColor={theme.colors.textLight}
                    />
                ) :

                    (
                        <TextInput
                            style={styles.input}
                            placeholder="123456"
                            keyboardType="number-pad"
                            value={otp}
                            onChangeText={setOtp}
                            maxLength={6}
                            placeholderTextColor={theme.colors.textLight}
                        />
                    )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={step === 'PHONE' ? handleRequestOtp : handleVerifyOtp}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: theme.spacing.lg },
    card: { backgroundColor: theme.colors.surface, padding: theme.spacing.xl, borderRadius: theme.radius.lg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: theme.spacing.sm },
    subtitle: { fontSize: 14, color: theme.colors.textLight, marginBottom: theme.spacing.lg },
    input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.lg },
    button: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.radius.md, alignItems: 'center' },
    buttonText: { color: theme.colors.surface, fontSize: 16, fontWeight: 'bold' }
});