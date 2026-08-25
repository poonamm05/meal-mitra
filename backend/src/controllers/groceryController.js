import GroceryList from '../models/GroceryList.js';
import MealPlan from '../models/MealPlan.js';
import User from '../models/User.js';

export const getGroceryList = async (req, res) => {
  try {
    const userId = req.user._id;
    let list = await GroceryList.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!list) {
      list = await GroceryList.create({
        user: userId,
        title: 'Weekly Grocery List',
        items: [
          { name: 'Potato', category: 'Vegetables', quantity: 2, unit: 'kg', estimatedCost: 60, isPurchased: false },
          { name: 'Onion', category: 'Vegetables', quantity: 1.5, unit: 'kg', estimatedCost: 50, isPurchased: false },
          { name: 'Tomato', category: 'Vegetables', quantity: 1, unit: 'kg', estimatedCost: 40, isPurchased: true },
          { name: 'Paneer', category: 'Dairy', quantity: 400, unit: 'grams', estimatedCost: 160, isPurchased: false },
          { name: 'Coriander Fresh', category: 'Vegetables', quantity: 1, unit: 'bunch', estimatedCost: 15, isPurchased: false },
        ],
        totalEstimatedCost: 325,
      });
    }

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateFromMealPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const plan = await MealPlan.findOne({ user: userId, status: 'active' })
      .populate('days.breakfast')
      .populate('days.lunch')
      .populate('days.dinner');

    if (!plan) {
      return res.status(404).json({ success: false, message: 'No active meal plan found to generate groceries from' });
    }

    const user = await User.findById(userId);
    const pantryItemNames = (user?.pantryItems || []).map((p) => p.name.toLowerCase());

    const aggregated = new Map();

    const processRecipe = (recipe) => {
      if (!recipe || !recipe.ingredients) return;
      recipe.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase().trim();
        const inPantry = pantryItemNames.some((pName) => pName.includes(key) || key.includes(pName));

        if (aggregated.has(key)) {
          const existing = aggregated.get(key);
          existing.quantity += ing.quantity || 1;
          existing.recipeCount += 1;
        } else {
          aggregated.set(key, {
            name: ing.name,
            category: ing.category || 'Vegetables',
            quantity: ing.quantity || 1,
            unit: ing.unit || 'unit',
            isPantryAvailable: inPantry,
            isPurchased: inPantry, // auto-check if already in pantry
            estimatedCost: ing.isPantryStaple ? 20 : 45,
            recipeName: recipe.name,
            addedManually: false,
          });
        }
      });
    };

    plan.days.forEach((day) => {
      if (day.breakfast) processRecipe(day.breakfast);
      if (day.lunch) processRecipe(day.lunch);
      if (day.dinner) processRecipe(day.dinner);
    });

    const items = Array.from(aggregated.values());
    const totalEstimatedCost = items
      .filter((i) => !i.isPantryAvailable)
      .reduce((sum, item) => sum + (item.estimatedCost || 30), 0);

    let list = await GroceryList.findOne({ user: userId });
    if (list) {
      list.items = items;
      list.totalEstimatedCost = totalEstimatedCost;
      await list.save();
    } else {
      list = await GroceryList.create({
        user: userId,
        title: `Groceries for Plan (${plan.title || 'Weekly'})`,
        items,
        totalEstimatedCost,
      });
    }

    res.json({ success: true, count: items.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addGroceryItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, category = 'Other', quantity = 1, unit = 'item', estimatedCost = 30 } = req.body;

    let list = await GroceryList.findOne({ user: userId });
    if (!list) {
      list = await GroceryList.create({ user: userId, items: [] });
    }

    list.items.push({
      name,
      category,
      quantity,
      unit,
      estimatedCost,
      isPurchased: false,
      addedManually: true,
    });

    list.totalEstimatedCost = list.items
      .filter((i) => !i.isPurchased)
      .reduce((sum, item) => sum + (item.estimatedCost || 30), 0);

    await list.save();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleItemPurchased = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const list = await GroceryList.findOne({ user: userId });
    if (!list) return res.status(404).json({ success: false, message: 'Grocery list not found' });

    const item = list.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in grocery list' });

    item.isPurchased = !item.isPurchased;
    await list.save();

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGroceryItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const list = await GroceryList.findOne({ user: userId });
    if (!list) return res.status(404).json({ success: false, message: 'Grocery list not found' });

    list.items = list.items.filter((i) => i._id.toString() !== itemId);
    await list.save();

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
