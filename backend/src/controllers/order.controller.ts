import { type Request, type Response } from 'express';
import { prisma } from '../index.js';
import { type AuthRequest } from '../middleware/auth.middleware.js';
import { io } from '../socket.js';

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

        // ── Real-time Notification for Shopkeeper ──
        const shopkeeperMessage = `New order received for ₹${totalAmount}`;
        await prisma.notification.create({
            data: {
                userId: order.shop.ownerId,
                title: 'New Order',
                message: shopkeeperMessage
            }
        });
        
        io.to(order.shop.ownerId).emit('new_order', { order, message: shopkeeperMessage });

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
        const order = await prisma.order.findUnique({ 
            where: { id: orderId },
            include: { items: true } 
        });
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
            data: { status },
            include: {
                shop: true,
                items: {
                    include: {
                        inventory: {
                            include: { item: true }
                        }
                    }
                }
            }
        });

        if (status === 'COMPLETED') {
            for (const orderItem of order.items) {
                await prisma.inventory.update({
                    where: { id: orderItem.inventoryId },
                    data: {
                        stockQuantity: { decrement: orderItem.quantity }
                    }
                });
            }
        }

        // ── Real-time Notification for Customer ──
        const statusLabels: Record<string, string> = {
            'ACCEPTED': 'Preparing',
            'READY_FOR_PICKUP': 'Ready to Pickup',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled'
        };
        const customerMessage = `Your order from ${shop.name} is now ${statusLabels[status] || status}.`;
        
        await prisma.notification.create({
            data: {
                userId: order.customerId,
                title: 'Order Update',
                message: customerMessage
            }
        });

        io.to(order.customerId).emit('order_updated', { order: updatedOrder, message: customerMessage });

        res.status(200).json({ order: updatedOrder });
    } catch (error) {
        console.error("[Update Order Status Error]:", error);
        res.status(500).json({ error: "Failed to update order status." });
    }
};