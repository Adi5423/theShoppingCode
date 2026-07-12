import { type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    const { shopId, items } = req.body; // items: [{ inventoryId: string, quantity: number }]
    const customerId = req.user?.id;

    if (!customerId || req.user?.role !== 'CUSTOMER') {
        res.status(403).json({ error: "Only registered customers can place orders." });
        return;
    }

    try {
        // 1. Fetch current inventory states for all requested items to verify stock and price
        const inventoryIds = items.map((i: any) => i.inventoryId);
        const liveInventory = await prisma.inventory.findMany({
            where: { id: { in: inventoryIds }, shopId, status: 'IN_STOCK' }
        });

        if (liveInventory.length !== items.length) {
            res.status(400).json({ error: "One or more items are out of stock or invalid for this shop." });
            return;
        }

        // 2. Calculate the total and prep the OrderItems with locked prices
        let totalAmount = 0;
        const orderItemsData = items.map((cartItem: any) => {
            const dbItem = liveInventory.find(i => i.id === cartItem.inventoryId);
            const itemTotal = (dbItem?.price || 0) * cartItem.quantity;
            totalAmount += itemTotal;

            return {
                inventoryId: cartItem.inventoryId,
                quantity: cartItem.quantity,
                price: dbItem?.price || 0 // Locks the price dynamically
            };
        });

        // 3. Execute an atomic transaction: Create Order + Order Items together
        const order = await prisma.$transaction(async (tx) => {
            return await tx.order.create({
                data: {
                    customerId,
                    shopId,
                    totalAmount,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData
                    }
                },
                include: { items: true } // Return the created items in the response
            });
        });

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        console.error("[Order Processing Error]:", error);
        res.status(500).json({ error: "Transaction failed. Order rolled back." });
    }
};