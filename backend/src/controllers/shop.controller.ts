import { type Response } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getMyShop = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { ownerId: req.user!.id }
        });

        if (!shop) {
            res.status(404).json({ message: "No shop found for this user." });
            return;
        }

        res.status(200).json(shop);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch shop details." });
    }
};

export const setupShop = async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, category, address, latitude, longitude, upiId, openTime, closeTime } = req.body;
    const ownerId = req.user!.id;

    try {
        // Upsert creates the shop if it doesn't exist, or updates it if it does.
        const shop = await prisma.shop.upsert({
            where: { ownerId },
            update: { name, category, address, latitude, longitude, upiId, openTime, closeTime },
            create: { ownerId, name, category, address, latitude, longitude, upiId, openTime, closeTime }
        });

        res.status(200).json(shop);
    } catch (error: any) {
        console.error("[Shop Setup Error]:", error);
        res.status(500).json({ error: "Failed to set up shop." });
    }
};