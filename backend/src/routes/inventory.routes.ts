import { Router } from 'express';
import { 
    getMyInventory, 
    addInventoryItem, 
    toggleLive, 
    deleteInventoryItem 
} from '../controllers/inventory.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Base path is /api/inventory

// Only authenticated shopkeepers can hit these routes
router.get('/', verifyToken, getMyInventory);
router.post('/', verifyToken, addInventoryItem);
router.patch('/:id/toggle-live', verifyToken, toggleLive);
router.delete('/:id', verifyToken, deleteInventoryItem);

export default router;