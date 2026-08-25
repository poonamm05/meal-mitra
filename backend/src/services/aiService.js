import axios from 'axios';
import Recipe from '../models/Recipe.js';
import { sampleRecipes } from '../seed/recipesData.js';

/**
 * Intelligent Fallback Heuristic Generator for MealMitra AI
 */
const generateHeuristicAdvice = async (userMessage, userContext = {}) => {
  const msg = (userMessage || '').toLowerCase();

  let recipes = [];
  try {
    recipes = await Recipe.find({}).lean();
  } catch (e) {
    recipes = sampleRecipes;
  }
  if (!recipes || recipes.length === 0) recipes = sampleRecipes;

  // 1. Check for specific queries
  if (msg.includes('potato') || msg.includes('aloo') || msg.includes('tomato') || msg.includes('onion')) {
    const matching = recipes.filter((r) => {
      const ingNames = r.ingredients.map((i) => i.name.toLowerCase()).join(' ');
      return (
        (msg.includes('potato') && ingNames.includes('potato')) ||
        (msg.includes('tomato') && ingNames.includes('tomato')) ||
        (msg.includes('onion') && ingNames.includes('onion'))
      );
    });

    const topDishes = matching.slice(0, 3);
    const dishNames = topDishes.map((d) => d.name).join(', ');

    return {
      text: `With potatoes, onions, and tomatoes, you have classic Indian staples! Here are 3 great options you can whip up right now:\n\n1. **Aloo Jeera with Phulka**: Quick 20-min dinner with minimal spices.\n2. **Dal Tadka with Steamed Rice**: Use tomatoes & onions for a fragrant ghee tadka.\n3. **Quick Aloo Tomato Rasedar Curry**: Comforting gravy dish that pairs wonderfully with roti or rice.\n\n*Pro-tip: If you're short on time, pressure cooking the potatoes takes just 2 whistles!*`,
      suggestedRecipes: topDishes.map((d) => d._id || d.name),
    };
  }

  if (msg.includes('under 30') || msg.includes('quick') || msg.includes('fast') || msg.includes('healthy dinner')) {
    const quickRecipes = recipes.filter((r) => (r.prepTime || 0) + (r.cookTime || 0) <= 30);
    const topQuick = quickRecipes.slice(0, 3);

    return {
      text: `Here are healthy, high-satisfaction dinners you can cook in under 30 minutes:\n\n1. **Paneer Bhurji with Paratha** (⏱️ 20 mins, 24g Protein) — Fast, rich, and high protein.\n2. **Moong Dal Khichdi with Ghee** (⏱️ 20 mins, Soothing) — Light on digestion and restorative.\n3. **Palak Paneer** (⏱️ 25 mins, Iron-rich) — Restaurant taste at home with minimal prep.\n\nWhich of these sounds good for tonight?`,
      suggestedRecipes: topQuick.map((d) => d._id || d.name),
    };
  }

  if (msg.includes('200') || msg.includes('budget') || msg.includes('cheap') || msg.includes('under ₹')) {
    const budgetDishes = recipes.filter((r) => (r.estimatedCost || 100) <= 180);
    const topBudget = budgetDishes.slice(0, 3);

    return {
      text: `Feeding 4 people on a budget under ₹200 is very achievable! Here are top value-packed meals:\n\n1. **Rajma Masala with Jeera Rice** (Approx ₹160 total) — High protein kidney beans with fragrant rice.\n2. **Dal Tadka + Jeera Rice + Roasted Papad** (Approx ₹120 total) — Wholesome and universally loved.\n3. **Moong Dal Khichdi + Kadhi** (Approx ₹90 total) — Ultra cost-effective and nourishing.\n\nAll of these maximize pantry staples while keeping grocery spend low.`,
      suggestedRecipes: topBudget.map((d) => d._id || d.name),
    };
  }

  if (msg.includes('paneer') && (msg.includes('alternative') || msg.includes("don't want") || msg.includes('instead'))) {
    const nonPaneerVeg = recipes.filter(
      (r) =>
        !r.name.toLowerCase().includes('paneer') &&
        (r.dietaryFlags || []).includes('vegetarian')
    );
    const alternatives = nonPaneerVeg.slice(0, 3);

    return {
      text: `No problem! When you want a satisfying, high-protein vegetarian dinner without paneer, try these delicious alternatives:\n\n1. **Matar Mushroom Masala**: Earthy mushrooms have a fantastic meaty texture and umami flavor.\n2. **Amritsari Chole Masala**: High-fiber chickpeas cooked with robust spices.\n3. **Moong Dal Besan Chilla with Fresh Salad**: Crisp, savory, and packed with 14g plant protein.\n4. **Soyabean / Nutrela Matar Curry**: Incredible protein absorption and hearty texture.\n\nWould you like the step-by-step recipe for any of these?`,
      suggestedRecipes: alternatives.map((d) => d._id || d.name),
    };
  }

  // Default contextual helpful assistant response
  const suggestions = recipes.slice(0, 3);
  return {
    text: `Based on your meal preferences, here are top recommendations:\n\n1. **${suggestions[0]?.name || 'Aloo Jeera'}**: ${suggestions[0]?.description || 'Quick and flavorful'}\n2. **${suggestions[1]?.name || 'Dal Tadka'}**: ${suggestions[1]?.description || 'Classic comforting protein'}\n3. **${suggestions[2]?.name || 'Paneer Bhurji'}**: ${suggestions[2]?.description || 'Fast high-protein dinner'}\n\nYou can also tell me specific ingredients in your fridge or your time limit, and I will tailor an exact meal plan!`,
    suggestedRecipes: suggestions.map((d) => d._id || d.name),
  };
};

/**
 * Generate AI Response using Gemini API / OpenAI API if configured, otherwise smart heuristic fallback
 */
export const askAiAssistant = async ({ message, conversationHistory = [], userProfile = {} }) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are MealMitra AI, a warm, practical, Indian-cuisine and global meal decision companion.
User Profile: Household size: ${userProfile.householdSize || 2}, Diet: ${userProfile.dietaryPreference || 'Vegetarian'}, Max Time: ${userProfile.defaultMaxCookingTime || 30} mins.
Keep your response concise, actionable, friendly, with formatted bullet points, exact cooking times, and practical substitution tips.

User Question: ${message}`,
                },
              ],
            },
          ],
        },
        { timeout: 8000 }
      );

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText) {
        return {
          text: aiText,
          suggestedRecipes: [],
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart heuristic:', err.message);
    }
  }

  // Fallback to rich heuristic engine
  return await generateHeuristicAdvice(message, userProfile);
};
