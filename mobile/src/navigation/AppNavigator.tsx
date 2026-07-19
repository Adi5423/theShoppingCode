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

import { AuthScreen } from '../features/auth/AuthScreen';
import { InventoryListScreen } from '../features/shop/InventoryListScreen';
import { BarcodeScannerScreen } from '../features/shop/BarcodeScannerScreen';
import { AddProductScreen } from '../features/shop/AddProductScreen';
import { ShopSetupScreen } from '../features/shop/ShopSetupScreen';
import { ShopkeeperDashboard } from '../features/shop/ShopkeeperDashboard';
import { ShopkeeperOrders } from '../features/shop/ShopkeeperOrders';
import { ShopkeeperSettings } from '../features/shop/ShopkeeperSettings';

// ── Customer Screens ──
import { CustomerSearchScreen } from '../features/customer/CustomerSearchScreen';
import { ShopInventoryScreen } from '../features/customer/ShopInventoryScreen';
import { CartScreen } from '../features/customer/CartScreen';
import { CustomerOrdersScreen } from '../features/customer/CustomerOrdersScreen';
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

// ── Customer Search Stack ──
const CustomerSearchStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Search" component={CustomerSearchScreen} />
            <Stack.Screen name="ShopInventory" component={ShopInventoryScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
        </Stack.Navigator>
    );
};

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
                    if (route.name === 'SearchTab') iconName = 'search';
                    else if (route.name === 'OrdersTab') iconName = 'shopping-bag';
                    else if (route.name === 'SettingsTab') iconName = 'user';
                    return <Feather name={iconName} size={21} color={color} />;
                },
            })}
        >
            <Tab.Screen name="SearchTab" component={CustomerSearchStack} options={{ title: 'Explore' }} />
            <Tab.Screen name="OrdersTab" component={CustomerOrdersScreen} options={{ title: 'Orders' }} />
            <Tab.Screen name="SettingsTab" component={ShopkeeperSettings} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
};

// ── Inventory Stack (Shopkeeper) ──
const InventoryStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="InventoryList" component={InventoryListScreen} />
            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
        </Stack.Navigator>
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
            <Tab.Screen name="Inventory" component={InventoryStack} />
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