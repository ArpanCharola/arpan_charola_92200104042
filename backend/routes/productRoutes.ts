// backend/routes/productRoutes.ts

import { Router } from 'express';
import { getProducts, getProductById } from '../controllers/productController';

const router = Router();

// Route for fetching all products with filters, search, and pagination
// GET /api/products?search=monitor&category=Electronics
router.get('/', getProducts);

// Route for fetching a single product by ID
// GET /api/products/:id
router.get('/:id', getProductById);

export default router;