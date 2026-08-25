import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  adminGetRecipes,
  adminUpdateRecipe,
  adminDeleteRecipe,
  adminCreateRecipe,
  adminGetStats,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require: login + admin role
router.use(protect, adminOnly);

router.get('/stats', adminGetStats);
router.get('/recipes', adminGetRecipes);
router.post('/recipes', adminCreateRecipe);
router.put('/recipes/:id', adminUpdateRecipe);
router.delete('/recipes/:id', adminDeleteRecipe);

export default router;
