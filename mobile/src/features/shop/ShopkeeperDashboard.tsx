import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../../shared/store/themeStore';
import { lightTheme, darkTheme, spacing, radius, typography, shadows, animation } from '../../shared/theme';

// ─────────────────────────────────────────────────────────
//  ShopkeeperDashboard — Overview + Quick Actions
//  Theme toggle in header, animated metric cards,
//  interactive shop status switch
// ─────────────────────────────────────────────────────────

export const ShopkeeperDashboard = () => {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [shopOpen, setShopOpen] = React.useState(true);

    // ── Count-up animation for metrics ──
    const salesAnim = useRef(new Animated.Value(0)).current;
    const ordersAnim = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.95)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.spring(cardScale, {
                toValue: 1,
                damping: animation.spring.damping,
                stiffness: animation.spring.stiffness,
                useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: animation.slow,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // ── Quick Action Item ──
    const QuickAction = ({ icon, label, color }: { icon: string; label: string; color: string }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.quickAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.sm]}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
                <Feather name={icon as any} size={20} color={color} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.colors.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    // ── Initial letter avatar ──
    const AvatarInitial = () => (
        <View style={[styles.avatar, { backgroundColor: theme.colors.primaryMuted }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>S</Text>
        </View>
    );

    return (
        <ScrollView
            style={[styles.screen, { backgroundColor: theme.colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Header ── */}
            <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
                <View style={styles.headerLeft}>
                    <Feather name="box" size={22} color={theme.colors.primary} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Dashboard
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    {/* Theme Toggle */}
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={[styles.themeToggle, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                        activeOpacity={0.7}
                    >
                        <Feather
                            name={isDarkMode ? 'sun' : 'moon'}
                            size={16}
                            color={isDarkMode ? '#FBBF24' : '#6366F1'}
                        />
                    </TouchableOpacity>
                    {/* Notifications */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Notifications')}
                        style={[styles.themeToggle, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                        activeOpacity={0.7}
                    >
                        <Feather name="bell" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                    <AvatarInitial />
                </View>
            </View>

            <View style={styles.content}>
                {/* ── Greeting ── */}
                <Text style={[styles.greeting, { color: theme.colors.text }]}>Overview</Text>
                <Text style={[styles.greetingSub, { color: theme.colors.textSecondary }]}>
                    Here's what's happening with your shop today.
                </Text>

                {/* ── Shop Status ── */}
                <View style={[styles.statusBanner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.sm]}>
                    <View style={styles.statusLeft}>
                        <View style={[styles.statusDot, { backgroundColor: shopOpen ? theme.colors.success : theme.colors.error }]} />
                        <Text style={[styles.statusText, { color: theme.colors.text }]}>
                            Shop is{' '}
                            <Text style={{ fontWeight: typography.fontWeight.bold }}>
                                {shopOpen ? 'Open' : 'Closed'}
                            </Text>
                        </Text>
                    </View>
                    <Switch
                        value={shopOpen}
                        onValueChange={setShopOpen}
                        trackColor={{
                            false: theme.colors.border,
                            true: theme.colors.primary + '60',
                        }}
                        thumbColor={shopOpen ? theme.colors.primary : theme.colors.textMuted}
                    />
                </View>

                {/* ── Metric Cards ── */}
                <Animated.View style={{ opacity: cardOpacity, transform: [{ scale: cardScale }] }}>
                    {/* Sales Card */}
                    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}>
                        <View style={styles.metricTop}>
                            <View style={[styles.metricIconBox, { backgroundColor: theme.colors.accentMuted }]}>
                                <Feather name="trending-up" size={18} color={theme.colors.accent} />
                            </View>
                            <View style={[styles.badge, { backgroundColor: theme.colors.successBg }]}>
                                <Feather name="arrow-up-right" size={12} color={theme.colors.success} />
                                <Text style={[styles.badgeText, { color: theme.colors.success }]}>+12%</Text>
                            </View>
                        </View>
                        <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>TOTAL SALES</Text>
                        <Text style={[styles.metricValue, { color: theme.colors.primary }]}>₹12,450</Text>
                        <Text style={[styles.metricSub, { color: theme.colors.textMuted }]}>Last 30 days</Text>
                    </View>

                    {/* Orders Card */}
                    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}>
                        <View style={styles.metricTop}>
                            <View style={[styles.metricIconBox, { backgroundColor: theme.colors.primaryMuted }]}>
                                <Feather name="shopping-bag" size={18} color={theme.colors.primary} />
                            </View>
                        </View>
                        <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>ACTIVE ORDERS</Text>
                        <View style={styles.metricRow}>
                            <Text style={[styles.metricValue, { color: theme.colors.text }]}>14</Text>
                            <Text style={[styles.metricSub, { color: theme.colors.textSecondary, marginLeft: spacing.sm }]}>
                                3 to fulfil today
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Quick Actions ── */}
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>QUICK ACTIONS</Text>
                <View style={styles.quickActionsGrid}>
                    <QuickAction icon="camera" label="Scan Item" color={theme.colors.primary} />
                    <QuickAction icon="package" label="Inventory" color={theme.colors.accent} />
                    <QuickAction icon="clipboard" label="Orders" color="#6366F1" />
                    <QuickAction icon="settings" label="Settings" color="#EC4899" />
                </View>
            </View>

            <View style={{ height: spacing['3xl'] }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    themeToggle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },

    // ── Avatar ──
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },

    content: { padding: spacing.lg },

    // ── Greeting ──
    greeting: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
        marginBottom: spacing.xs,
    },
    greetingSub: {
        fontSize: typography.fontSize.base,
        marginBottom: spacing.lg,
    },

    // ── Status Banner ──
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        marginBottom: spacing.lg,
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusText: {
        fontSize: typography.fontSize.base,
    },

    // ── Metric Cards ──
    metricCard: {
        padding: spacing.xl,
        borderRadius: radius.lg,
        borderWidth: 1,
        marginBottom: spacing.md,
    },
    metricTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    metricIconBox: {
        padding: spacing.sm + 2,
        borderRadius: radius.md,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        gap: 2,
    },
    badgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
    },
    metricLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.wider,
        marginBottom: spacing.xs,
    },
    metricValue: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
    },
    metricSub: {
        fontSize: typography.fontSize.sm,
        marginTop: spacing.xs,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    // ── Quick Actions ──
    sectionLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.widest,
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    quickAction: {
        width: '47.5%',
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: 'center',
        gap: spacing.sm,
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
});