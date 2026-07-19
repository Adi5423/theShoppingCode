import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCartStore } from '../store/useCartStore';
import { useThemeStore } from '../store/themeStore';
import { lightTheme, darkTheme, spacing, radius, typography } from '../theme';

export const GlobalCartBar = () => {
    const cart = useCartStore();
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    if (cart.items.length === 0) return null;

    const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.getTotal();

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Cart')}
            style={[
                styles.container,
                { backgroundColor: theme.colors.primary }
            ]}
        >
            <View style={styles.leftInfo}>
                <Text style={styles.itemCountText}>
                    {totalItems} ITEM{totalItems > 1 ? 'S' : ''}
                </Text>
                <Text style={styles.priceText}>₹{totalPrice}</Text>
            </View>
            <View style={styles.rightInfo}>
                <Text style={styles.viewCartText}>View Cart</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm, // Slight gap above bottom tabs
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    leftInfo: {
        flexDirection: 'column',
    },
    itemCountText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        marginBottom: 2,
    },
    priceText: {
        color: '#fff',
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },
    rightInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    viewCartText: {
        color: '#fff',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
    },
});
