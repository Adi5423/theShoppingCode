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
import { apiClient } from '../../shared/api/client';
import { lightTheme, darkTheme, spacing, radius, typography } from '../../shared/theme';
import { useThemeStore } from '../../shared/store/themeStore';
import { useFocusEffect } from '@react-navigation/native';

export const NotificationsScreen = () => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await apiClient.get('/notifications');
            setNotifications(res.data.notifications);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const markAsRead = async (id: string) => {
        try {
            await apiClient.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const renderNotification = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => !item.read && markAsRead(item.id)}
                style={[
                    styles.notificationCard, 
                    { 
                        backgroundColor: item.read ? theme.colors.background : theme.colors.surface,
                        borderColor: item.read ? theme.colors.border : theme.colors.primaryMuted 
                    }
                ]}
            >
                <View style={styles.iconContainer}>
                    <Feather 
                        name="bell" 
                        size={20} 
                        color={item.read ? theme.colors.textMuted : theme.colors.primary} 
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
                    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{item.message}</Text>
                    <Text style={[styles.time, { color: theme.colors.textMuted }]}>
                        {new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                </View>
                {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                )}
            </TouchableOpacity>
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
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.center}>
                    <View style={[styles.heroIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                        <Feather name="bell-off" size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Notifications</Text>
                    <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                        You're all caught up!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderNotification}
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
    emptyDesc: { fontSize: typography.fontSize.base, textAlign: 'center' },

    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
    
    listContent: { padding: spacing.md },
    notificationCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        marginBottom: spacing.sm,
        alignItems: 'center',
    },
    iconContainer: { marginRight: spacing.md },
    contentContainer: { flex: 1 },
    title: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, marginBottom: 2 },
    message: { fontSize: typography.fontSize.sm, marginBottom: spacing.xs, lineHeight: 20 },
    time: { fontSize: typography.fontSize.xs },
    unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: spacing.sm },
});
