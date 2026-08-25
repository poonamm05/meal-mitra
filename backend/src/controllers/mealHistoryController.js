import MealHistory from '../models/MealHistory.js';
import Recipe from '../models/Recipe.js';
import { sampleRecipes } from '../seed/recipesData.js';

export const logCookedMeal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipeId, mealType = 'dinner', rating = 5, feedback = 'loved_it', userNotes = '', servingsPrepared = 2 } = req.body;

    const historyEntry = await MealHistory.create({
      user: userId,
      recipe: recipeId,
      mealType,
      rating,
      feedback,
      userNotes,
      servingsPrepared,
      cookedAt: new Date(),
    });

    const populated = await MealHistory.findById(historyEntry._id).populate('recipe');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMealHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await MealHistory.find({ user: userId })
      .populate('recipe')
      .sort({ cookedAt: -1 })
      .limit(50);

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRepetitionInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const history = await MealHistory.find({
      user: userId,
      cookedAt: { $gte: fourteenDaysAgo },
    }).populate('recipe');

    const dishCounts = {};
    const ingredientCounts = {};
    let totalMeals = history.length;

    history.forEach((h) => {
      if (!h.recipe) return;
      const rName = h.recipe.name;
      dishCounts[rName] = (dishCounts[rName] || 0) + 1;

      (h.recipe.ingredients || []).forEach((ing) => {
        if (!ing.isPantryStaple) {
          ingredientCounts[ing.name] = (ingredientCounts[ing.name] || 0) + 1;
        }
      });
    });

    const frequentDishes = Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const frequentIngredients = Object.entries(ingredientCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate variety score: unique dishes / total meals
    const uniqueDishesCount = Object.keys(dishCounts).length;
    const varietyScore = totalMeals > 0 ? Math.min(100, Math.round((uniqueDishesCount / totalMeals) * 100)) : 100;

    let varietyTip = 'Great variety in your weekly rotation!';
    if (varietyScore < 60) {
      varietyTip = 'You have repeated a few dishes lately. Try introducing legumes or seasonal greens for a fresh twist!';
    } else if (frequentDishes.length > 0 && frequentDishes[0].count >= 3) {
      varietyTip = `You cooked ${frequentDishes[0].name} ${frequentDishes[0].count} times recently. Consider switching to an alternative tonight!`;
    }

    res.json({
      success: true,
      data: {
        totalMealsCookedIn14Days: totalMeals,
        varietyScore,
        varietyTip,
        frequentDishes,
        frequentIngredients,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
