import { type Request, type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

// GET /api/inventory
export const getMyInventory = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    try {
        const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
        if (!shop) {
            res.status(404).json({ error: "Shop not found. Please register a shop first." });
            return;
        }

        const inventory = await prisma.inventory.findMany({
            where: { shopId: shop.id },
            include: {
                item: true, // the CatalogItem
                variants: true,
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json({ inventory });
    } catch (error) {
        console.error("[Inventory GET Error]:", error);
        res.status(500).json({ error: "Failed to fetch inventory." });
    }
};

// POST /api/inventory
export const addInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
    const { 
        catalogItemId, price, customDescription, status,
        isLive, weight, isPacked, stockQuantity, variants 
    } = req.body;
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
                status: status || 'IN_STOCK',
                isLive: isLive !== undefined ? isLive : true,
                weight: weight || null,
                isPacked: isPacked !== undefined ? isPacked : true,
                stockQuantity: stockQuantity ? parseFloat(stockQuantity) : 0,
            },
            create: {
                shopId: shop.id,
                itemId: catalogItemId,
                price: parseFloat(price),
                customDescription,
                status: status || 'IN_STOCK',
                isLive: isLive !== undefined ? isLive : true,
                weight: weight || null,
                isPacked: isPacked !== undefined ? isPacked : true,
                stockQuantity: stockQuantity ? parseFloat(stockQuantity) : 0,
            }
        });

        // 3. Handle Variants (simple approach: clear old variants if provided, add new ones)
        if (variants && Array.isArray(variants)) {
            // First, delete existing variants for this inventory item
            await prisma.inventoryVariant.deleteMany({
                where: { inventoryId: inventoryItem.id }
            });
            
            // Then add the new ones
            if (variants.length > 0) {
                await prisma.inventoryVariant.createMany({
                    data: variants.map((v: any) => ({
                        inventoryId: inventoryItem.id,
                        label: v.label,
                        stockQuantity: v.stockQuantity ? parseFloat(v.stockQuantity) : 0,
                        isAvailable: v.isAvailable !== undefined ? v.isAvailable : true
                    }))
                });
            }
        }

        // Fetch it again to include variants in response
        const fullItem = await prisma.inventory.findUnique({
            where: { id: inventoryItem.id },
            include: { variants: true, item: true }
        });

        res.status(200).json({ inventory: fullItem });
    } catch (error) {
        console.error("[Inventory Add Error]:", error);
        res.status(500).json({ error: "Failed to update inventory." });
    }
};

// PATCH /api/inventory/:id/toggle-live
export const toggleLive = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { isLive } = req.body;
    
    try {
        // Just verify ownership via shop logic optionally, or just update directly if we trust the route
        const userId = req.user?.id;
        const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
        
        if (!shop) {
             res.status(404).json({ error: "Shop not found." });
             return;
        }

        // Ensure this inventory item belongs to this shop
        const item = await prisma.inventory.findUnique({ where: { id } });
        if (!item || item.shopId !== shop.id) {
            res.status(403).json({ error: "Not authorized to update this item." });
            return;
        }

        const updated = await prisma.inventory.update({
            where: { id },
            data: { isLive }
        });
        
        res.status(200).json({ inventory: updated });
    } catch(err) {
        console.error("[Inventory Toggle Error]:", err);
        res.status(500).json({ error: "Failed to toggle live status" });
    }
};

// DELETE /api/inventory/:id
export const deleteInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    
    try {
        const userId = req.user?.id;
        const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
        
        if (!shop) {
             res.status(404).json({ error: "Shop not found." });
             return;
        }

        const item = await prisma.inventory.findUnique({ where: { id } });
        if (!item || item.shopId !== shop.id) {
            res.status(403).json({ error: "Not authorized to delete this item." });
            return;
        }

        await prisma.inventory.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Item deleted successfully" });
    } catch(err) {
        console.error("[Inventory Delete Error]:", err);
        res.status(500).json({ error: "Failed to delete item" });
    }
};