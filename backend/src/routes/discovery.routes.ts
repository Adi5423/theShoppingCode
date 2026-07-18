import { Router } from 'express';
import { searchLocalItems } from '../controllers/discovery.controller.js';

const router = Router();

// Customers do not need an account just to search! High conversion tactic.
router.get('/search', searchLocalItems);

export default router;