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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography, shadows } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';

export const CustomerOrdersScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get('/orders');
            setOrders(res.data.orders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const renderStatusBadge = (status: string) => {
        let color = theme.colors.textSecondary;
        let bg = theme.colors.surface;
        let label = status;

        switch(status) {
            case 'PENDING': color = '#F59E0B'; bg = '#FEF3C7'; label = 'Waiting for Shop'; break;
            case 'ACCEPTED': color = '#3B82F6'; bg = '#DBEAFE'; label = 'Preparing'; break;
            case 'READY_FOR_PICKUP': color = theme.colors.primary; bg = theme.colors.primaryMuted; label = 'Ready to Pickup'; break;
            case 'COMPLETED': color = theme.colors.success; bg = '#D1FAE5'; label = 'Completed'; break;
            case 'CANCELLED': color = theme.colors.error; bg = '#FEE2E2'; label = 'Cancelled'; break;
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                <Text style={[styles.statusText, { color }]}>{label}</Text>
            </View>
        );
    };

    const renderOrder = ({ item }: { item: any }) => {
        const isActive = item.status !== 'COMPLETED' && item.status !== 'CANCELLED';

        return (
            <View style={[styles.orderCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={[styles.shopName, { color: theme.colors.text }]}>{item.shop.name}</Text>
                        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <Text style={[styles.orderTotal, { color: theme.colors.primary }]}>₹{item.totalAmount}</Text>
                </View>
                
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

                <Text style={[styles.itemsPreview, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.items.map((i: any) => `${i.quantity}x ${i.inventory.item.name}`).join(', ')}
                </Text>

                <View style={styles.orderFooter}>
                    {renderStatusBadge(item.status)}
                    
                    {isActive && (
                        <View style={[styles.codeContainer, { borderColor: theme.colors.primary }]}>
                            <Text style={[styles.codeLabel, { color: theme.colors.textSecondary }]}>PIN:</Text>
                            <Text style={[styles.codeValue, { color: theme.colors.primary }]}>{item.pickupCode}</Text>
                        </View>
                    )}
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

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.center}>
                    <View style={[styles.heroIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="shopping-bag" size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No orders yet</Text>
                    <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                        You haven't placed any orders. Start exploring local shops!
                    </Text>
                    <TouchableOpacity 
                        style={[styles.browseBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Text style={styles.browseText}>Browse Items</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
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
    browseBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.xl },
    browseText: { color: '#fff', fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.base },

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
    shopName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: 2 },
    dateText: { fontSize: typography.fontSize.xs },
    orderTotal: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    
    divider: { height: 1, marginVertical: spacing.sm },
    itemsPreview: { fontSize: typography.fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
    
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
    statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase' },
    
    codeContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, borderStyle: 'dashed' },
    codeLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
    codeValue: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, letterSpacing: 2 },
});
