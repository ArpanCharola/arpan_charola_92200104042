// backend/controllers/productController.ts

import { Request, Response } from 'express';
import * as ProductModel from '../models/Product.model';

/**
 * GET /api/products
 * Retrieves a list of products based on query parameters.
 */
export const getProducts = async (req: Request, res: Response) => {
    try {
        // Extract and validate query parameters (e.g., convert strings to numbers)
        const { search, category, minPrice, maxPrice, sortBy, sortOrder, skip, take } = req.query;

        const query = {
            search: search ? String(search) : undefined,
            category: category ? String(category) : undefined,
            minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
            maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
            sortBy: sortBy ? String(sortBy) as 'price' | 'name' | 'createdAt' : undefined,
            sortOrder: sortOrder ? String(sortOrder) as 'asc' | 'desc' : undefined,
            skip: skip ? parseInt(String(skip)) : 0,
            take: take ? parseInt(String(take)) : 10,
        };

        const { count, data } = await ProductModel.findAllProducts(query);

        res.status(200).json({
            count,
            data,
            message: 'Products fetched successfully'
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error while fetching products' });
    }
};

/**
 * GET /api/products/:id
 * Retrieves a single product by its ID.
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const product = await ProductModel.findProductById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({
            data: product,
            message: 'Product fetched successfully'
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error while fetching product details' });
    }
};