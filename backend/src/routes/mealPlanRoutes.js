import express from 'express';
import {
  getWeeklyPlan,
  autoGenerateWeeklyPlan,
  updateMealSlot,
} from '../controllers/mealPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/weekly', protect, getWeeklyPlan);
router.post('/auto-generate', protect, autoGenerateWeeklyPlan);
router.put('/update-slot', protect, updateMealSlot);

export default router;
