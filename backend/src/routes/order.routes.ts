import { Router } from 'express';
import { placeOrder } from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Only authenticated customers can hit this
router.post('/', verifyToken, placeOrder);

export default router;