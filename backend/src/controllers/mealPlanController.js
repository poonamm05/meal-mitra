import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';
import { sampleRecipes } from '../seed/recipesData.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const getWeeklyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    let plan = await MealPlan.findOne({ user: userId, status: 'active' })
      .populate('days.breakfast')
      .populate('days.lunch')
      .populate('days.dinner')
      .populate('days.snacks');

    if (!plan) {
      // Auto-generate a starter plan
      plan = await generateDefaultPlanForUser(userId, req.user?.dietaryPreference || 'vegetarian');
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const autoGenerateWeeklyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dietaryPreference = req.user?.dietaryPreference || 'vegetarian' } = req.body;

    let recipes = [];
    try {
      recipes = await Recipe.find({});
    } catch (e) {
      recipes = sampleRecipes;
    }
    if (!recipes || recipes.length === 0) recipes = sampleRecipes;

    // Filter recipes by dietary preference
    const validRecipes = recipes.filter((r) => {
      const flags = r.dietaryFlags || [];
      if (dietaryPreference === 'vegetarian') return !flags.includes('non-vegetarian');
      if (dietaryPreference === 'vegan') return flags.includes('vegan');
      return true;
    });

    const breakfasts = validRecipes.filter((r) => r.mealType.includes('breakfast'));
    const lunches = validRecipes.filter((r) => r.mealType.includes('lunch'));
    const dinners = validRecipes.filter((r) => r.mealType.includes('dinner'));

    const getRandomUnique = (pool, usedIds) => {
      const unused = pool.filter((r) => !usedIds.has(r._id?.toString()));
      const selectionPool = unused.length > 0 ? unused : pool;
      const picked = selectionPool[Math.floor(Math.random() * selectionPool.length)] || pool[0];
      if (picked && picked._id) usedIds.add(picked._id.toString());
      return picked;
    };

    const usedBreakfasts = new Set();
    const usedLunches = new Set();
    const usedDinners = new Set();

    const days = DAYS.map((dayName) => ({
      dayOfWeek: dayName,
      breakfast: getRandomUnique(breakfasts, usedBreakfasts)?._id,
      lunch: getRandomUnique(lunches, usedLunches)?._id,
      dinner: getRandomUnique(dinners, usedDinners)?._id,
      snacks: [],
      notes: '',
    }));

    // Archive previous active plan if exists
    await MealPlan.updateMany({ user: userId, status: 'active' }, { status: 'archived' });

    const newPlan = await MealPlan.create({
      user: userId,
      title: 'Smart AI Weekly Plan',
      weekStartDate: new Date().toISOString().split('T')[0],
      days,
      isAiGenerated: true,
      status: 'active',
    });

    const populated = await MealPlan.findById(newPlan._id)
      .populate('days.breakfast')
      .populate('days.lunch')
      .populate('days.dinner');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMealSlot = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dayOfWeek, mealType, recipeId } = req.body; // mealType = 'breakfast' | 'lunch' | 'dinner'

    let plan = await MealPlan.findOne({ user: userId, status: 'active' });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No active meal plan found' });
    }

    const dayIndex = plan.days.findIndex((d) => d.dayOfWeek === dayOfWeek);
    if (dayIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid day of week' });
    }

    if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
      plan.days[dayIndex][mealType] = recipeId;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid meal type' });
    }

    await plan.save();

    const populated = await MealPlan.findById(plan._id)
      .populate('days.breakfast')
      .populate('days.lunch')
      .populate('days.dinner');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateDefaultPlanForUser = async (userId, dietaryPreference) => {
  let recipes = [];
  try {
    recipes = await Recipe.find({});
  } catch (e) {
    recipes = sampleRecipes;
  }
  if (!recipes || recipes.length === 0) recipes = sampleRecipes;

  const breakfasts = recipes.filter((r) => r.mealType.includes('breakfast'));
  const lunches = recipes.filter((r) => r.mealType.includes('lunch'));
  const dinners = recipes.filter((r) => r.mealType.includes('dinner'));

  const days = DAYS.map((dayName, idx) => ({
    dayOfWeek: dayName,
    breakfast: (breakfasts[idx % breakfasts.length] || recipes[0])._id,
    lunch: (lunches[idx % lunches.length] || recipes[1])._id,
    dinner: (dinners[idx % dinners.length] || recipes[2])._id,
    snacks: [],
  }));

  const plan = await MealPlan.create({
    user: userId,
    title: 'My Weekly Plan',
    weekStartDate: new Date().toISOString().split('T')[0],
    days,
    isAiGenerated: false,
    status: 'active',
  });

  return await MealPlan.findById(plan._id)
    .populate('days.breakfast')
    .populate('days.lunch')
    .populate('days.dinner');
};
