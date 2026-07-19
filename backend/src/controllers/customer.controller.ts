import { type Request, type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

// GET /api/customer/search-shops?query=...
export const searchShopsByItem = async (req: AuthRequest, res: Response): Promise<void> => {
    const { query } = req.query;

    if (!query) {
        res.status(400).json({ error: "Query parameter is required" });
        return;
    }

    try {
        // Find all inventory items matching the query that are live
        const matchingInventory = await prisma.inventory.findMany({
            where: {
                isLive: true,
                item: {
                    name: { contains: String(query), mode: 'insensitive' }
                }
            },
            include: {
                shop: true,
                item: true
            }
        });

        // Group by shop
        const shopsMap = new Map<string, any>();
        
        matchingInventory.forEach(inv => {
            if (!shopsMap.has(inv.shop.id)) {
                shopsMap.set(inv.shop.id, {
                    ...inv.shop,
                    matchingItems: []
                });
            }
            shopsMap.get(inv.shop.id).matchingItems.push({
                inventoryId: inv.id,
                price: inv.price,
                name: inv.item.name,
                brand: inv.item.brand,
                weight: inv.weight
            });
        });

        const shops = Array.from(shopsMap.values());
        // Basic sorting: for now just alphabetical or based on number of matched items
        shops.sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json({ shops });
    } catch (error) {
        console.error("[Customer Search Error]:", error);
        res.status(500).json({ error: "Failed to search shops." });
    }
};

// GET /api/customer/shops/:id/inventory
export const getShopInventory = async (req: AuthRequest, res: Response): Promise<void> => {
    const shopId = req.params.id as string;

    try {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId }
        });

        if (!shop) {
            res.status(404).json({ error: "Shop not found" });
            return;
        }

        const inventory = await prisma.inventory.findMany({
            where: {
                shopId,
                isLive: true,
            },
            include: {
                item: true,
                variants: true
            },
            orderBy: {
                item: {
                    name: 'asc'
                }
            }
        });

        res.status(200).json({ shop, inventory });
    } catch (error) {
        console.error("[Customer Shop Inventory Error]:", error);
        res.status(500).json({ error: "Failed to fetch shop inventory." });
    }
};
