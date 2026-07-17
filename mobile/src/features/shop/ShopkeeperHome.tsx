import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius } from '../../shared/theme';
import { useAuthStore } from '../../shared/store/authStore';
import { useThemeStore } from '../../shared/store/themeStore';

export const ShopkeeperHome = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannedItem, setScannedItem] = useState<any>(null);
    const [price, setPrice] = useState(''); // New state for setting inventory price

    const signOut = useAuthStore(state => state.signOut);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.textCenter, { color: theme.colors.text }]}>We need camera permissions to scan barcodes.</Text>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.primary }]} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        setScanned(true);
        setLoading(true);
        try {
            const res = await apiClient.get(`/catalog/search?barcode=${data}`);
            if (res.data.items && res.data.items.length > 0) {
                setScannedItem(res.data.items[0]);
            } else {
                Alert.alert("Not Found", "This item could not be found or learned.");
                setScanned(false);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
            setScanned(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToShop = async () => {
        if (!price || isNaN(Number(price))) {
            Alert.alert("Invalid Price", "Please enter a valid number for the price.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/inventory', {
                catalogItemId: scannedItem.id,
                price: Number(price),
                status: 'IN_STOCK'
            });

            Alert.alert("Success!", `${scannedItem.name} added to your shop for ₹${price}`);

            // Reset scanner for the next item
            setScanned(false);
            setScannedItem(null);
            setPrice('');
        } catch (error: any) {
            Alert.alert("Failed to Add", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Inventory Scanner</Text>
                <TouchableOpacity onPress={signOut}>
                    <Ionicons name="log-out-outline" size={28} color={theme.colors.error} />
                </TouchableOpacity>
            </View>

            {!scanned ? (
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
                    />
                    <View style={styles.overlay}>
                        <View style={styles.scanBox} />
                        <Text style={styles.scanText}>Align barcode within the frame</Text>
                    </View>
                </View>
            ) : (
                <View style={[styles.resultCard, { backgroundColor: theme.colors.background }]}>
                    {loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> : (
                        <View style={[styles.productDetails, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <Ionicons name="checkmark-circle" size={50} color={theme.colors.primary} style={styles.successIcon} />

                            <Text style={[styles.itemName, { color: theme.colors.text }]}>{scannedItem?.name || "Unknown Item"}</Text>
                            <Text style={[styles.itemBrand, { color: theme.colors.textLight }]}>{scannedItem?.brand} • {scannedItem?.variant}</Text>

                            <View style={[styles.priceInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                                <Text style={[styles.rupeeSymbol, { color: theme.colors.text }]}>₹</Text>
                                <TextInput
                                    style={[styles.priceInput, { color: theme.colors.text }]}
                                    placeholder="Enter Price"
                                    placeholderTextColor={theme.colors.textLight}
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                />
                            </View>

                            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.primary, width: '100%' }]} onPress={handleAddToShop}>
                                <Text style={styles.btnText}>Add to Shop Inventory</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setScanned(false); setScannedItem(null); setPrice(''); }}>
                                <Text style={[styles.cancelBtnText, { color: theme.colors.textLight }]}>Cancel & Scan Next</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    textCenter: { textAlign: 'center', marginBottom: spacing.md, fontSize: 16 },

    header: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 0, borderBottomWidth: 1 },
    title: { fontSize: 22, fontWeight: 'bold' },

    cameraContainer: { flex: 1, position: 'relative' },
    camera: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    scanBox: { width: 250, height: 150, borderWidth: 2, borderColor: '#fff', borderRadius: radius.md, backgroundColor: 'transparent' },
    scanText: { color: '#fff', marginTop: spacing.lg, fontSize: 16, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },

    resultCard: { flex: 1, justifyContent: 'center', padding: spacing.lg },
    productDetails: { padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    successIcon: { marginBottom: spacing.md },
    itemName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    itemBrand: { fontSize: 15, marginBottom: spacing.xl, textAlign: 'center' },

    priceInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.xl, width: '100%', height: 56 },
    rupeeSymbol: { fontSize: 20, fontWeight: 'bold', marginRight: spacing.sm },
    priceInput: { flex: 1, fontSize: 18, fontWeight: '600' },

    btn: { padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    cancelBtn: { marginTop: spacing.lg, padding: spacing.sm },
    cancelBtnText: { fontSize: 15, fontWeight: '500' }
});