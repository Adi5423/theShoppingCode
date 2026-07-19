import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../shared/store/authStore';
import { useThemeStore } from '../shared/store/themeStore';
import { lightTheme, darkTheme, spacing, radius, typography, shadows } from '../shared/theme';
import { apiClient } from '../shared/api/client';
import { useState } from 'react';

// ── Screens ──
import { AuthScreen } from '../features/auth/AuthScreen';
import { ShopkeeperHome } from '../features/shop/ShopkeeperHome';
import { ShopSetupScreen } from '../features/shop/ShopSetupScreen';
import { ShopkeeperDashboard } from '../features/shop/ShopkeeperDashboard';

// ─────────────────────────────────────────────────────────
//  AppNavigator — Premium tab bar, themed skeletons,
//  branded loading states
// ─────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Styled "Coming Soon" Skeleton ──
const ComingSoonScreen = ({ icon, title, description }: { icon: string; title: string; description: string }) => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <View style={[skeletonStyles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[skeletonStyles.iconWrap, { backgroundColor: theme.colors.primaryMuted }]}>
                <Feather name={icon as any} size={36} color={theme.colors.primary} />
            </View>
            <Text style={[skeletonStyles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[skeletonStyles.desc, { color: theme.colors.textSecondary }]}>{description}</Text>
            <View style={[skeletonStyles.badge, { backgroundColor: theme.colors.accentMuted }]}>
                <Feather name="clock" size={12} color={theme.colors.accent} />
                <Text style={[skeletonStyles.badgeText, { color: theme.colors.accent }]}>Coming Soon</Text>
            </View>
        </View>
    );
};

const skeletonStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    iconWrap: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.sm,
    },
    desc: {
        fontSize: typography.fontSize.base,
        textAlign: 'center',
        lineHeight: typography.fontSize.base * typography.lineHeight.normal,
        marginBottom: spacing.lg,
        maxWidth: 280,
    },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: radius.full,
    },
    badgeText: {
        fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold,
    },
});

// ── Customer Skeleton Screens ──
const CustomerSearch = () => (
    <ComingSoonScreen
        icon="map-pin"
        title="Discover Nearby"
        description="Find grocery and retail items at shops in your neighborhood."
    />
);
const CustomerOrders = () => (
    <ComingSoonScreen
        icon="package"
        title="Your Orders"
        description="Track your order status and pickup details in real time."
    />
);
const CustomerProfile = () => {
    const signOut = useAuthStore(state => state.signOut);
    const { isDarkMode, toggleTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <View style={[profileStyles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[profileStyles.avatar, { backgroundColor: theme.colors.primaryMuted }]}>
                <Feather name="user" size={32} color={theme.colors.primary} />
            </View>
            <Text style={[profileStyles.name, { color: theme.colors.text }]}>My Profile</Text>

            {/* Theme Toggle */}
            <TouchableOpacity
                onPress={toggleTheme}
                style={[profileStyles.option, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                activeOpacity={0.7}
            >
                <Feather name={isDarkMode ? 'sun' : 'moon'} size={18} color={theme.colors.text} />
                <Text style={[profileStyles.optionText, { color: theme.colors.text }]}>
                    {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Text>
                <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
                onPress={signOut}
                style={[profileStyles.option, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.errorMuted }]}
                activeOpacity={0.7}
            >
                <Feather name="log-out" size={18} color={theme.colors.error} />
                <Text style={[profileStyles.optionText, { color: theme.colors.error }]}>Sign Out</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.error} />
            </TouchableOpacity>
        </View>
    );
};

const profileStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.md,
    },
    name: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xl,
    },
    option: {
        flexDirection: 'row', alignItems: 'center',
        width: '100%', padding: spacing.md,
        borderRadius: radius.md, borderWidth: 1,
        marginBottom: spacing.sm, gap: spacing.sm,
    },
    optionText: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
    },
});

// ── Shopkeeper Skeleton ──
const ShopkeeperOrders = () => (
    <ComingSoonScreen
        icon="clipboard"
        title="Incoming Orders"
        description="Accept, reject, and manage customer orders in real time."
    />
);

