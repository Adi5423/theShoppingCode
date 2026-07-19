import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeStore } from '../../shared/store/themeStore';
import { lightTheme, darkTheme, spacing, radius } from '../../shared/theme';

export const ShopkeeperDashboard = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

            {/* Header Area */}
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <Feather name="box" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Shop Manager</Text>
                </View>
                {/* Profile Placeholder from Reference Image */}
                <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.profileAvatar} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Overview</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textLight }]}>Here's what's happening with your shop today.</Text>

                {/* Status Toggle Mockup */}
                <View style={[styles.statusBanner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>Shop Status: <Text style={{ fontWeight: 'bold' }}>Open</Text></Text>
                    <View style={[styles.toggleActive, { backgroundColor: theme.colors.primary }]} />
                </View>

                {/* Metric Card: Sales */}
                <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={styles.metricHeader}>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
                            <Feather name="dollar-sign" size={20} color={theme.colors.text} />
                        </View>
                        <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                            <Feather name="trending-up" size={14} color="#D97706" />
                            <Text style={[styles.badgeText, { color: '#D97706' }]}>+12%</Text>
                        </View>
                    </View>
                    <Text style={[styles.metricLabel, { color: theme.colors.textLight }]}>TOTAL SALES</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primary }]}>₹12,450.00</Text>
                </View>

                {/* Metric Card: Orders */}
                <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={styles.metricHeader}>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
                            <Feather name="shopping-bag" size={20} color={theme.colors.text} />
                        </View>
                    </View>
                    <Text style={[styles.metricLabel, { color: theme.colors.textLight }]}>ACTIVE ORDERS</Text>
                    <View style={styles.orderRow}>
                        <Text style={[styles.metricValue, { color: theme.colors.text }]}>14</Text>
                        <Text style={[styles.orderSubtext, { color: theme.colors.textLight }]}> 3 to ship today</Text>
                    </View>
                </View>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    profileAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCC' },

    content: { padding: spacing.lg },
    pageTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
    subtitle: { fontSize: 15, marginBottom: spacing.lg },

    statusBanner: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.xl },
    statusText: { flex: 1, fontSize: 16 },
    toggleActive: { width: 44, height: 24, borderRadius: 12 }, // Simple visual mockup

    metricCard: { padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
    iconBox: { padding: spacing.sm, borderRadius: radius.md },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
    badgeText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

    metricLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
    metricValue: { fontSize: 36, fontWeight: 'bold' },

    orderRow: { flexDirection: 'row', alignItems: 'baseline' },
    orderSubtext: { fontSize: 14, marginLeft: 8 }
});