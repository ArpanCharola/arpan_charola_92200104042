// backend/server.ts (Modified content)

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './routes/productRoutes'; // <-- NEW IMPORT
// backend/server.ts (Ensure these two lines are added/modified)
import authRoutes from './routes/authRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes'; // <-- ADD THIS

// ... existing code ...



// ... existing code ...

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/auth', authRoutes); // <-- ADD THIS ROUTE PATH

// Simple Root Route (for testing server health)
app.get('/', (req: Request, res: Response) => {
    res.send('NovaCart Backend API is running...');
});

// ----------------------------------------
// API Routes (Must be after middleware)
// ----------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); // <-- NEW INTEGRATION

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Access the server at http://localhost:${PORT}`);
});