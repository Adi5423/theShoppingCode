import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { apiClient } from '../../shared/api/client';
import { theme } from '../../shared/theme';
import { useAuthStore } from '../../shared/store/authStore';

export const ShopkeeperHome = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannedItem, setScannedItem] = useState<any>(null);
    const signOut = useAuthStore(state => state.signOut);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.textCenter}>We need camera permissions to scan barcodes.</Text>
                <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        setScanned(true);
        setLoading(true);
        try {
            // Hit the production Render backend to find (or auto-learn) the item
            const res = await apiClient.get(`/catalog/search?barcode=${data}`);

            if (res.data.items && res.data.items.length > 0) {
                setScannedItem(res.data.items[0]);
            } else {
                alert("Item not found.");
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Inventory Scanner</Text>
                <TouchableOpacity onPress={signOut}>
                    <Text style={styles.logout}>Logout</Text>
                </TouchableOpacity>
            </View>

            {!scanned ? (
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    // Optimize for standard retail barcodes
                    barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
                />
            ) : (
                <View style={styles.resultCard}>
                    {loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> : (
                        <>
                            <Text style={styles.itemName}>{scannedItem?.name || "Unknown Item"}</Text>
                            <Text style={styles.itemDetails}>{scannedItem?.brand} - {scannedItem?.variant}</Text>

                            {/* TODO: Add input fields here to set the Price and click "Add to Shop" */}

                            <TouchableOpacity style={styles.btn} onPress={() => { setScanned(false); setScannedItem(null); }}>
                                <Text style={styles.btnText}>Scan Next Item</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
    textCenter: { textAlign: 'center', marginBottom: theme.spacing.md, fontSize: 16 },
    header: { paddingTop: 60, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface },
    title: { fontSize: 24, fontWeight: 'bold' },
    logout: { color: theme.colors.error, fontWeight: 'bold' },
    camera: { flex: 1 },
    resultCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
    itemName: { fontSize: 22, fontWeight: 'bold', marginBottom: theme.spacing.sm, textAlign: 'center' },
    itemDetails: { fontSize: 16, color: theme.colors.textLight, marginBottom: theme.spacing.xl },
    btn: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.radius.md, marginTop: 10 },
    btnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' }
});
