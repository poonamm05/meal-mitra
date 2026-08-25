import express from 'express';
import {
  getSmartRecommendations,
  getPantryCookingMatches,
  getSurpriseMeal,
} from '../controllers/recommendationController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/smart-decide', optionalAuth, getSmartRecommendations);
router.post('/use-my-ingredients', optionalAuth, getPantryCookingMatches);
router.get('/surprise-me', optionalAuth, getSurpriseMeal);

export default router;
