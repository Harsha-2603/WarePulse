import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  importProductsCsv,
  exportProductsCsv,
  getUnits
} from '../controllers/productController.js';

const router = Router();

router.use(authMiddleware);

router.post('/import', importProductsCsv);
router.get('/export', exportProductsCsv);

router.get('/units', getUnits);

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
