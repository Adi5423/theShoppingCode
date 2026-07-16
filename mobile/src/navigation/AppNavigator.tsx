import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { useAuthStore } from '../shared/store/authStore';
import { AuthScreen } from '../features/auth/AuthScreen';

const Stack = createNativeStackNavigator();

// Temporary Placeholders for our main screens
const CustomerHome = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Customer Map View</Text></View>;
const ShopkeeperHome = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Shopkeeper Scanner</Text></View>;

export const AppNavigator = () => {
    const { token, role } = useAuthStore();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token === null ? (
                    // User is not logged in
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : role === 'SHOPKEEPER' ? (
                    // User is logged in as a Shopkeeper
                    <Stack.Screen name="ShopkeeperHome" component={ShopkeeperHome} />
                ) : (
                    // User is logged in as a Customer
                    <Stack.Screen name="CustomerHome" component={CustomerHome} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};