import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
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

export const CustomerSearchScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [query, setQuery] = useState('');
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await apiClient.get(`/customer/search-shops?query=${encodeURIComponent(query)}`);
            setShops(res.data.shops);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search slightly or just rely on manual search button
    // We'll use manual search for simplicity (onSubmitEditing)

    const renderShop = ({ item }: { item: any }) => {
        // Find the cheapest matched item for display
        const bestPrice = Math.min(...item.matchingItems.map((i: any) => i.price));

        return (
            <TouchableOpacity 
                style={[styles.shopCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ShopInventory', { shopId: item.id, shopName: item.name })}
            >
                <View style={styles.shopHeader}>
                    <View style={[styles.shopIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="shopping-bag" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.shopInfo}>
                        <Text style={[styles.shopName, { color: theme.colors.text }]}>{item.name}</Text>
                        <Text style={[styles.shopAddress, { color: theme.colors.textSecondary }]}>{item.address}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
                </View>
                
                <View style={[styles.matchContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.matchText, { color: theme.colors.textSecondary }]}>
                        <Text style={{ fontWeight: typography.fontWeight.bold, color: theme.colors.primary }}>
                            {item.matchingItems.length}
                        </Text> items match your search (starting at ₹{bestPrice})
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            {/* Header & Search Bar */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Find Items</Text>
                <View style={[styles.searchContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <Feather name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search for groceries, snacks, etc..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Feather name="x-circle" size={18} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : searched && shops.length === 0 ? (
                <View style={styles.center}>
                    <Feather name="map-pin" size={48} color={theme.colors.textMuted} style={{ marginBottom: spacing.md }} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No shops found</Text>
                    <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                        We couldn't find any nearby shops with "{query}". Try another search.
                    </Text>
                </View>
            ) : !searched ? (
                <View style={styles.center}>
                    <View style={[styles.heroIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="compass" size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Explore your neighborhood</Text>
                    <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                        Search for any product to see which local shops have it in stock right now.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={shops}
                    keyExtractor={item => item.id}
                    renderItem={renderShop}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: radius.md,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
    },
    searchIcon: { marginRight: spacing.sm },
    searchInput: { flex: 1, fontSize: typography.fontSize.base, height: '100%' },
    
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    heroIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
    emptyTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm, textAlign: 'center' },
    emptyDesc: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 22 },

    listContent: { padding: spacing.md },
    shopCard: {
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    shopIcon: {
        width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
    },
    shopInfo: { flex: 1 },
    shopName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: 2 },
    shopAddress: { fontSize: typography.fontSize.xs },
    
    matchContainer: {
        marginTop: spacing.xs,
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    matchText: { fontSize: typography.fontSize.sm }
});
