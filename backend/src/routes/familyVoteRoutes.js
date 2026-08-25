import express from 'express';
import {
  createFamilyVote,
  getVoteByShareCode,
  castVote,
  getUserPolls,
  closePoll,
} from '../controllers/familyVoteController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createFamilyVote);
router.get('/my-polls', protect, getUserPolls);
router.get('/poll/:shareCode', optionalAuth, getVoteByShareCode);
router.post('/poll/:shareCode/vote', optionalAuth, castVote);
router.put('/poll/:id/close', protect, closePoll);

export default router;
