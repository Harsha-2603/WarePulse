import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createInvoice, createPayment, getInvoices, updateInvoicePaymentMode } from '../controllers/billingController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getInvoices);
router.post('/invoice', createInvoice);
router.post('/payment', createPayment);
router.patch('/invoice/:id/payment-mode', updateInvoicePaymentMode);

export default router;
