import express from 'express';
import {
  logCookedMeal,
  getMealHistory,
  getRepetitionInsights,
} from '../controllers/mealHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/log-cooked', protect, logCookedMeal);
router.get('/', protect, getMealHistory);
router.get('/insights', protect, getRepetitionInsights);

export default router;
