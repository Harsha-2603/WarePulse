import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createPurchase, updatePurchase, createSale, createOrder, updateOrder, deleteOrder, getOrders, getOrder, getStock } from '../controllers/orderController.js';

const router = Router();

router.use(authMiddleware);

router.post('/sale', createSale);
router.post('/purchase', createPurchase);
router.put('/purchase/:id', updatePurchase);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.get('/stock/:productId', getStock);

export default router;
