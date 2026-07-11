import { type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

export const createShop = async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, address, lat, lng } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Security boundary: Only shopkeepers can hit this logic
    if (userRole !== 'SHOPKEEPER') {
        res.status(403).json({ error: "Access denied. Only shopkeepers can register a shop." });
        return;
    }

    try {
        const shop = await prisma.shop.create({
            data: {
                ownerId: userId as string,
                name,
                address,
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            }
        });
        res.status(201).json({ shop });
    } catch (error: any) {
        // P2002 is Prisma's unique constraint violation code
        if (error.code === 'P2002') {
            res.status(400).json({ error: "You already have a registered shop." });
            return;
        }
        console.error("[Shop Creation Error]:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};