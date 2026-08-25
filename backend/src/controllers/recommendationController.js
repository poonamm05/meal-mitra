import { rankRecipesForUser } from '../services/recommendationEngine.js';
import MealHistory from '../models/MealHistory.js';
import User from '../models/User.js';

export const getSmartRecommendations = async (req, res) => {
  try {
    const {
      availableIngredients = [],
      mealType = 'dinner',
      servingSize = 2,
      maxCookingTime = 45,
      maxBudget = 300,
      dietaryPreference = 'vegetarian',
      cuisine = 'any',
      dislikedIngredients = [],
      filterTags = [],
    } = req.body;

    let recentMealHistory = [];
    let favoriteRecipeIds = [];

    if (req.user && req.user._id) {
      try {
        const historyDocs = await MealHistory.find({ user: req.user._id })
          .sort({ cookedAt: -1 })
          .limit(15);
        recentMealHistory = historyDocs;

        const userDoc = await User.findById(req.user._id);
        if (userDoc) {
          favoriteRecipeIds = userDoc.favoriteRecipes || [];
        }
      } catch (e) {
        console.warn('Could not load user history for ranking:', e.message);
      }
    }

    const ranked = await rankRecipesForUser({
      availableIngredients,
      mealType,
      servingSize: Number(servingSize),
      maxCookingTime: Number(maxCookingTime),
      maxBudget: Number(maxBudget),
      dietaryPreference,
      cuisine,
      dislikedIngredients,
      filterTags,
      recentMealHistory,
      favoriteRecipeIds,
    });

    const topRecommendations = ranked.slice(0, 6);
    const surpriseChoice = topRecommendations[0] || null;

    res.json({
      success: true,
      count: topRecommendations.length,
      data: topRecommendations,
      topPick: surpriseChoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPantryCookingMatches = async (req, res) => {
  try {
    let { ingredients = [] } = req.body;

    // If user passed empty ingredients and is authenticated, optionally use user's saved pantry
    if ((!ingredients || ingredients.length === 0) && req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.pantryItems && user.pantryItems.length > 0) {
        ingredients = user.pantryItems.map((p) => p.name);
      }
    }

    if (!ingredients || ingredients.length === 0) {
      return res.json({
        success: true,
        data: {
          readyToCook: [],
          almostReady: [],
          needShopping: [],
          pantryIngredientsUsed: [],
        },
      });
    }

    const ranked = await rankRecipesForUser({
      availableIngredients: ingredients,
      mealType: 'any',
      dietaryPreference: req.user?.dietaryPreference || 'vegetarian',
      maxCookingTime: 60,
    });

    // ONLY include dishes that actually contain at least one of the selected pantry ingredients
    const matchingRecipes = ranked.filter((r) => r.availableIngredientsMatched && r.availableIngredientsMatched.length > 0);

    const readyToCook = matchingRecipes.filter((r) => r.missingIngredients.length === 0);
    const almostReady = matchingRecipes.filter((r) => r.missingIngredients.length > 0 && r.missingIngredients.length <= 2);
    const needShopping = matchingRecipes.filter((r) => r.missingIngredients.length > 2);

    res.json({
      success: true,
      data: {
        readyToCook: readyToCook.slice(0, 8),
        almostReady: almostReady.slice(0, 8),
        needShopping: needShopping.slice(0, 6),
        pantryIngredientsUsed: ingredients,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSurpriseMeal = async (req, res) => {
  try {
    const currentHour = new Date().getHours();
    let autoMealType = 'dinner';
    if (currentHour >= 5 && currentHour < 11) autoMealType = 'breakfast';
    else if (currentHour >= 11 && currentHour < 16) autoMealType = 'lunch';
    else if (currentHour >= 16 && currentHour < 18) autoMealType = 'snack';

    const ranked = await rankRecipesForUser({
      availableIngredients: [],
      mealType: autoMealType,
      dietaryPreference: req.user?.dietaryPreference || 'vegetarian',
      maxCookingTime: 40,
    });

    // Pick from top 3 with slight randomness
    const topThree = ranked.slice(0, 3);
    const randomIndex = Math.floor(Math.random() * (topThree.length || 1));
    const selected = topThree[randomIndex] || ranked[0];

    res.json({
      success: true,
      mealType: autoMealType,
      data: selected,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
