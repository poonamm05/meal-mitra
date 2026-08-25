import express from 'express';
import {
  sendAiMessage,
  getConversation,
  clearConversation,
} from '../controllers/aiAssistantController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', optionalAuth, sendAiMessage);
router.get('/conversation', optionalAuth, getConversation);
router.post('/clear', optionalAuth, clearConversation);

export default router;
