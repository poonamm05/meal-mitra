import express from 'express';
import {
  getGroceryList,
  generateFromMealPlan,
  addGroceryItem,
  toggleItemPurchased,
  deleteGroceryItem,
} from '../controllers/groceryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getGroceryList);
router.post('/generate-from-plan', protect, generateFromMealPlan);
router.post('/items', protect, addGroceryItem);
router.patch('/items/:itemId/toggle', protect, toggleItemPurchased);
router.delete('/items/:itemId', protect, deleteGroceryItem);

export default router;
