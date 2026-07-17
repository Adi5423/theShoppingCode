import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../shared/store/authStore';
import { AuthScreen } from '../features/auth/AuthScreen';
import { ShopkeeperHome } from '../features/shop/ShopkeeperHome';

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
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#4338CA' }}>
        <Tab.Screen name="Scanner" component={ShopkeeperHome} options={{ title: 'Scan Inventory' }} />
        <Tab.Screen name="Orders" component={ShopkeeperOrders} options={{ title: 'Manage Orders' }} />
    </Tab.Navigator>
);

export const AppNavigator = () => {
    const { token, role } = useAuthStore();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token === null ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : role === 'SHOPKEEPER' ? (
                    <Stack.Screen name="ShopkeeperMain" component={ShopkeeperTabs} />
                ) : (
                    <Stack.Screen name="CustomerMain" component={CustomerTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};