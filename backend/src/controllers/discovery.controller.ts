import { type Request, type Response } from 'express';
import { prisma } from '../index.js';

export const searchLocalItems = async (req: Request, res: Response): Promise<void> => {
    const { query } = req.query;

    try {
        const items = await prisma.inventory.findMany({
            where: {
                status: 'IN_STOCK',
                item: {
                    name: { contains: String(query), mode: 'insensitive' }
                }
                // Removed the old 'isActive' check
            },
            include: {
                item: true,
                shop: {
                    // Updated to use the correct latitude/longitude names
                    select: { id: true, name: true, address: true, latitude: true, longitude: true }
                }
            }
        });

        // Map the results for the frontend
        const results = items.map(item => ({
            inventoryId: item.id,
            price: item.price,
            itemDetails: item.item,
            shopDetails: item.shop
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error("[Discovery Error]:", error);
        res.status(500).json({ error: "Failed to search items." });
    }
};