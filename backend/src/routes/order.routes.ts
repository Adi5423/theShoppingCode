import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Base path is /api/orders
router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.patch('/:id/status', verifyToken, updateOrderStatus);

export default router;