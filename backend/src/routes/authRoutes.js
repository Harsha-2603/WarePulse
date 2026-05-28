import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

// Public unified signup endpoint
router.post('/signup', signup);

// Public unified login endpoint
router.post('/login', login);

export default router;
