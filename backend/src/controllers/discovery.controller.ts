import { type Request, type Response } from 'express';
import { prisma } from '../index.js';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const findNearestItems = async (req: Request, res: Response): Promise<void> => {
    const { query, customerLat, customerLng } = req.query;

    if (!customerLat || !customerLng) {
        res.status(400).json({ error: "Customer location (lat, lng) is required." });
        return;
    }

    try {
        const inventories = await prisma.inventory.findMany({
            where: {
                status: 'IN_STOCK',
                item: { name: { contains: String(query), mode: 'insensitive' } },
                shop: { isActive: true }
            },
            include: {
                item: true,
                shop: { select: { id: true, name: true, address: true, lat: true, lng: true } }
            }
        });

        const lat = parseFloat(String(customerLat));
        const lng = parseFloat(String(customerLng));

        // Map distances and sort closest to furthest
        const allResults = inventories.map(inv => ({
            ...inv,
            distanceKm: parseFloat(calculateDistance(lat, lng, inv.shop.lat, inv.shop.lng).toFixed(2))
        })).sort((a, b) => a.distanceKm - b.distanceKm);

        // Progressive Radius Logic: Prevent the "Empty App" feeling
        const radiuses = [5, 15, 30, 50];
        let finalResults: typeof allResults = [];
        let appliedRadius = 5;

        for (const r of radiuses) {
            finalResults = allResults.filter(inv => inv.distanceKm <= r);
            appliedRadius = r;
            // If we found at least 2 shops, stop expanding the net
            if (finalResults.length >= 2) break;
        }

        res.status(200).json({
            count: finalResults.length,
            searchRadiusUsed: appliedRadius,
            results: finalResults
        });
    } catch (error) {
        console.error("[Discovery Error]:", error);
        res.status(500).json({ error: "Failed to locate nearest items." });
    }
};