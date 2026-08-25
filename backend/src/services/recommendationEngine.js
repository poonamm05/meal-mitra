import Recipe from '../models/Recipe.js';
import { sampleRecipes } from '../seed/recipesData.js';

// Helper to normalize strings for comparison
const normalize = (str) => (str || '').toLowerCase().trim();

// Check if an ingredient matches user's available list
const isIngredientMatched = (recipeIngredientName, userAvailableList) => {
  const normRecipeIng = normalize(recipeIngredientName);
  return userAvailableList.some((userIng) => {
    const normUser = normalize(userIng);
    return normRecipeIng.includes(normUser) || normUser.includes(normRecipeIng);
  });
};

/**
 * Multi-Factor Smart Recommendation Engine (Without Budget/Price Constraints)
 */
export const rankRecipesForUser = async ({
  availableIngredients = [],
  mealType = 'dinner',
  servingSize = 2,
  maxCookingTime = 45,
  dietaryPreference = 'vegetarian',
  cuisine = 'any',
  dislikedIngredients = [],
  filterTags = [],
  recentMealHistory = [], // [{ recipeId, cookedAt }]
  favoriteRecipeIds = [],
}) => {
  // Fetch all recipes from DB or fallback to sampleRecipes
  let recipes = [];
  try {
    recipes = await Recipe.find({}).lean();
  } catch (err) {
    console.warn('Using in-memory sample recipes for ranking');
  }

  if (!recipes || recipes.length === 0) {
    recipes = sampleRecipes.map((r, idx) => ({ ...r, _id: `mock_${idx}` }));
  }

  const normDisliked = dislikedIngredients.map(normalize);
  const now = new Date();

  // Create a map of recipeId -> daysSinceLastCooked
  const historyMap = new Map();
  recentMealHistory.forEach((h) => {
    if (!h.recipeId && !h.recipe) return;
    const rId = (h.recipeId || h.recipe._id || h.recipe).toString();
    const cookedDate = new Date(h.cookedAt || h.createdAt || now);
    const diffDays = Math.max(0, Math.floor((now - cookedDate) / (1000 * 60 * 60 * 24)));
    if (!historyMap.has(rId) || diffDays < historyMap.get(rId)) {
      historyMap.set(rId, diffDays);
    }
  });

  const scoredRecipes = recipes.map((recipe) => {
    let score = 50; // Base score
    const rationalePoints = [];
    const missingIngredients = [];
    const availableIngredientsMatched = [];

    const recipeIdStr = (recipe._id || '').toString();

    // 1. Meal Type Compatibility
    if (mealType && mealType !== 'any') {
      const matchMealType = Array.isArray(recipe.mealType)
        ? recipe.mealType.includes(mealType)
        : recipe.mealType === mealType;
      if (matchMealType) {
        score += 25;
        rationalePoints.push(`Ideal for ${mealType}`);
      } else {
        score -= 30;
      }
    }

    // 2. Dietary Preference Compliance
    const rFlags = recipe.dietaryFlags || [];
    if (dietaryPreference === 'vegetarian') {
      if (rFlags.includes('non-vegetarian') || rFlags.includes('eggetarian')) {
        score -= 200; // Strict filter penalty
      } else {
        score += 15;
      }
    } else if (dietaryPreference === 'vegan') {
      if (!rFlags.includes('vegan')) {
        score -= 200;
      } else {
        score += 20;
      }
    } else if (dietaryPreference === 'eggetarian') {
      if (rFlags.includes('non-vegetarian') && !rFlags.includes('eggetarian')) {
        score -= 200;
      }
    } else if (dietaryPreference === 'jain') {
      // Check for onion, garlic, potato in ingredients
      const hasRootVeggies = (recipe.ingredients || []).some((ing) => {
        const n = normalize(ing.name);
        return n.includes('onion') || n.includes('garlic') || n.includes('potato');
      });
      if (hasRootVeggies) {
        score -= 200;
      } else {
        score += 20;
      }
    }

    // 3. Disliked Ingredients Filter
    const hasDisliked = (recipe.ingredients || []).some((ing) => {
      const n = normalize(ing.name);
      return normDisliked.some((dis) => n.includes(dis));
    });
    if (hasDisliked) {
      score -= 100;
    }

    // 4. Cuisine Preference
    if (cuisine && cuisine !== 'any') {
      if (normalize(recipe.cuisine) === normalize(cuisine)) {
        score += 20;
        rationalePoints.push(`${recipe.cuisine} specialty`);
      }
    }

    // 5. Ingredient Match Calculation
    const totalIngredients = recipe.ingredients || [];
    let matchedCount = 0;

    totalIngredients.forEach((ing) => {
      const isMatched = isIngredientMatched(ing.name, availableIngredients);
      if (isMatched) {
        matchedCount++;
        availableIngredientsMatched.push(ing);
      } else {
        if (!ing.isPantryStaple) {
          missingIngredients.push(ing);
        }
      }
    });

    const matchRatio = totalIngredients.length > 0 ? matchedCount / totalIngredients.length : 0;
    const matchPercentage = Math.round(matchRatio * 100);

    if (availableIngredients.length > 0) {
      if (matchPercentage >= 70) {
        score += 50;
        rationalePoints.push(`Uses ${matchPercentage}% of your available ingredients`);
      } else if (matchPercentage >= 40) {
        score += 25;
        rationalePoints.push(`Matches several pantry items`);
      } else {
        score += Math.round(matchPercentage * 0.25);
      }

      if (missingIngredients.length === 0) {
        score += 35;
        rationalePoints.push('100% Ready to Cook (0 Missing Items!)');
      } else if (missingIngredients.length <= 2) {
        score += 20;
        rationalePoints.push(`Only missing ${missingIngredients.length} minor item(s)`);
      }
    }

    // 6. Cooking Time Constraint
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    if (maxCookingTime) {
      if (totalTime <= maxCookingTime) {
        score += 25;
        rationalePoints.push(`Ready in ${totalTime} mins (under your ${maxCookingTime}m limit)`);
      } else {
        const overtime = totalTime - maxCookingTime;
        score -= Math.min(40, overtime * 2);
      }
    }

    // 7. Repetition Prevention & History Penalty
    if (historyMap.has(recipeIdStr)) {
      const daysAgo = historyMap.get(recipeIdStr);
      if (daysAgo === 0) {
        // Cooked today
        score -= 75;
      } else if (daysAgo === 1) {
        // Cooked yesterday
        score -= 50;
      } else if (daysAgo <= 3) {
        score -= 25;
      } else if (daysAgo >= 7) {
        score += 15;
        rationalePoints.push(`Fresh variety (haven't had this in over a week)`);
      }
    } else {
      score += 10;
      rationalePoints.push('Adds fresh variety to your recent meal cycle');
    }

    // 8. Favorite Bonus
    const isFavorite = favoriteRecipeIds.some((favId) => favId.toString() === recipeIdStr);
    if (isFavorite) {
      score += 15;
      rationalePoints.push('From your Favorite list ⭐');
    }

    // 9. Filter Tags
    if (filterTags.length > 0) {
      const matchingTags = filterTags.filter((tag) => rFlags.includes(tag) || (recipe.tags || []).includes(tag));
      score += matchingTags.length * 10;
      if (matchingTags.length > 0) {
        rationalePoints.push(`Matches filters: ${matchingTags.join(', ')}`);
      }
    }

    return {
      ...recipe,
      score,
      matchPercentage,
      totalTime,
      availableIngredientsMatched,
      missingIngredients,
      rationale: rationalePoints.slice(0, 4),
      isRecentlyCooked: historyMap.has(recipeIdStr) && historyMap.get(recipeIdStr) <= 2,
      daysSinceCooked: historyMap.get(recipeIdStr),
    };
  });

  // Sort descending by score
  scoredRecipes.sort((a, b) => b.score - a.score);

  return scoredRecipes;
};
