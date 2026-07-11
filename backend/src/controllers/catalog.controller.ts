import { type Request, type Response } from 'express';
import { prisma } from '../index.js';
import { type CatalogItem } from '@prisma/client';

export const searchCatalog = async (req: Request, res: Response): Promise<void> => {
    const { query, barcode } = req.query;

    try {
        // 1. Fast path: Exact barcode match
        if (barcode) {
            const item = await prisma.catalogItem.findUnique({
                where: { barcode: String(barcode) }
            });
            res.status(200).json({ items: item ? [item] : [] });
            return;
        }

        let items: CatalogItem[] = [];
        // 2. Fallback: Fuzzy text search for manual entry
        if (query) {
            items = await prisma.catalogItem.findMany({
                where: {
                    name: { contains: String(query), mode: 'insensitive' }
                },
                take: 20 // Pagination boundary for performance
            });
        }

        res.status(200).json({ items });
    } catch (error) {
        console.error("[Catalog Search Error]:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addCatalogItem = async (req: Request, res: Response): Promise<void> => {
    const { barcode, name, brand, variant, category, imageUrl } = req.body;

    try {
        const item = await prisma.catalogItem.create({
            data: { barcode, name, brand, variant, category, imageUrl }
        });
        res.status(201).json({ item });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: "An item with this barcode already exists." });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
};