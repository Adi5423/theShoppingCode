import { Router } from 'express';
import { searchCatalog, addCatalogItem } from '../controllers/catalog.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

//Note: in PROD, we might make searhc public, for now we secure the whole pipeline
router.get('/search', requireAuth, searchCatalog);
router.post('/', requireAuth, addCatalogItem);

export default router;