import express from 'express';
import { signup } from '../controllers/authController.js';

const router = express.Router();

// Public unified signup endpoint
router.post('/signup', signup);

export default router;
