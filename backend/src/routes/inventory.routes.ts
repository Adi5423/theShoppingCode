import { Router } from 'express';
import { addInventoryItem } from '../controllers/inventory.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Only authenticated shopkeepers can hit this
router.post('/', requireAuth, addInventoryItem);

export default router;