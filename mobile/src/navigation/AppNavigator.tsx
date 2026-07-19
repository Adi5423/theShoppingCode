import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../shared/store/authStore';
import { AuthScreen } from '../features/auth/AuthScreen';
import { ShopkeeperHome } from '../features/shop/ShopkeeperHome';
import { ShopSetupScreen } from '../features/shop/ShopSetupScreen';
import { apiClient } from '../shared/api/client';
import { ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { ShopkeeperDashboard } from '../features/shop/ShopkeeperDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- TEMPORARY SKELETON SCREENS ---
const CustomerSearch = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>🔍 Search Maps</Text></View>;
const CustomerOrders = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>📦 My Orders</Text></View>;
const CustomerProfile = () => {
    const signOut = useAuthStore(state => state.signOut);
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginBottom: 20 }}>👤 Profile View</Text>
            <TouchableOpacity onPress={signOut} style={{ padding: 10, backgroundColor: 'red', borderRadius: 8 }}><Text style={{ color: 'white' }}>Logout</Text></TouchableOpacity>
        </View>
    );
};
const ShopkeeperOrders = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>🔔 Active Orders</Text></View>;
// -----------------------------------

// Tab Navigator for Customers
const CustomerTabs = () => (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#4338CA' }}>
        <Tab.Screen name="Search" component={CustomerSearch} options={{ title: 'Find Items' }} />
        <Tab.Screen name="Orders" component={CustomerOrders} options={{ title: 'My Orders' }} />
        <Tab.Screen name="Profile" component={CustomerProfile} options={{ title: 'Profile' }} />
    </Tab.Navigator>
);

// Tab Navigator for Shopkeepers
const ShopkeeperTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#043927', // The new Deep Green
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
            tabBarIcon: ({ color, size }) => {
                let iconName: any = 'box';
                if (route.name === 'Dashboard') iconName = 'layout';
                else if (route.name === 'Orders') iconName = 'clipboard';
                else if (route.name === 'Inventory') iconName = 'package';
                else if (route.name === 'Settings') iconName = 'settings';
                return <Feather name={iconName} size={22} color={color} />;
            }
        })}
    >
        <Tab.Screen name="Dashboard" component={ShopkeeperDashboard} />
        <Tab.Screen name="Orders" component={ShopkeeperOrders} />
        {/* We moved the scanner component to the Inventory tab for now */}
        <Tab.Screen name="Inventory" component={ShopkeeperHome} />
        <Tab.Screen name="Settings" component={ShopkeeperOrders} />
    </Tab.Navigator>
);

// The Gatekeeper Component
const ShopkeeperRoot = () => {
    const [hasShop, setHasShop] = useState<boolean | null>(null);

    useEffect(() => {
        const checkShop = async () => {
            try {
                await apiClient.get('/shop/me');
                setHasShop(true);
            } catch (error) {
                setHasShop(false); // 404 means no shop exists
            }
        };
        checkShop();
    }, []);

    if (hasShop === null) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
    }

    if (!hasShop) {
        return <ShopSetupScreen onComplete={() => setHasShop(true)} />;
    }

    return <ShopkeeperTabs />;
};

export const AppNavigator = () => {
    const { token, role } = useAuthStore();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token === null ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : role === 'SHOPKEEPER' ? (
                    // Replaced ShopkeeperTabs with the Gatekeeper
                    <Stack.Screen name="ShopkeeperMain" component={ShopkeeperRoot} />
                ) : (
                    <Stack.Screen name="CustomerMain" component={CustomerTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};