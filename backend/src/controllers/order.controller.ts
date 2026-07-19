import { type Request, type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';

// POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { shopId, items } = req.body; // items: [{ inventoryId, quantity, price }]

    if (!shopId || !items || items.length === 0) {
        res.status(400).json({ error: "shopId and items are required" });
        return;
    }

    try {
        // Calculate total amount
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // Generate 4 digit pickup code
        const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

        const order = await prisma.order.create({
            data: {
                customerId: userId!,
                shopId,
                totalAmount,
                pickupCode,
                status: 'PENDING',
                items: {
                    create: items.map((item: any) => ({
                        inventoryId: item.inventoryId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        inventory: {
                            include: {
                                item: true
                            }
                        }
                    }
                },
                shop: true
            }
        });

        res.status(201).json({ order });
    } catch (error) {
        console.error("[Order Create Error]:", error);
        res.status(500).json({ error: "Failed to place order." });
    }
};

// GET /api/orders
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const role = req.user?.role;

    try {
        let orders: any[] = [];

        if (role === 'SHOPKEEPER') {
            const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
            if (shop) {
                orders = await prisma.order.findMany({
                    where: { shopId: shop.id },
                    include: {
                        customer: { select: { name: true, phone: true } },
                        items: {
                            include: {
                                inventory: {
                                    include: { item: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }
        } else {
            // CUSTOMER
            orders = await prisma.order.findMany({
                where: { customerId: userId },
                include: {
                    shop: true,
                    items: {
                        include: {
                            inventory: {
                                include: { item: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error("[Get Orders Error]:", error);
        res.status(500).json({ error: "Failed to fetch orders." });
    }
};

// PATCH /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const orderId = req.params.id as string;
    const { status } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        // Only shopkeepers can update status for their shop (for now)
        if (role !== 'SHOPKEEPER') {
            res.status(403).json({ error: "Only shopkeepers can update order status." });
            return;
        }

        const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
        if (!shop || order.shopId !== shop.id) {
            res.status(403).json({ error: "Unauthorized to update this order." });
            return;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        res.status(200).json({ order: updatedOrder });
    } catch (error) {
        console.error("[Update Order Status Error]:", error);
        res.status(500).json({ error: "Failed to update order status." });
    }
};