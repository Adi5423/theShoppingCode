import { Router } from 'express';
import { getMyShop, setupShop } from '../controllers/shop.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Both routes require the user to be logged in
router.get('/me', verifyToken, getMyShop);
router.post('/setup', verifyToken, setupShop);

export default router;