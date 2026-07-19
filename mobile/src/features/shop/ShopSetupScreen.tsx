import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { lightTheme, darkTheme, spacing, radius, typography, shadows } from '../../shared/theme';
import { apiClient } from '../../shared/api/client';
import { InputField } from '../../shared/components/InputField';
import { Button } from '../../shared/components/Button';

// ─────────────────────────────────────────────────────────
//  ShopSetupScreen — Onboarding flow for new shopkeepers
//  Grouped sections, inline validation, toast errors
// ─────────────────────────────────────────────────────────

interface ShopSetupProps {
    onComplete: () => void;
}

export const ShopSetupScreen = ({ onComplete }: ShopSetupProps) => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [address, setAddress] = useState('');
    const [upiId, setUpiId] = useState('');
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('21:00');
    const [loading, setLoading] = useState(false);

    // ── Field errors ──
    const [nameError, setNameError] = useState('');
    const [addressError, setAddressError] = useState('');

    const handleSetup = async () => {
        let valid = true;
        setNameError('');
        setAddressError('');

        if (!name.trim()) {
            setNameError('Store name is required');
            valid = false;
        }
        if (!address.trim()) {
            setAddressError('Address is required');
            valid = false;
        }
        if (!valid) return;

        setLoading(true);
        try {
            await apiClient.post('/shop/setup', {
                name,
                category,
                address,
                upiId,
                openTime,
                closeTime,
                // Hardcoded coordinates for MVP — will be replaced with expo-location
                latitude: 26.8467,
                longitude: 80.9462,
            });
            toast.show('Store created successfully!', 'success');
            onComplete();
        } catch (error: any) {
            toast.show(error.message || 'Setup failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── Section Header Component ──
    const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
        <View style={styles.sectionHeader}>
            <Feather name={icon as any} size={16} color={theme.colors.accent} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                {title}
            </Text>
        </View>
    );

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
                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={[styles.iconGlow, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="home" size={28} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Set Up Your Store
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Tell us about your business to get started.
                    </Text>
                </View>

                {/* ── Progress Indicator ── */}
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View style={[styles.progressFill, { backgroundColor: theme.colors.primary }]} />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                    Step 1 of 1 — Business Details
                </Text>

                {/* ── Business Details Section ── */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}>
                    <SectionHeader icon="briefcase" title="BUSINESS DETAILS" />

                    <InputField
                        icon="tag"
                        label="Store Name"
                        placeholder="e.g., Aditya Mega Mart"
                        value={name}
                        onChangeText={(v) => { setName(v); if (nameError) setNameError(''); }}
                        error={nameError}
                    />

                    <InputField
                        icon="grid"
                        label="Category"
                        placeholder="e.g., Grocery, Electronics"
                        value={category}
                        onChangeText={setCategory}
                    />

                    <InputField
                        icon="map-pin"
                        label="Full Address"
                        placeholder="Street, Area, City"
                        value={address}
                        onChangeText={(v) => { setAddress(v); if (addressError) setAddressError(''); }}
                        error={addressError}
                        multiline
                    />
                </View>

                {/* ── Operating Hours Section ── */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}>
                    <SectionHeader icon="clock" title="OPERATING HOURS" />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: spacing.sm }}>
                            <InputField
                                icon="sunrise"
                                label="Opens"
                                placeholder="09:00"
                                value={openTime}
                                onChangeText={setOpenTime}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                            <InputField
                                icon="sunset"
                                label="Closes"
                                placeholder="21:00"
                                value={closeTime}
                                onChangeText={setCloseTime}
                            />
                        </View>
                    </View>
                </View>

                {/* ── Payment Section ── */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}>
                    <SectionHeader icon="credit-card" title="PAYMENT" />

                    <InputField
                        icon="smartphone"
                        label="UPI ID"
                        placeholder="yourname@paytm"
                        value={upiId}
                        onChangeText={setUpiId}
                        keyboardType="email-address"
                    />
                </View>

                {/* ── Submit ── */}
                <Button
                    title="Complete Setup"
                    onPress={handleSetup}
                    loading={loading}
                    icon={<Feather name="check-circle" size={18} color="#fff" />}
                    style={{ marginTop: spacing.md }}
                />

                <View style={{ height: spacing.xl }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { padding: spacing.lg, paddingTop: 70 },

    // ── Header ──
    header: { alignItems: 'center', marginBottom: spacing.lg },
    iconGlow: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        textAlign: 'center',
    },

    // ── Progress ──
    progressBar: {
        height: 4,
        borderRadius: 2,
        marginBottom: spacing.xs,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        width: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
        marginBottom: spacing.lg,
        letterSpacing: typography.letterSpacing.wide,
    },

    // ── Sections ──
    section: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.widest,
    },

    row: {
        flexDirection: 'row',
    },
});