const ShopkeeperSettings = () => {
    const signOut = useAuthStore(state => state.signOut);
    const { isDarkMode, toggleTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <View style={[settingsStyles.container, { backgroundColor: theme.colors.background }]}>
            <View style={settingsStyles.header}>
                <Text style={[settingsStyles.title, { color: theme.colors.text }]}>Settings</Text>
            </View>
            <View style={settingsStyles.content}>
                {/* Theme Toggle */}
                <TouchableOpacity
                    onPress={toggleTheme}
                    style={[settingsStyles.option, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.sm]}
                    activeOpacity={0.7}
                >
                    <View style={[settingsStyles.optionIcon, { backgroundColor: isDarkMode ? '#2A2218' : '#FEF3C7' }]}>
                        <Feather name={isDarkMode ? 'sun' : 'moon'} size={18} color={isDarkMode ? '#FBBF24' : '#6366F1'} />
                    </View>
                    <View style={settingsStyles.optionContent}>
                        <Text style={[settingsStyles.optionTitle, { color: theme.colors.text }]}>
                            Appearance
                        </Text>
                        <Text style={[settingsStyles.optionSub, { color: theme.colors.textMuted }]}>
                            {isDarkMode ? 'Dark mode' : 'Light mode'}
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                    onPress={signOut}
                    style={[settingsStyles.option, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.errorMuted }]}
                    activeOpacity={0.7}
                >
                    <View style={[settingsStyles.optionIcon, { backgroundColor: theme.colors.errorMuted }]}>
                        <Feather name="log-out" size={18} color={theme.colors.error} />
                    </View>
                    <View style={settingsStyles.optionContent}>
                        <Text style={[settingsStyles.optionTitle, { color: theme.colors.error }]}>Sign Out</Text>
                        <Text style={[settingsStyles.optionSub, { color: theme.colors.error }]}>
                            Log out of your account
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const settingsStyles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 70, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold },
    content: { padding: spacing.lg },
    option: {
        flexDirection: 'row', alignItems: 'center',
        padding: spacing.md, borderRadius: radius.md,
        borderWidth: 1, marginBottom: spacing.sm, gap: spacing.md,
    },
    optionIcon: {
        width: 40, height: 40, borderRadius: radius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    optionContent: { flex: 1 },
    optionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
    optionSub: { fontSize: typography.fontSize.sm, marginTop: 2 },
});

// ── Customer Tabs ──
const CustomerTabs = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.tabActive,
                tabBarInactiveTintColor: theme.colors.tabInactive,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBarBg,
                    borderTopColor: theme.colors.tabBarBorder,
                    borderTopWidth: 1,
                    paddingBottom: 6,
                    paddingTop: 6,
                    height: 62,
                    ...shadows.sm,
                },
                tabBarLabelStyle: {
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                },
                tabBarIcon: ({ color }) => {
                    let iconName: any = 'search';
                    if (route.name === 'Search') iconName = 'map-pin';
                    else if (route.name === 'Orders') iconName = 'package';
                    else if (route.name === 'Profile') iconName = 'user';
                    return <Feather name={iconName} size={21} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Search" component={CustomerSearch} options={{ title: 'Discover' }} />
            <Tab.Screen name="Orders" component={CustomerOrders} options={{ title: 'Orders' }} />
            <Tab.Screen name="Profile" component={CustomerProfile} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

// ── Shopkeeper Tabs ──
const ShopkeeperTabs = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.tabActive,
                tabBarInactiveTintColor: theme.colors.tabInactive,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBarBg,
                    borderTopColor: theme.colors.tabBarBorder,
                    borderTopWidth: 1,
                    paddingBottom: 6,
                    paddingTop: 6,
                    height: 62,
                    ...shadows.sm,
                },
                tabBarLabelStyle: {
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                },
                tabBarIcon: ({ color }) => {
                    let iconName: any = 'box';
                    if (route.name === 'Dashboard') iconName = 'layout';
                    else if (route.name === 'Orders') iconName = 'clipboard';
                    else if (route.name === 'Inventory') iconName = 'package';
                    else if (route.name === 'Settings') iconName = 'settings';
                    return <Feather name={iconName} size={21} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={ShopkeeperDashboard} />
            <Tab.Screen name="Orders" component={ShopkeeperOrders} />
            <Tab.Screen name="Inventory" component={ShopkeeperHome} />
            <Tab.Screen name="Settings" component={ShopkeeperSettings} />
        </Tab.Navigator>
    );
};

// ── Branded Loading Screen (Gatekeeper) ──
const BrandedLoading = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <View style={[loadingStyles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[loadingStyles.iconWrap, { backgroundColor: theme.colors.primaryMuted }]}>
                <Feather name="shopping-bag" size={32} color={theme.colors.primary} />
            </View>
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: spacing.lg }} />
            <Text style={[loadingStyles.text, { color: theme.colors.textMuted }]}>
                Loading your shop...
            </Text>
        </View>
    );
};

const loadingStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    iconWrap: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
    },
    text: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});

// ── The Gatekeeper ──
const ShopkeeperRoot = () => {
    const [hasShop, setHasShop] = useState<boolean | null>(null);

    useEffect(() => {
        const checkShop = async () => {
            try {
                await apiClient.get('/shop/me');
                setHasShop(true);
            } catch {
                setHasShop(false);
            }
        };
        checkShop();
    }, []);

    if (hasShop === null) return <BrandedLoading />;
    if (!hasShop) return <ShopSetupScreen onComplete={() => setHasShop(true)} />;
    return <ShopkeeperTabs />;
};

// ── Main Navigator ──
export const AppNavigator = () => {
    const { token, role } = useAuthStore();
    const { isDarkMode, loadPersistedTheme } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    // Load persisted theme on mount
    useEffect(() => {
        loadPersistedTheme();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token === null ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : role === 'SHOPKEEPER' ? (
                    <Stack.Screen name="ShopkeeperMain" component={ShopkeeperRoot} />
                ) : (
                    <Stack.Screen name="CustomerMain" component={CustomerTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};