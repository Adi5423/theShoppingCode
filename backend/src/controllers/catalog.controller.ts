import { type Request, type Response } from 'express';
import { prisma } from '../index.js';
import { type CatalogItem } from '@prisma/client';

export const searchCatalog = async (req: Request, res: Response): Promise<void> => {
    const { query, barcode } = req.query;

    try {
        // 1. Fast path: Exact barcode match
        if (barcode) {
            let item = await prisma.catalogItem.findUnique({
                where: { barcode: String(barcode) }
            });

            // 2. Self-Learning: If not in our DB, ask Open Food Facts
            if (!item) {
                const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
                const offData = await offResponse.json();

                if (offData.status === 1) {
                    const product = offData.product;
                    // Save this new item to our database permanently
                    item = await prisma.catalogItem.create({
                        data: {
                            barcode: String(barcode),
                            name: product.product_name || 'Unknown Product',
                            brand: product.brands?.split(',')[0] || 'Unknown Brand',
                            variant: product.quantity || null,
                            category: product.categories?.split(',')[0] || null,
                            imageUrl: product.image_url || null
                        }
                    });
                }
            }

            res.status(200).json({ items: item ? [item] : [] });
            return;
        }

        // 3. Fallback: Fuzzy text search for customers
        let items: any[] = [];
        if (query) {
            items = await prisma.catalogItem.findMany({
                where: { name: { contains: String(query), mode: 'insensitive' } },
                take: 20
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