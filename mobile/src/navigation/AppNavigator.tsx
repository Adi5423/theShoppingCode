import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { useAuthStore } from '../shared/store/authStore';
import { AuthScreen } from '../features/auth/AuthScreen';
import { ShopkeeperHome } from '../features/shop/ShopkeeperHome';

const Stack = createNativeStackNavigator();

// Temporary Placeholder for Customer
const CustomerHome = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Customer Map View</Text></View>;

export const AppNavigator = () => {
    const { token, role } = useAuthStore();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token === null ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : role === 'SHOPKEEPER' ? (

                    // Now renders the actual Scanner Component!
                    <Stack.Screen name="ShopkeeperHome" component={ShopkeeperHome} />
                ) : (
                    <Stack.Screen name="CustomerHome" component={CustomerHome} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};