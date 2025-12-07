import express from 'express';
import { getCart, addToCart, removeFromCart, updateCartItem } from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/', protect, updateCartItem);
router.delete('/:productId', protect, removeFromCart);

export default router;
