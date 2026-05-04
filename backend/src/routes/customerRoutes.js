import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
