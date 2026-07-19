import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography, shadows, animation } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { Button } from '../../shared/components/Button';

// ─────────────────────────────────────────────────────────
//  ShopkeeperHome — Inventory Scanner
//  Consistent Feather icons, toast errors (no Alert),
//  animated scan-line effect, smooth result transitions
// ─────────────────────────────────────────────────────────

export const ShopkeeperHome = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannedItem, setScannedItem] = useState<any>(null);
    const [price, setPrice] = useState('');

    // ── Scan line animation ──
    const scanLineY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!scanned) {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineY, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanLineY, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            );
            loop.start();
            return () => loop.stop();
        }
    }, [scanned]);

    // ── Result card animation ──
    const resultOpacity = useRef(new Animated.Value(0)).current;
    const resultSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        if (scannedItem) {
            Animated.parallel([
                Animated.timing(resultOpacity, { toValue: 1, duration: animation.normal, useNativeDriver: true }),
                Animated.spring(resultSlide, { toValue: 0, damping: 15, stiffness: 120, useNativeDriver: true }),
            ]).start();
        } else {
            resultOpacity.setValue(0);
            resultSlide.setValue(30);
        }
    }, [scannedItem]);

    // ── Scan line interpolation ──
    const scanLineTranslate = scanLineY.interpolate({
        inputRange: [0, 1],
        outputRange: [-60, 60],
    });

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.permissionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, shadows.card]}>
                    <View style={[styles.permissionIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="camera" size={32} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
                        Camera Access Needed
                    </Text>
                    <Text style={[styles.permissionDesc, { color: theme.colors.textSecondary }]}>
                        We need camera permission to scan product barcodes and add items to your inventory.
                    </Text>
                    <Button
                        title="Grant Permission"
                        onPress={requestPermission}
                        icon={<Feather name="check" size={16} color="#fff" />}
                        style={{ marginTop: spacing.md }}
                    />
                </View>
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
                toast.show('This item could not be found in the catalog.', 'info');
                setScanned(false);
            }
        } catch (error: any) {
            toast.show(error.message || 'Failed to look up barcode', 'error');
            setScanned(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToShop = async () => {
        if (!price || isNaN(Number(price))) {
            toast.show('Please enter a valid price', 'error');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/inventory', {
                catalogItemId: scannedItem.id,
                price: Number(price),
                status: 'IN_STOCK',
            });
            toast.show(`${scannedItem.name} added for ₹${price}`, 'success');

            // Reset scanner
            setScanned(false);
            setScannedItem(null);
            setPrice('');
        } catch (error: any) {
            toast.show(error.message || 'Failed to add item', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanned(false);
        setScannedItem(null);
        setPrice('');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.screen, { backgroundColor: theme.colors.background }]}
        >
            {/* ── Header ── */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
                <View style={styles.headerLeft}>
                    <Feather name="camera" size={20} color={theme.colors.primary} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Inventory Scanner
                    </Text>
                </View>
            </View>

            {!scanned ? (
                /* ── Camera View ── */
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
                    />
                    <View style={styles.overlay}>
                        <View style={styles.scanFrame}>
                            {/* Corner decorations */}
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />

                            {/* Animated scan line */}
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    { transform: [{ translateY: scanLineTranslate }] },
                                ]}
                            />
                        </View>
                        <Text style={styles.scanText}>Align barcode within the frame</Text>
                    </View>
                </View>
            ) : (
                /* ── Result View ── */
                <View style={[styles.resultContainer, { backgroundColor: theme.colors.background }]}>
                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                                Looking up product...
                            </Text>
                        </View>
                    ) : (
                        <Animated.View
                            style={[
                                styles.resultCard,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    opacity: resultOpacity,
                                    transform: [{ translateY: resultSlide }],
                                },
                                shadows.elevated,
                            ]}
                        >
                            {/* Success indicator */}
                            <View style={[styles.successBadge, { backgroundColor: theme.colors.successBg }]}>
                                <Feather name="check-circle" size={24} color={theme.colors.success} />
                                <Text style={[styles.successText, { color: theme.colors.success }]}>Product Found</Text>
                            </View>

                            {/* Product info */}
                            <Text style={[styles.itemName, { color: theme.colors.text }]}>
                                {scannedItem?.name || 'Unknown Item'}
                            </Text>
                            <Text style={[styles.itemBrand, { color: theme.colors.textSecondary }]}>
                                {scannedItem?.brand}{scannedItem?.variant ? ` • ${scannedItem.variant}` : ''}
                            </Text>

                            {/* Price input */}
                            <View style={[styles.priceContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                                <Text style={[styles.rupee, { color: theme.colors.primary }]}>₹</Text>
                                <TextInput
                                    style={[styles.priceInput, { color: theme.colors.text }]}
                                    placeholder="Set your price"
                                    placeholderTextColor={theme.colors.textMuted}
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                    autoFocus
                                />
                            </View>

                            <Button
                                title="Add to Inventory"
                                onPress={handleAddToShop}
                                loading={loading}
                                icon={<Feather name="plus-circle" size={16} color="#fff" />}
                            />

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={resetScanner}
                                activeOpacity={0.7}
                            >
                                <Feather name="rotate-ccw" size={14} color={theme.colors.textMuted} />
                                <Text style={[styles.cancelText, { color: theme.colors.textMuted }]}>
                                    Cancel & Scan Next
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },

    // ── Permission Screen ──
    permissionCard: {
        padding: spacing.xl,
        borderRadius: radius.xl,
        borderWidth: 1,
        alignItems: 'center',
        maxWidth: 340,
    },
    permissionIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    permissionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.sm,
    },
    permissionDesc: {
        fontSize: typography.fontSize.base,
        textAlign: 'center',
        lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    },

    // ── Header ──
    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },

    // ── Camera ──
    cameraContainer: { flex: 1, position: 'relative' },
    camera: { flex: 1 },
    overlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    // ── Scan Frame ──
    scanFrame: {
        width: 260,
        height: 160,
        position: 'relative',
        overflow: 'hidden',
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: '#00C896',
        borderWidth: 3,
    },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
    scanLine: {
        position: 'absolute',
        left: 8,
        right: 8,
        height: 2,
        backgroundColor: '#00C896',
        top: '50%',
        borderRadius: 1,
        shadowColor: '#00C896',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    scanText: {
        color: '#fff',
        marginTop: spacing.xl,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        overflow: 'hidden',
    },

    // ── Result ──
    resultContainer: { flex: 1, justifyContent: 'center', padding: spacing.lg },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.base,
    },
    resultCard: {
        padding: spacing.xl,
        borderRadius: radius.xl,
        borderWidth: 1,
        alignItems: 'center',
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        marginBottom: spacing.lg,
    },
    successText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
    itemName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    itemBrand: {
        fontSize: typography.fontSize.base,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },

    // ── Price Input ──
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        width: '100%',
        height: 56,
    },
    rupee: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginRight: spacing.sm,
    },
    priceInput: {
        flex: 1,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
    },

    // ── Cancel ──
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.lg,
        padding: spacing.sm,
    },
    cancelText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});