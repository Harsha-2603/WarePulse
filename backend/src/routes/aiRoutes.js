import express from 'express';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/chat
router.post('/chat', aiController.handleChat);

export default router;
