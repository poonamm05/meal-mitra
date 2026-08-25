import Recipe from '../models/Recipe.js';
import User from '../models/User.js';

// GET /api/admin/recipes  — full list with all fields
export const adminGetRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({}).sort({ name: 1 }).lean();
    res.json({ success: true, data: recipes, total: recipes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/recipes/:id  — update any field (photo, name, description, etc.)
export const adminUpdateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'name', 'description', 'imageUrl', 'cuisine', 'difficulty',
      'prepTime', 'cookTime', 'servingSize', 'mealType', 'dietaryFlags',
      'tags', 'defaultDecisionTip', 'instructions', 'ingredients'
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If instructions provided as multiline string or array
    if (typeof updates.instructions === 'string') {
      updates.instructions = updates.instructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updated = await Recipe.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/recipes/:id  — remove a recipe
export const adminDeleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Recipe.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.json({ success: true, message: `"${deleted.name}" has been deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/recipes  — create a new recipe
export const adminCreateRecipe = async (req, res) => {
  try {
    const {
      name, description, imageUrl, cuisine, difficulty,
      prepTime, cookTime, servingSize, mealType, dietaryFlags,
      tags, defaultDecisionTip, instructions, ingredients
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Dish name is required.' });
    }

    // Process instructions
    let parsedInstructions = [];
    if (Array.isArray(instructions) && instructions.length > 0) {
      parsedInstructions = instructions.filter((s) => s && s.trim());
    } else if (typeof instructions === 'string' && instructions.trim()) {
      parsedInstructions = instructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (parsedInstructions.length === 0) {
      parsedInstructions = [
        `Prepare and chop all required ingredients for ${name.trim()}.`,
        `Heat oil or ghee in a pan and temper with spices.`,
        `Cook on medium flame until aroma releases and flavors blend.`,
        `Garnish with fresh coriander and serve hot.`
      ];
    }

    // Process ingredients
    let parsedIngredients = [];
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      parsedIngredients = ingredients;
    } else if (typeof ingredients === 'string' && ingredients.trim()) {
      parsedIngredients = ingredients
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean)
        .map((iName) => ({
          name: iName,
          quantity: 1,
          unit: 'portion',
          category: 'Vegetables',
          isPantryStaple: false,
        }));
    }
    if (parsedIngredients.length === 0) {
      parsedIngredients = [
        { name: 'Cooking Oil / Ghee', quantity: 2, unit: 'tbsp', category: 'Oils & Sauces', isPantryStaple: true },
        { name: 'Spices & Salt', quantity: 1, unit: 'tsp', category: 'Spices & Condiments', isPantryStaple: true },
      ];
    }

    const recipe = await Recipe.create({
      name: name.trim(),
      description: description && description.trim() ? description.trim() : `Delicious authentic ${cuisine || 'Indian'} style ${name.trim()} prepared fresh with kitchen ingredients.`,
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80',
      cuisine: cuisine && cuisine.trim() ? cuisine.trim() : 'North Indian',
      difficulty: difficulty || 'Easy',
      prepTime: Number(prepTime) || 10,
      cookTime: Number(cookTime) || 20,
      servingSize: Number(servingSize) || 2,
      mealType: mealType && mealType.length > 0 ? mealType : ['lunch', 'dinner'],
      dietaryFlags: dietaryFlags && dietaryFlags.length > 0 ? dietaryFlags : ['vegetarian'],
      tags: tags || ['homestyle', 'fresh'],
      defaultDecisionTip: defaultDecisionTip || `Fresh homemade ${name.trim()} in under ${(Number(prepTime) || 10) + (Number(cookTime) || 20)} mins.`,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      nutrition: { calories: 360, protein: 10, carbs: 50, fat: 10, fiber: 5 },
    });

    res.status(201).json({ success: true, data: recipe });
  } catch (err) {
    console.error('adminCreateRecipe error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stats  — quick dashboard summary
export const adminGetStats = async (req, res) => {
  try {
    const [totalRecipes, totalUsers] = await Promise.all([
      Recipe.countDocuments(),
      User.countDocuments({ role: 'user' }),
    ]);
    res.json({ success: true, data: { totalRecipes, totalUsers } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
