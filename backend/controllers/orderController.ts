import { Request, Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import * as ProductModel from '../models/Product.model';

export const createOrder = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user!.id;

    try {
        const cart = await db.sql.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total and prepare order items
        let total = 0;
        const orderItemsData = [];

        for (const item of cart.items) {
            const product = await ProductModel.findProductById(item.productId);
            if (product) {
                total += product.price * item.quantity;
                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtPurchase: product.price
                });
            }
        }

        // Transaction handling (Prisma $transaction)
        const order = await db.sql.$transaction(async (prisma: any) => {
            // 1. Create Order
            const newOrder = await prisma.order.create({
                data: {
                    userId,
                    total,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData
                    }
                },
                include: { items: true }
            });

            // 2. Clear Cart
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            return newOrder;
        });

        res.status(201).json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating order' });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user!.id;

    try {
        const orders = await db.sql.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
