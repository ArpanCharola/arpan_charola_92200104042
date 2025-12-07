// backend/models/Product.model.ts (Finalized with robust JSON Fallback)

import { db } from '../config/db';
import * as fs from 'fs';
import * as path from 'path';

// --- Type Definitions (Keep these for strictness) ---
interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    category: string;
    description: string;
    stock: number;
    isFeatured: boolean;
    image?: string;
    imageUrls?: string[];
}

export interface ProductQuery {
    search?: string | undefined;
    category?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    sortBy?: 'price' | 'name' | 'createdAt' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
    skip?: number | undefined;
    take?: number | undefined;
}

const LOCAL_FALLBACK_PATH = path.resolve(process.cwd(), 'prisma/local_products.json');

/**
 * Reads product data from the local JSON file and applies filtering/pagination.
 */
const readLocalProducts = (query: ProductQuery): { count: number, data: Product[] } => {
    try {
        const rawData = fs.readFileSync(LOCAL_FALLBACK_PATH, 'utf-8');
        const allProducts = JSON.parse(rawData); // Assumes this is an array of 50 products

        const { search, category, minPrice, maxPrice, sortBy = 'name', sortOrder = 'asc', skip = 0, take = 10 } = query;

        // --- 1. FILTERING (Simplified for basic functionality) ---
        let filteredProducts = allProducts.filter((p: Product) => {
            // Category filter
            if (category && p.category !== category) return false;

            // Search filter (name or description contains search term)
            if (search) {
                const lowerSearch = search.toLowerCase();
                if (!(p.name.toLowerCase().includes(lowerSearch) || p.description.toLowerCase().includes(lowerSearch))) {
                    return false;
                }
            }

            // Price range filter
            if (minPrice !== undefined && p.price < minPrice) return false;
            if (maxPrice !== undefined && p.price > maxPrice) return false;

            return true;
        });

        // --- 2. SORTING ---
        filteredProducts.sort((a: any, b: any) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // --- 3. PAGINATION ---
        const totalCount = filteredProducts.length;
        const paginatedData = filteredProducts.slice(skip, skip + take);

        return { count: totalCount, data: paginatedData };

    } catch (e) {
        console.error("Error reading or parsing local_products.json:", e);
        // This will only happen if the file is missing or corrupt
        return { count: 0, data: [] };
    }
};


/**
 * Retrieves a list of products from MongoDB, with a JSON fallback.
 */
export const findAllProducts = async (query: ProductQuery): Promise<any> => { // Return type changed to 'any' for consistency
    const { search, category, minPrice, maxPrice, sortBy = 'name', sortOrder = 'asc', skip = 0, take = 10 } = query;

    // --- MONGO DB LOGIC (For when the DNS issue is resolved) ---
    try {
        const where: any = {};
        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;

        // FIX: Cast db.mongo as any to bypass the missing model type error (runtime object is correct)
        const products = await (db.mongo as any).product.findMany({
            where,
            orderBy,
            skip,
            take,
        });

        const count = await (db.mongo as any).product.count({ where });

        return { count, data: products as Product[] };

    } catch (error) {
        // --- FALLBACK TO LOCAL JSON ---
        console.warn("MongoDB connection failed, serving products from local JSON fallback.");
        return readLocalProducts(query);
    }
};

/**
 * Retrieves a single product by its ID.
 */
export const findProductById = async (id: string): Promise<Product | null> => {
    try {
        // Attempt Mongo first
        const product = await (db.mongo as any).product.findUnique({ where: { id } });
        return product as any as Product | null;
    } catch (error) {
        // Fallback: search the local JSON data
        try {
            const rawData = fs.readFileSync(LOCAL_FALLBACK_PATH, 'utf-8');
            const allProducts = JSON.parse(rawData) as Product[];

            // Find by ID (assuming local product IDs are strings/numbers that match the requested ID)
            const product = allProducts.find(p => p.id.toString() === id);

            return product || null;
        } catch (e) {
            console.error("Error fetching single product from local JSON fallback:", e);
            return null;
        }
    }
};