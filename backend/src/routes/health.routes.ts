import { Router, type Request, type Response } from 'express';

// ─────────────────────────────────────────────────────────
//  Health Route — Lightweight ping for warmup & monitoring
//  No auth, no rate limit. Used by the mobile app on launch
//  to wake the Render free-tier server before the user
//  tries to log in.
// ─────────────────────────────────────────────────────────

const router = Router();

router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
    });
});

export default router;
