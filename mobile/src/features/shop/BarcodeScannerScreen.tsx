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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography, shadows, animation } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useToastStore } from '../../shared/store/toastStore';
import { Button } from '../../shared/components/Button';

export const BarcodeScannerScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const toast = useToastStore();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');
    const [flashOn, setFlashOn] = useState(false);

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
    }, [scanned, scanLineY]);

    const scanLineTranslate = scanLineY.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, 80], // adjust based on frame size
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
                        We need camera permission to scan product barcodes.
                    </Text>
                    <Button
                        title="Grant Permission"
                        onPress={requestPermission}
                        icon={<Feather name="check" size={16} color="#fff" />}
                        style={{ marginTop: spacing.md }}
                    />
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
                        <Text style={{ color: theme.colors.textMuted }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const searchBarcode = async (barcodeData: string) => {
        setScanned(true);
        setLoading(true);
        try {
            const res = await apiClient.get(`/catalog/search?barcode=${barcodeData}`);
            if (res.data.items && res.data.items.length > 0) {
                // Product found
                navigation.replace('AddProduct', { 
                    catalogItem: res.data.items[0],
                    barcode: barcodeData 
                });
            } else {
                // Not found
                toast.show('Item not found. You can add it manually.', 'info');
                setLoading(false);
                // We keep scanned=true so the camera stays paused, showing manual add option
            }
        } catch (error: any) {
            toast.show(error.message || 'Failed to look up barcode', 'error');
            setScanned(false);
            setLoading(false);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned) searchBarcode(data);
    };

    const handleManualSearch = () => {
        if (!manualBarcode) return;
        searchBarcode(manualBarcode);
    };

    const resetScanner = () => {
        setScanned(false);
        setManualBarcode('');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.screen, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    enableTorch={flashOn}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
                />
                <View style={styles.overlay}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity 
                            style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Feather name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.iconButton, { backgroundColor: flashOn ? theme.colors.primary : 'rgba(0,0,0,0.6)' }]}
                            onPress={() => setFlashOn(!flashOn)}
                        >
                            <Feather name={flashOn ? "zap" : "zap-off"} size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Viewfinder or Not Found View */}
                    <View style={styles.centerOverlay}>
                        {!scanned ? (
                            <View style={styles.scanFrame}>
                                <View style={[styles.corner, styles.cornerTL]} />
                                <View style={[styles.corner, styles.cornerTR]} />
                                <View style={[styles.corner, styles.cornerBL]} />
                                <View style={[styles.corner, styles.cornerBR]} />
                                <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]} />
                            </View>
                        ) : loading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="large" color="#00C896" />
                                <Text style={styles.loadingText}>Searching Catalog...</Text>
                            </View>
                        ) : (
                            <View style={styles.notFoundBox}>
                                <Feather name="alert-circle" size={32} color="#FBBF24" style={{ marginBottom: 10 }} />
                                <Text style={styles.notFoundTitle}>Item Not Found</Text>
                                <Text style={styles.notFoundDesc}>This barcode isn't in our global catalog yet.</Text>
                                
                                <TouchableOpacity 
                                    style={styles.addManuallyBtn}
                                    onPress={() => navigation.replace('AddProduct', { barcode: manualBarcode || 'Scanned Barcode' })} // Ideally pass the actual scanned barcode if available
                                >
                                    <Text style={styles.addManuallyText}>Add Item Manually</Text>
                                    <Feather name="arrow-right" size={16} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={resetScanner} style={{ marginTop: spacing.md, padding: spacing.sm }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Scan Again</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Manual Entry Footer */}
                    <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Or enter barcode manually:</Text>
                        <View style={styles.manualEntryRow}>
                            <TextInput
                                style={[styles.manualInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="e.g. 890123456789"
                                placeholderTextColor={theme.colors.textMuted}
                                keyboardType="numeric"
                                value={manualBarcode}
                                onChangeText={setManualBarcode}
                                editable={!loading}
                            />
                            <TouchableOpacity 
                                style={[styles.manualSubmitBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={handleManualSearch}
                                disabled={!manualBarcode || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Feather name="search" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    permissionCard: { padding: spacing.xl, borderRadius: radius.xl, borderWidth: 1, alignItems: 'center', maxWidth: 340 },
    permissionIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    permissionTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
    permissionDesc: { fontSize: typography.fontSize.base, textAlign: 'center', lineHeight: 22 },
    
    cameraContainer: { flex: 1, position: 'relative' },
    camera: { flex: 1 },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
    },
    
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.lg,
        paddingTop: 60,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },

    centerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 260,
        height: 200,
        position: 'relative',
        overflow: 'hidden',
    },
    corner: { position: 'absolute', width: 30, height: 30, borderColor: '#00C896', borderWidth: 4 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
    scanLine: {
        position: 'absolute', left: 10, right: 10, height: 2, backgroundColor: '#00C896',
        top: '50%', borderRadius: 1, shadowColor: '#00C896', shadowOpacity: 1, shadowRadius: 8,
    },

    loadingBox: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: spacing.xl,
        borderRadius: radius.lg,
        alignItems: 'center',
    },
    loadingText: { color: '#fff', marginTop: spacing.md, fontSize: typography.fontSize.base },

    notFoundBox: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: spacing.xl,
        borderRadius: radius.lg,
        alignItems: 'center',
        maxWidth: 300,
    },
    notFoundTitle: { color: '#fff', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.xs },
    notFoundDesc: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: spacing.lg },
    addManuallyBtn: {
        backgroundColor: '#00C896',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
    },
    addManuallyText: { color: '#fff', fontWeight: typography.fontWeight.bold },

    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
        borderTopWidth: 1,
    },
    footerLabel: {
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.sm,
    },
    manualEntryRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    manualInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        fontSize: typography.fontSize.base,
    },
    manualSubmitBtn: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
