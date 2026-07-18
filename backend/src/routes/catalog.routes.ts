import { Router } from 'express';
import { searchCatalog, addCatalogItem } from '../controllers/catalog.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

//Note: in PROD, we might make searhc public, for now we secure the whole pipeline
router.get('/search', verifyToken, searchCatalog);
router.post('/', verifyToken, addCatalogItem);

export default router;