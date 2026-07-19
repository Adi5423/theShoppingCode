import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Import pipelines/insiders
import authRoutes from './routes/auth.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import orderRoutes from './routes/order.routes.js';
import shopRoutes from './routes/shop.routes.js';
import customerRoutes from './routes/customer.routes.js';
import healthRoutes from './routes/health.routes.js';
import { globalErrorHandler } from './middleware/error.middleware.js';

// Load environment configurations
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const app = express();

const PORT = process.env.PORT || 5000;

// Globally instantiated prisma instance for our service tier
export const prisma = new PrismaClient({ adapter });

// Security Middleware: HTTP Headers
app.use(helmet());
app.use(cors());
app.use(express.json());

// Security Middleware: Bruteforce Protection for Auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register requests per window
    message: { error: "Too many login attempts. Please try again after 15 minutes." }
});

// Health check — no auth, no rate limit (used for server warmup)
app.use('/api/health', healthRoutes);

// Mount core API routes
app.use('/api/auth', authLimiter, authRoutes); // Protected by limiter
app.use('/api/shop', shopRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer', customerRoutes);


//Global error handler must be the last middleware
app.use(globalErrorHandler);

// Start listening for inbound incoming traffic
app.listen(PORT, () => {
    console.log(`[🚀 Server Matrix Engaged]: Running seamlessly on port ${PORT}`);
});