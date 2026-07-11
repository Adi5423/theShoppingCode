import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include our custom user payload
export interface AuthRequest extends Request {
    user?: { id: string; role: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
        req.user = decoded; // Attach user payload to the request
        next();
    } catch (error) {
        res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
};