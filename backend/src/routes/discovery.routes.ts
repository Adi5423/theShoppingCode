import { Router } from 'express';
import { findNearestItems } from '../controllers/discovery.controller.js';

const router = Router();

// Customers do not need an account just to search! High conversion tactic.
router.get('/search', findNearestItems);

export default router;