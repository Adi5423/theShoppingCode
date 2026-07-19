import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { Button } from '../../shared/components/Button';

export const ShopkeeperOrders = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get('/orders');
            setOrders(res.data.orders);
        } catch (error) {
            console.error(error);
            toast.show('Failed to fetch orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.show(`Order marked as ${newStatus.replace(/_/g, ' ')}`, 'success');
        } catch (error) {
            toast.show('Failed to update order status', 'error');
        }
    };

    const renderActionButtons = (item: any) => {
        switch(item.status) {
            case 'PENDING':
                return (
                    <Button 
                        title="Accept & Prepare" 
                        onPress={() => updateStatus(item.id, 'ACCEPTED')} 
                    />
                );
            case 'ACCEPTED':
                return (
                    <Button 
                        title="Mark Ready for Pickup" 
                        onPress={() => updateStatus(item.id, 'READY_FOR_PICKUP')} 
                        style={{ backgroundColor: theme.colors.primary }}
                    />
                );
            case 'READY_FOR_PICKUP':
                return (
                    <View style={{ gap: spacing.sm }}>
                        <View style={[styles.codeVerifyContainer, { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primary }]}>
                            <Feather name="shield" size={16} color={theme.colors.primary} />
                            <Text style={[styles.codeVerifyText, { color: theme.colors.primary }]}>
                                Verify PIN: <Text style={{ fontWeight: typography.fontWeight.bold, letterSpacing: 2 }}>{item.pickupCode}</Text>
                            </Text>
                        </View>
                        <Button 
                            title="Complete Order" 
                            onPress={() => updateStatus(item.id, 'COMPLETED')} 
                            style={{ backgroundColor: theme.colors.success }}
                        />
                    </View>
                );
            case 'COMPLETED':
                return (
                    <View style={[styles.completedBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Feather name="check-circle" size={16} color={theme.colors.success} />
                        <Text style={[styles.completedText, { color: theme.colors.success }]}>Order Completed</Text>
                    </View>
                );
            case 'CANCELLED':
                return (
                    <View style={[styles.completedBadge, { backgroundColor: '#FEE2E2' }]}>
                        <Feather name="x-circle" size={16} color={theme.colors.error} />
                        <Text style={[styles.completedText, { color: theme.colors.error }]}>Order Cancelled</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    const renderOrder = ({ item }: { item: any }) => {
        return (
            <View style={[styles.orderCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={[styles.customerName, { color: theme.colors.text }]}>{item.customer.name || item.customer.phone}</Text>
                        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Text style={[styles.orderTotal, { color: theme.colors.primary }]}>₹{item.totalAmount}</Text>
                </View>
                
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

                <View style={styles.itemsList}>
                    {item.items.map((i: any) => (
                        <View key={i.id} style={styles.itemRow}>
                            <Text style={[styles.itemQty, { color: theme.colors.textSecondary }]}>{i.quantity}x</Text>
                            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
                                {i.inventory.item.name} {i.inventory.weight ? `(${i.inventory.weight})` : ''}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

                <View style={styles.actionContainer}>
                    {renderActionButtons(item)}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Sort: Pending/Accepted/Ready first, Completed/Cancelled last
    const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    const pastOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');
    const sortedOrders = [...activeOrders, ...pastOrders];

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.center}>
                    <View style={[styles.heroIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="clipboard" size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Orders Yet</Text>
                    <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                        When customers place pickup orders, they will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sortedOrders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
    
    listContent: { padding: spacing.md },
    orderCard: {
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    customerName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: 2 },
    dateText: { fontSize: typography.fontSize.xs },
    orderTotal: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    
    divider: { height: 1, marginVertical: spacing.md },
    
    itemsList: { gap: spacing.xs },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemQty: { width: 30, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold },
    itemName: { flex: 1, fontSize: typography.fontSize.base },
    
    actionContainer: { paddingTop: spacing.xs },
    
    codeVerifyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        borderStyle: 'dashed',
    },
    codeVerifyText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
    
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.sm,
        borderRadius: radius.md,
    },
    completedText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase' },
});
