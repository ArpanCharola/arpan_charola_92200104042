// backend/models/User.model.ts (Updated for correct Prisma types)

import { db } from '../config/db';
import { User as PrismaUser, Role } from '@prisma/client'; // <-- Import the Prisma types

// This interface reflects the user data *without* the password hash, for safe return
export interface User {
    id: number;
    name: string;
    email: string;
    role: Role; // <-- Use imported Role type
}

// This type reflects the full user data *with* the password hash, as retrieved from the DB
export type DbUser = PrismaUser;

/**
 * Finds a user by email, including their password hash for login.
 */
export const findUserByEmail = async (email: string) => {
    return db.sql.user.findUnique({
        where: { email },
    });
};

/**
 * Creates a new user record in the SQL database.
 */
// FIX: Ensure the role in the data object uses the correct Role type
export const createUser = async (data: { name: string; email: string; passwordHash: string; role: Role }) => {
    return db.sql.user.create({
        data: {
            name: data.name,
            email: data.email,
            // Assuming your schema uses 'passwordHash' or 'password' as the field name. 
            // I'll stick to 'passwordHash' for the argument type, but you might need to change it below.
            password: data.passwordHash, // <--- NOTE: Check your schema for 'password' or 'passwordHash'
            role: data.role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
};