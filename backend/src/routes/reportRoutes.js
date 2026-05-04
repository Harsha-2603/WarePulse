import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getSummary, getMonthlySales, getTopCategories, getMargins } from '../controllers/reportController.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/monthly-sales', getMonthlySales);
router.get('/top-categories', getTopCategories);
router.get('/margins', getMargins);

export default router;
