import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js'; // .js extension is required in modern ESM
import { Role } from '@prisma/client';

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ error: "Phone number is required" });
        return;
    }
    // TODO: Integrate MSG91/Twilio here for production
    res.status(200).json({ message: "OTP sent successfully", devOtp: "123456" });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { phone, otp, name, role } = req.body;

    // Hardcoded dev OTP bypass
    if (otp !== '123456') {
        res.status(401).json({ error: "Invalid OTP" });
        return;
    }

    try {
        // Atomic operation: Create user if they don't exist, fetch if they do
        const user = await prisma.user.upsert({
            where: { phone },
            update: {},
            create: {
                phone,
                name: name || 'Unknown User',
                role: role || Role.CUSTOMER
            }
        });

        // Generate the secure token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '30d' }
        );

        res.status(200).json({ token, user });
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ error: "Authentication pipeline failed" });
    }
};