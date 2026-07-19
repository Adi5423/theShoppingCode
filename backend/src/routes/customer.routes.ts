import { Router } from 'express';
import { searchShopsByItem, getShopInventory, discoverProducts } from '../controllers/customer.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Base path is /api/customer
router.get('/discover', verifyToken, discoverProducts);
router.get('/search-shops', verifyToken, searchShopsByItem);
router.get('/shops/:id/inventory', verifyToken, getShopInventory);

export default router;
