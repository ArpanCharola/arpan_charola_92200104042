import { Request, Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import * as ProductModel from '../models/Product.model';

// Helper to get cart with product details
// Since products are in Mongo/JSON, we need to fetch them manually and merge.
const getCartWithProducts = async (userId: number) => {
    const cart = await db.sql.cart.findUnique({
        where: { userId },
        include: { items: true },
    });

    if (!cart) return null;

    // Fetch product details for each item
    const itemsWithProduct = await Promise.all(cart.items.map(async (item) => {
        const product = await ProductModel.findProductById(item.productId);
        return {
            ...item,
            product: product || { name: 'Unknown Product', price: 0, imageUrls: [] } // Fallback
        };
    }));

    return { ...cart, items: itemsWithProduct };
};

export const getCart = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user!.id;

    try {
        let cart = await getCartWithProducts(userId);

        if (!cart) {
            // Create empty cart if not exists
            const newCart = await db.sql.cart.create({
                data: { userId }
            });
            cart = { ...newCart, items: [] };
        }

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addToCart = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user!.id;
    const { productId, quantity } = req.body;

    try {
        // 1. Ensure Cart Exists
        let cart = await db.sql.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await db.sql.cart.create({ data: { userId } });
        }

        // 2. Check if item exists in cart
        const existingItem = await db.sql.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: productId
                }
            }
        });

        if (existingItem) {
            // Update quantity
            await db.sql.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (quantity || 1) }
            });
        } else {
            // Add new item
            await db.sql.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId,
                    quantity: quantity || 1
                }
            });
        }

        const updatedCart = await getCartWithProducts(userId);
        res.json(updatedCart);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user!.id;
    const { productId } = req.params;

    try {
        const cart = await db.sql.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        await db.sql.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId: productId
            }
        });

        const updatedCart = await getCartWithProducts(userId);
        res.json(updatedCart);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCartItem = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user!.id;
    const { productId, quantity } = req.body;

    try {
        const cart = await db.sql.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        if (quantity <= 0) {
            // Remove if quantity is 0 or less
            await db.sql.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: productId
                }
            });
        } else {
            await db.sql.cartItem.updateMany({
                where: {
                    cartId: cart.id,
                    productId: productId
                },
                data: { quantity }
            });
        }

        const updatedCart = await getCartWithProducts(userId);
        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
