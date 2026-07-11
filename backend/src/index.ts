import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Import pipelines/insiders
import authRoutes from './routes/auth.routes.js';
import shopRoutes from './routes/shop.routes.js';
import catalogRoutes from './routes/catalog.routes.js';

// Load environment configurations
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const app = express();
const PORT = process.env.PORT || 5000;

// Globally instantiated prisma instance for our service tier
export const prisma = new PrismaClient({ adapter });

// Production-ready Express middleware configurations
app.use(cors());
app.use(express.json());

// Base healthcheck routing to ensure runtime is active
app.get('/health', async (req: Request, res: Response) => {
    try {
        // Ping database to guarantee active connection pipeline
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "healthy", database: "connected" });
    } catch (error) {
        res.status(500).json({ status: "unhealthy", error: (error as Error).message });
    }
});

// Mount core API routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/catalog', catalogRoutes);

// Start listening for inbound incoming traffic
app.listen(PORT, () => {
    console.log(`[🚀 Server Matrix Engaged]: Running seamlessly on port ${PORT}`);
});