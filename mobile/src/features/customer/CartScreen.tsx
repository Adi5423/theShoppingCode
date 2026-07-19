import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography, shadows } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { useCartStore } from '../../shared/store/useCartStore';
import { Button } from '../../shared/components/Button';

export const CartScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    
    const cart = useCartStore();
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (!cart.shopId || cart.items.length === 0) return;

        setLoading(true);
        try {
            const res = await apiClient.post('/orders', {
                shopId: cart.shopId,
                items: cart.items.map(i => ({
                    inventoryId: i.inventoryId,
                    quantity: i.quantity,
                    price: i.price
                }))
            });
            
            const newOrder = res.data.order;
            cart.clearCart();
            toast.show('Order placed successfully!', 'success');
            
            // Navigate to Order Details/History
            navigation.navigate('OrdersTab', { 
                screen: 'CustomerOrders', 
                params: { newOrderId: newOrder.id }
            });
        } catch (error: any) {
            toast.show(error.message || 'Failed to place order', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.cartItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>{item.brand} • {item.weight}</Text>
                <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>₹{item.price}</Text>
            </View>
            <View style={[styles.qtyControl, { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primary }]}>
                <TouchableOpacity onPress={() => cart.decrementItem(item.inventoryId)} style={styles.qtyBtn}>
                    <Feather name="minus" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: theme.colors.primary }]}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => cart.addItem(item, cart.shopId!, cart.shopName!)} style={styles.qtyBtn}>
                    <Feather name="plus" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cart.items.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.heroIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                    <Feather name="shopping-cart" size={40} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Your cart is empty</Text>
                <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                    Looks like you haven't added anything yet.
                </Text>
                <Button 
                    title="Browse Items" 
                    onPress={() => navigation.goBack()} 
                    style={{ marginTop: spacing.xl, width: 200 }} 
                />
            </View>
        );
    }

    const total = cart.getTotal();

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={cart.items}
                keyExtractor={item => item.inventoryId}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.shopHeader}>
                        <Text style={[styles.shopLabel, { color: theme.colors.textSecondary }]}>Ordering from</Text>
                        <Text style={[styles.shopName, { color: theme.colors.text }]}>{cart.shopName}</Text>
                    </View>
                )}
            />

            <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
                <View style={styles.billRow}>
                    <Text style={[styles.billText, { color: theme.colors.textSecondary }]}>Item Total</Text>
                    <Text style={[styles.billText, { color: theme.colors.text }]}>₹{total}</Text>
                </View>
                <View style={styles.billRow}>
                    <Text style={[styles.billText, { color: theme.colors.textSecondary }]}>Pickup Charge</Text>
                    <Text style={[styles.billText, { color: theme.colors.success }]}>FREE</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
                <View style={styles.billRow}>
                    <Text style={[styles.billTotalText, { color: theme.colors.text }]}>Grand Total</Text>
                    <Text style={[styles.billTotalText, { color: theme.colors.primary }]}>₹{total}</Text>
                </View>

                <Button
                    title="Place Pickup Order"
                    onPress={handlePlaceOrder}
                    loading={loading}
                    icon={<Feather name="arrow-right" size={20} color="#fff" />}
                    style={{ marginTop: spacing.lg }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    heroIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
    emptyTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm, textAlign: 'center' },
    emptyDesc: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 22 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    
    listContent: { paddingBottom: spacing.xl },
    shopHeader: { padding: spacing.lg, paddingBottom: spacing.sm },
    shopLabel: { fontSize: typography.fontSize.xs, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
    shopName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
    
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
    },
    itemInfo: { flex: 1, paddingRight: spacing.md },
    itemName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, marginBottom: 2 },
    itemMeta: { fontSize: typography.fontSize.xs, marginBottom: spacing.xs },
    itemPrice: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold },
    
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: radius.md,
    },
    qtyBtn: { padding: spacing.sm, paddingHorizontal: spacing.md },
    qtyText: { fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.base },

    footer: {
        padding: spacing.xl,
        paddingBottom: 40, // safe area
        borderTopWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10,
    },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    billText: { fontSize: typography.fontSize.base },
    billTotalText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    divider: { height: 1, marginVertical: spacing.md },
});
