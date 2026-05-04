import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getVendors,
  createVendor,
  getVendor,
  updateVendor,
  deleteVendor
} from '../controllers/vendorController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getVendors);
router.post('/', createVendor);
router.get('/:id', getVendor);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

export default router;
