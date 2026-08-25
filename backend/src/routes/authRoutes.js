import express from 'express';
import {
  registerUser,
  loginUser,
  demoLogin,
  getMe,
  updatePreferences,
  updatePantry,
  toggleFavorite,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.put('/pantry', protect, updatePantry);
router.post('/favorites/:recipeId', protect, toggleFavorite);

export default router;
