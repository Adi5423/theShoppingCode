import { Router } from 'express';
import { placeOrder } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Only authenticated customers can hit this
router.post('/', requireAuth, placeOrder);

export default router;