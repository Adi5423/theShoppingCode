import { type Request, type Response, type NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // 1. Detailed forensic log for the developer console
    console.error(`\n[🔥 FATAL ERROR] - ${req.method} ${req.url}`);
    console.error(`[Stack Trace]:`, err.stack || err.message);

    // 2. Safe, sanitized response for the user UI
    res.status(err.status || 500).json({
        error: "Something went wrong on our end. Please try again later.",
        // We can expose the exact message during dev, but never the stack trace
        detail: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
};