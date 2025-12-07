// backend/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken'; // <-- FIX: Import Secret and SignOptions types
import { createUser, findUserByEmail, DbUser } from '../models/User.model';
import { Role } from '@prisma/client'; // <-- FIX: Import Role enum from Prisma

// Utility function to generate a JWT token
// FIX: Use the imported Role type for the user object
const generateToken = (user: { id: number; email: string; role: Role }): string => { 
    // FIX: Get the secret and ensure it's cast as Secret
    const secret: Secret = (process.env.JWT_SECRET || 'your-secret-key') as Secret;
        const expiresIn: string = process.env.JWT_LIFETIME || '7d';

    const options = { expiresIn } as unknown as SignOptions;
    return jwt.sign({ id: user.id, email: user.email, role: user.role } as string | object | Buffer, secret, options);
};

/**
 * POST /api/auth/register
 * Handles new user registration (default role: USER).
 */
export const registerUser = async (req: Request, res: Response) => {
    // Note: I'm keeping your Copilot-introduced type assertions here.
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    try {
        // 1. Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // 3. Create the user in the database (default role: CUSTOMER)
        // FIX: Use the correct Prisma Role enum (assuming CUSTOMER for default user)
        const newUser = await createUser({
            name: name!,
            email: email!,
            passwordHash,
            role: Role.CUSTOMER, 
        });

        // 4. Generate JWT token
        // FIX: The generated token expects a user object with the correct Role type
        const token = generateToken(newUser as any); // Cast as any to simplify type matching post-create

        res.status(201).json({
            message: 'Registration successful',
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
            token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

/**
 * POST /api/auth/login
 * Handles user login and token generation.
 */
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // 1. Find the user by email
        const user = (await findUserByEmail(email)) as DbUser | null;

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare the provided password with the stored hash
        // Assuming your schema uses `password` for the hash field, as per your code
        const dbPassword = (user as any).password as string;
        const isMatch = await bcrypt.compare(password!, dbPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate JWT token for the session
        const token = generateToken(user);

        // Remove the password field before returning the user
        const { password: _pw, ...safeUser } = user as any;

        res.status(200).json({
            message: 'Login successful',
            user: safeUser,
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};