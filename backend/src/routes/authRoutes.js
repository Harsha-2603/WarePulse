import express from 'express';
import { signupOwner } from '../controllers/authController.js';

const router = express.Router();

// Public owner signup endpoint
router.post('/signup', signupOwner);

export default router;
