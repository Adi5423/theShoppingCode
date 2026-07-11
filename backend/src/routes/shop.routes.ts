import { Router } from 'express';
import { createShop } from '../controllers/shop.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Shielded route: Must have valid JWT
router.post('/', requireAuth, createShop);

export default router;