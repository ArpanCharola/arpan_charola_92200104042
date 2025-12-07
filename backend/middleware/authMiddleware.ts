import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

// Extend Express Request interface to include user
export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const secret: Secret = (process.env.JWT_SECRET || 'your-secret-key') as Secret;
            const decoded = jwt.verify(token, secret) as { id: number; role: string };

            // Start Request with User
            (req as AuthRequest).user = {
                id: decoded.id,
                role: decoded.role
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
