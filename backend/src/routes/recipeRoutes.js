import express from 'express';
import { getRecipes, getRecipeById, getIngredientCatalog } from '../controllers/recipeController.js';

const router = express.Router();

router.get('/', getRecipes);
router.get('/ingredients/catalog', getIngredientCatalog);
router.get('/:id', getRecipeById);

export default router;
