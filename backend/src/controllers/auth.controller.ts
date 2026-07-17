import { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { Role } from '@prisma/client';

// Strict 10-digit Indian phone number validation
const isValidPhone = (phone: string) => /^\+91\d{10}$/.test(phone);

export const register = async (req: Request, res: Response): Promise<void> => {
    const { phone, otp, password, name, role } = req.body;

    if (!isValidPhone(phone)) {
        res.status(400).json({ error: "Invalid phone number format. Use +91 followed by 10 digits." });
        return;
    }

    // Dev OTP Bypass
    if (otp !== '123456') {
        res.status(401).json({ error: "Invalid OTP" });
        return;
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { phone } });
        if (existingUser) {
            res.status(400).json({ error: "Account already exists. Please log in." });
            return;
        }

        // Security: Hash the password (Cost factor 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                phone,
                password: hashedPassword,
                name: name || 'New User',
                role: role === 'SHOPKEEPER' ? Role.SHOPKEEPER : Role.CUSTOMER
            }
        });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
        res.status(201).json({ token, user: { id: user.id, role: user.role, name: user.name } });
    } catch (error) {
        console.error("[Register Error]:", error);
        res.status(500).json({ error: "Registration failed." });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { phone, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { phone } });

        // 1. Explicitly tell them if the account doesn't exist
        if (!user) {
            res.status(404).json({ error: "No account found with this number. Please register first." });
            return;
        }

        if (!user.password) {
            res.status(400).json({ error: "Please use 'Forgot Password' to set up a new secure password." });
            return;
        }

        // 2. Explicitly tell them if the password is wrong
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Incorrect password. Please try again." });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
        res.status(200).json({ token, user: { id: user.id, role: user.role, name: user.name } });
    } catch (error) {
        console.error("[Login Error]:", error);
        res.status(500).json({ error: "Login failed." });
    }
};