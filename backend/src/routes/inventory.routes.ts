import { Router } from 'express';
import { addInventoryItem } from '../controllers/inventory.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Only authenticated shopkeepers can hit this
router.post('/', verifyToken, addInventoryItem);

export default router;