import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography, shadows } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';

type InventoryItem = {
    id: string;
    price: number;
    isLive: boolean;
    weight: string;
    stockQuantity: number;
    item: {
        name: string;
        brand: string;
        variant: string;
    };
    variants: Array<{
        id: string;
        label: string;
    }>;
};

export const InventoryListScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);

    const fetchInventory = async () => {
        try {
            const res = await apiClient.get('/inventory');
            setItems(res.data.inventory);
        } catch (error: any) {
            toast.show(error.message || 'Failed to fetch inventory', 'error');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchInventory();
        }, [])
    );

    const toggleLive = async (id: string, currentLive: boolean) => {
        setMenuOpenForId(null);
        try {
            await apiClient.patch(`/inventory/${id}/toggle-live`, { isLive: !currentLive });
            setItems(prev => prev.map(item => item.id === id ? { ...item, isLive: !currentLive } : item));
            toast.show(currentLive ? 'Item marked unlive' : 'Item marked live', 'success');
        } catch (error: any) {
            toast.show(error.message || 'Failed to update item', 'error');
        }
    };

    const deleteItem = async (id: string) => {
        setMenuOpenForId(null);
        Alert.alert(
            "Delete Item",
            "Are you sure you want to remove this item from your inventory?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/inventory/${id}`);
                            setItems(prev => prev.filter(item => item.id !== id));
                            toast.show('Item deleted', 'success');
                        } catch (error: any) {
                            toast.show(error.message || 'Failed to delete item', 'error');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: InventoryItem }) => {
        return (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={[styles.statusDot, { backgroundColor: item.isLive ? theme.colors.success : theme.colors.error }]} />
                        <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
                            {item.item.name}
                        </Text>
                    </View>
                    
                    <TouchableOpacity 
                        onPress={() => setMenuOpenForId(menuOpenForId === item.id ? null : item.id)}
                        style={styles.menuTrigger}
                    >
                        <Feather name="more-vertical" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {menuOpenForId === item.id && (
                    <View style={[styles.menu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.elevated]}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpenForId(null); navigation.navigate('AddProduct', { inventoryItem: item }); }}>
                            <Feather name="edit-2" size={16} color={theme.colors.text} />
                            <Text style={[styles.menuText, { color: theme.colors.text }]}>Edit</Text>
                        </TouchableOpacity>
                        <View style={[styles.menuDivider, { backgroundColor: theme.colors.divider }]} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => toggleLive(item.id, item.isLive)}>
                            <Feather name={item.isLive ? "eye-off" : "eye"} size={16} color={theme.colors.text} />
                            <Text style={[styles.menuText, { color: theme.colors.text }]}>
                                {item.isLive ? 'Make Unlive' : 'Make Live'}
                            </Text>
                        </TouchableOpacity>
                        <View style={[styles.menuDivider, { backgroundColor: theme.colors.divider }]} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => deleteItem(item.id)}>
                            <Feather name="trash-2" size={16} color={theme.colors.error} />
                            <Text style={[styles.menuText, { color: theme.colors.error }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={[styles.itemBrand, { color: theme.colors.textSecondary }]}>
                    {item.item.brand} {item.weight ? `• ${item.weight}` : ''}
                </Text>
                
                <View style={styles.cardFooter}>
                    <Text style={[styles.price, { color: theme.colors.primary }]}>₹{item.price}</Text>
                    <View style={[styles.stockBadge, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.stockText, { color: theme.colors.textSecondary }]}>
                            Stock: {item.stockQuantity}
                        </Text>
                    </View>
                </View>

                {item.variants && item.variants.length > 0 && (
                    <View style={styles.variantsContainer}>
                        {item.variants.map(v => (
                            <View key={v.id} style={[styles.variantChip, { backgroundColor: theme.colors.primaryMuted }]}>
                                <Text style={[styles.variantText, { color: theme.colors.primary }]}>{v.label}</Text>
                            </View>
                        ))}
                    </View>
                )}
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
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Inventory</Text>
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="package" size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No items listed</Text>
                    <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                        Tap the + button below to add products to your shop.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onScrollBeginDrag={() => setMenuOpenForId(null)}
                />
            )}

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: theme.colors.primary }, shadows.elevated]}
                onPress={() => navigation.navigate('BarcodeScanner')}
                activeOpacity={0.8}
            >
                <Feather name="plus" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.sm,
    },
    emptyDesc: {
        fontSize: typography.fontSize.base,
        textAlign: 'center',
        lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    card: {
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        position: 'relative',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    itemName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        flex: 1,
    },
    menuTrigger: {
        padding: spacing.xs,
    },
    itemBrand: {
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },
    stockBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    stockText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
    },
    variantsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    variantChip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    variantText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: {
        position: 'absolute',
        top: 40,
        right: 10,
        borderWidth: 1,
        borderRadius: radius.md,
        zIndex: 100,
        minWidth: 150,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
    },
    menuDivider: {
        height: 1,
        width: '100%',
    },
    menuText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});
