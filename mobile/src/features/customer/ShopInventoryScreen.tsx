import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography, shadows } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { useCartStore } from '../../shared/store/useCartStore';

type RouteParams = {
    params: {
        shopId: string;
        shopName: string;
    };
};

export const ShopInventoryScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    
    const { shopId, shopName } = route.params;

    const [shop, setShop] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const cart = useCartStore();

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await apiClient.get(`/customer/shops/${shopId}/inventory`);
                setShop(res.data.shop);
                setInventory(res.data.inventory);
            } catch (error: any) {
                toast.show('Failed to load shop items', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, [shopId]);

    const handleAddToCart = (item: any) => {
        const success = cart.addItem({
            inventoryId: item.id,
            name: item.item.name,
            brand: item.item.brand,
            weight: item.weight,
            price: item.price,
        }, shopId, shop?.name || shopName);

        if (!success) {
            Alert.alert(
                "Clear Cart?",
                "Your cart contains items from another shop. Clear it to add items from this shop?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Clear Cart", 
                        style: "destructive",
                        onPress: () => {
                            cart.clearCart();
                            cart.addItem({
                                inventoryId: item.id,
                                name: item.item.name,
                                brand: item.item.brand,
                                weight: item.weight,
                                price: item.price,
                            }, shopId, shop?.name || shopName);
                        }
                    }
                ]
            );
        } else {
            toast.show('Added to cart', 'success');
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const cartItem = cart.items.find(i => i.inventoryId === item.id);
        const quantityInCart = cartItem ? cartItem.quantity : 0;

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.cardLeft}>
                    <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
                        {item.item.name}
                    </Text>
                    <Text style={[styles.itemBrand, { color: theme.colors.textSecondary }]}>
                        {item.item.brand} {item.weight ? `• ${item.weight}` : ''}
                    </Text>
                    <Text style={[styles.price, { color: theme.colors.primary }]}>₹{item.price}</Text>
                </View>
                
                <View style={styles.cardRight}>
                    {quantityInCart > 0 ? (
                        <View style={[styles.qtyControl, { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primary }]}>
                            <TouchableOpacity onPress={() => cart.decrementItem(item.id)} style={styles.qtyBtn}>
                                <Feather name="minus" size={16} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={[styles.qtyText, { color: theme.colors.primary }]}>{quantityInCart}</Text>
                            <TouchableOpacity onPress={() => handleAddToCart(item)} style={styles.qtyBtn}>
                                <Feather name="plus" size={16} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.addBtn, { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primary }]}
                            onPress={() => handleAddToCart(item)}
                        >
                            <Text style={[styles.addBtnText, { color: theme.colors.primary }]}>ADD</Text>
                        </TouchableOpacity>
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, paddingLeft: spacing.sm }}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>{shop?.name || shopName}</Text>
                    {shop?.address && <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>{shop.address}</Text>}
                </View>
            </View>

            <FlatList
                data={inventory}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />

            {/* Sticky Cart Footer */}
            {cart.items.length > 0 && cart.shopId === shopId && (
                <View style={[styles.cartFooter, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
                    <View>
                        <Text style={[styles.cartTotalItems, { color: theme.colors.textSecondary }]}>{cart.getItemCount()} items</Text>
                        <Text style={[styles.cartTotalPrice, { color: theme.colors.text }]}>₹{cart.getTotal()}</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.viewCartBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Text style={styles.viewCartText}>View Cart</Text>
                        <Feather name="chevron-right" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    headerSubtitle: { fontSize: typography.fontSize.xs, marginTop: 2 },
    
    listContent: { padding: spacing.md, paddingBottom: 120 },
    card: {
        flexDirection: 'row',
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    cardLeft: { flex: 1, paddingRight: spacing.sm },
    itemName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, marginBottom: spacing.xs },
    itemBrand: { fontSize: typography.fontSize.xs, marginBottom: spacing.xs },
    price: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold },
    
    cardRight: { minWidth: 90, alignItems: 'center' },
    addBtn: {
        borderWidth: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        width: '100%',
        alignItems: 'center',
    },
    addBtnText: { fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm },
    
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: radius.md,
        width: '100%',
    },
    qtyBtn: { padding: spacing.sm },
    qtyText: { fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm },

    cartFooter: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingBottom: spacing['2xl'], // safe area approx
        borderTopWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10,
    },
    cartTotalItems: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
    cartTotalPrice: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
    viewCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
    },
    viewCartText: { color: '#fff', fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.base }
});
