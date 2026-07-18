import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useThemeStore } from '../../shared/store/themeStore';
import { lightTheme, darkTheme, spacing, radius } from '../../shared/theme';
import { apiClient } from '../../shared/api/client';

interface ShopSetupProps {
    onComplete: () => void;
}

export const ShopSetupScreen = ({ onComplete }: ShopSetupProps) => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [address, setAddress] = useState('');
    const [upiId, setUpiId] = useState('');
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('21:00');
    const [loading, setLoading] = useState(false);

    const handleSetup = async () => {
        if (!name || !address) {
            Alert.alert("Missing Fields", "Store Name and Address are required.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/shop/setup', {
                name,
                category,
                address,
                upiId,
                openTime,
                closeTime,
                // Hardcoded coordinates for MVP. We will replace this with expo-location later.
                latitude: 26.8467,
                longitude: 80.9462
            });
            onComplete(); // Tells the router to transition to the tabs
        } catch (error: any) {
            Alert.alert("Setup Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Create Your Store</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textLight }]}>Tell us about your business to get started.</Text>

                <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Store Name (e.g., Aditya Mega Mart)" value={name} onChangeText={setName} placeholderTextColor={theme.colors.textLight} />
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Category (e.g., Grocery, Electronics)" value={category} onChangeText={setCategory} placeholderTextColor={theme.colors.textLight} />
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Full Address" value={address} onChangeText={setAddress} placeholderTextColor={theme.colors.textLight} multiline />

                <View style={styles.row}>
                    <TextInput style={[styles.input, styles.halfInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Open (e.g. 09:00)" value={openTime} onChangeText={setOpenTime} placeholderTextColor={theme.colors.textLight} />
                    <TextInput style={[styles.input, styles.halfInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="Close (e.g. 21:00)" value={closeTime} onChangeText={setCloseTime} placeholderTextColor={theme.colors.textLight} />
                </View>

                <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} placeholder="UPI ID for Payouts" value={upiId} onChangeText={setUpiId} placeholderTextColor={theme.colors.textLight} />

                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.primary }]} onPress={handleSetup} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Complete Setup</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { padding: spacing.xl, paddingTop: 80 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: spacing.sm },
    subtitle: { fontSize: 16, marginBottom: spacing.xl },
    input: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInput: { width: '48%' },
    btn: { padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.lg },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});