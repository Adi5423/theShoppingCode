import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { Button } from '../../shared/components/Button';
import { InputField } from '../../shared/components/InputField';

type RouteParams = {
    params: {
        barcode?: string;
        catalogItem?: any;
        inventoryItem?: any;
    };
};

type VariantInput = {
    id: string;
    label: string;
};

export const AddProductScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<RouteParams, 'params'>>();

    const inventoryData = route.params?.inventoryItem || {};
    const initialItem = route.params?.catalogItem || inventoryData.item || {};
    const scannedBarcode = route.params?.barcode || initialItem.barcode || '';

    // Form State
    const [name, setName] = useState(initialItem.name || '');
    const [brand, setBrand] = useState(initialItem.brand || '');
    const [weight, setWeight] = useState(inventoryData.weight || initialItem.variant || '');
    const [price, setPrice] = useState(inventoryData.price ? inventoryData.price.toString() : '');
    const [barcode, setBarcode] = useState(scannedBarcode);
    const [description, setDescription] = useState(inventoryData.customDescription || '');

    // Stock State
    const [isPacked, setIsPacked] = useState(inventoryData.isPacked !== undefined ? inventoryData.isPacked : true);
    const [stockQuantity, setStockQuantity] = useState(inventoryData.stockQuantity ? inventoryData.stockQuantity.toString() : '');
    
    // Variant State
    const [variants, setVariants] = useState<VariantInput[]>(inventoryData.variants || []);
    const [loading, setLoading] = useState(false);

    const handleAddVariant = () => {
        setVariants([...variants, { id: Date.now().toString(), label: '' }]);
    };

    const handleUpdateVariant = (id: string, text: string) => {
        setVariants(variants.map(v => v.id === id ? { ...v, label: text } : v));
    };

    const handleRemoveVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.show('Product name is required', 'error');
            return;
        }
        if (!price || isNaN(Number(price))) {
            toast.show('Please enter a valid price', 'error');
            return;
        }

        setLoading(true);
        try {
            // First ensure catalog item exists (useful if added manually)
            let catalogItemId = initialItem.id;
            if (!catalogItemId) {
                const catRes = await apiClient.post('/catalog', {
                    barcode: barcode || null,
                    name,
                    brand,
                    variant: weight,
                    category: null,
                    imageUrl: null
                });
                catalogItemId = catRes.data.item.id;
            } else {
                // Update the existing catalog item with any changes made in the UI
                await apiClient.put(`/catalog/${catalogItemId}`, {
                    name,
                    brand,
                    variant: weight,
                    category: initialItem.category,
                    imageUrl: initialItem.imageUrl
                });
            }

            // Clean variants (remove empty labels)
            const cleanVariants = variants
                .filter(v => v.label.trim())
                .map(v => ({ label: v.label.trim(), stockQuantity: 0, isAvailable: true }));

            // Save to inventory
            await apiClient.post('/inventory', {
                catalogItemId,
                price: Number(price),
                customDescription: description || null,
                status: 'IN_STOCK',
                isLive: true,
                weight: weight || null,
                isPacked,
                stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
                variants: cleanVariants
            });

            toast.show(`${name} added to your inventory!`, 'success');
            
            // Go back to Inventory List root
            navigation.popToTop();
        } catch (error: any) {
            toast.show(error.message || 'Failed to add product', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.screen, { backgroundColor: theme.colors.background }]}
        >
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Product</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* ── Basic Info ── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Product Details</Text>
                    
                    <InputField
                        label="Product Name *"
                        placeholder="e.g. Lay's Magic Masala"
                        value={name}
                        onChangeText={setName}
                        icon="package"
                    />
                    <InputField
                        label="Brand / Company"
                        placeholder="e.g. Lay's"
                        value={brand}
                        onChangeText={setBrand}
                        icon="tag"
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1, paddingRight: spacing.sm }}>
                            <InputField
                                label="Weight / Size"
                                placeholder="e.g. 50g, 1kg"
                                value={weight}
                                onChangeText={setWeight}
                                icon="maximize"
                            />
                        </View>
                        <View style={{ flex: 1, paddingLeft: spacing.sm }}>
                            <InputField
                                label="Price (₹) *"
                                placeholder="0.00"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                icon="dollar-sign"
                            />
                        </View>
                    </View>
                    <InputField
                        label="Barcode (Optional)"
                        placeholder="Scan or enter barcode"
                        value={barcode}
                        onChangeText={setBarcode}
                        icon="hash"
                        keyboardType="numeric"
                    />
                </View>

                {/* ── Stock Details ── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Stock Information</Text>
                    
                    <View style={[styles.switchRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <View>
                            <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Packed Product</Text>
                            <Text style={[styles.switchDesc, { color: theme.colors.textSecondary }]}>
                                {isPacked ? 'Counted in units (e.g. 10 packets)' : 'Measured by weight (e.g. 5.5 kg)'}
                            </Text>
                        </View>
                        <Switch
                            value={isPacked}
                            onValueChange={setIsPacked}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
                            thumbColor={isPacked ? theme.colors.primary : '#f4f3f4'}
                        />
                    </View>

                    <InputField
                        label={isPacked ? "Number of items in stock" : "Available stock quantity"}
                        placeholder={isPacked ? "e.g. 50" : "e.g. 10.5"}
                        value={stockQuantity}
                        onChangeText={setStockQuantity}
                        keyboardType="numeric"
                        icon={isPacked ? "layers" : "pie-chart"}
                    />
                </View>

                {/* ── Variants ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>Variants</Text>
                            <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>Add flavors, colors, or sizes</Text>
                        </View>
                        <TouchableOpacity onPress={handleAddVariant} style={[styles.addBtn, { backgroundColor: theme.colors.primaryMuted }]}>
                            <Feather name="plus" size={16} color={theme.colors.primary} />
                            <Text style={[styles.addBtnText, { color: theme.colors.primary }]}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {variants.map((v, index) => (
                        <View key={v.id} style={styles.variantRow}>
                            <View style={{ flex: 1 }}>
                                <InputField
                                    placeholder={`Variant ${index + 1} (e.g. Tomato flavor)`}
                                    value={v.label}
                                    onChangeText={(text) => handleUpdateVariant(v.id, text)}
                                />
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveVariant(v.id)} style={styles.removeBtn}>
                                <Feather name="trash-2" size={20} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* ── Additional Info ── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Additional Information</Text>
                    <InputField
                        label="Description (Optional)"
                        placeholder="Any extra details about the product"
                        value={description}
                        onChangeText={setDescription}
                        icon="align-left"
                    />
                </View>

                <Button
                    title="Save Product to Inventory"
                    onPress={handleSubmit}
                    loading={loading}
                    icon={<Feather name="check" size={20} color="#fff" />}
                    style={{ marginTop: spacing.md }}
                />

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    
    scrollContent: { padding: spacing.lg, paddingBottom: 100 },
    
    section: { marginBottom: spacing['2xl'] },
    sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.lg },
    sectionDesc: { fontSize: typography.fontSize.sm, marginTop: spacing.xs },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    
    row: { flexDirection: 'row' },
    
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
        marginBottom: spacing.lg,
    },
    switchLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
    switchDesc: { fontSize: typography.fontSize.sm, marginTop: 2 },
    
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
    },
    addBtnText: { fontWeight: typography.fontWeight.semibold },
    
    variantRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: -10, // counteract input field bottom margin
    },
    removeBtn: {
        height: 52, // match input height roughly
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
    }
});
