import { type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

export const addInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
    const { catalogItemId, price, customDescription, status } = req.body;
    const userId = req.user?.id;

    if (req.user?.role !== 'SHOPKEEPER') {
        res.status(403).json({ error: "Only shopkeepers can manage inventory." });
        return;
    }

    try {
        // 1. Find the shop belonging to this user
        const shop = await prisma.shop.findUnique({
            where: { ownerId: userId }
        });

        if (!shop) {
            res.status(404).json({ error: "Shop not found. Please register a shop first." });
            return;
        }

        // 2. Add or Update the item in their specific inventory
        const inventoryItem = await prisma.inventory.upsert({
            where: {
                shopId_itemId: { // Uses our composite unique constraint
                    shopId: shop.id,
                    itemId: catalogItemId
                }
            },
            update: {
                price: parseFloat(price),
                customDescription,
                status: status || 'IN_STOCK'
            },
            create: {
                shopId: shop.id,
                itemId: catalogItemId,
                price: parseFloat(price),
                customDescription,
                status: status || 'IN_STOCK'
            }
        });

        res.status(200).json({ inventory: inventoryItem });
    } catch (error) {
        console.error("[Inventory Error]:", error);
        res.status(500).json({ error: "Failed to update inventory." });
    }
};