import { type Request, type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50
        });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("[Get Notifications Error]:", error);
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const notificationId = req.params.id as string;

    try {
        // Find notification
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }

        if (notification.userId !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("[Mark Notification Read Error]:", error);
        res.status(500).json({ error: "Failed to update notification." });
    }
};
