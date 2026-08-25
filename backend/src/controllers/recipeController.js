import Recipe from '../models/Recipe.js';
import { sampleRecipes } from '../seed/recipesData.js';

export const getRecipes = async (req, res) => {
  try {
    const { search, cuisine, mealType, dietary, maxTime, maxBudget, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (cuisine && cuisine !== 'all') {
      query.cuisine = { $regex: cuisine, $options: 'i' };
    }

    if (mealType && mealType !== 'all') {
      query.mealType = mealType;
    }

    if (dietary && dietary !== 'all') {
      query.dietaryFlags = dietary;
    }

    let recipes = [];
    try {
      recipes = await Recipe.find(query);
    } catch (e) {
      recipes = sampleRecipes;
    }

    if (!recipes || recipes.length === 0) {
      // Filter from sampleRecipes fallback
      recipes = sampleRecipes.filter((r) => {
        if (cuisine && cuisine !== 'all' && r.cuisine.toLowerCase() !== cuisine.toLowerCase()) return false;
        if (mealType && mealType !== 'all' && !r.mealType.includes(mealType)) return false;
        if (dietary && dietary !== 'all' && !r.dietaryFlags.includes(dietary)) return false;
        if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
    }

    if (maxTime) {
      recipes = recipes.filter((r) => (r.prepTime || 0) + (r.cookTime || 0) <= Number(maxTime));
    }

    if (maxBudget) {
      recipes = recipes.filter((r) => (r.estimatedCost || 100) <= Number(maxBudget));
    }

    res.json({ success: true, count: recipes.length, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    let recipe = null;

    try {
      recipe = await Recipe.findById(id);
    } catch (e) {
      // ignore
    }

    if (!recipe) {
      recipe = sampleRecipes.find((r) => (r._id && r._id.toString() === id) || r.name.toLowerCase() === id.toLowerCase()) || sampleRecipes[0];
    }

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Get similar recipes
    let similar = [];
    try {
      similar = await Recipe.find({
        cuisine: recipe.cuisine,
        _id: { $ne: recipe._id },
      }).limit(3);
    } catch (e) {
      similar = sampleRecipes.filter((r) => r.cuisine === recipe.cuisine).slice(0, 3);
    }

    res.json({ success: true, data: recipe, similar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getIngredientCatalog = async (req, res) => {
  try {
    const categories = {
      Vegetables: ['Potato', 'Onion', 'Tomato', 'Garlic', 'Ginger', 'Green Chilli', 'Capsicum', 'Spinach', 'Green Peas', 'Cauliflower', 'Eggplant (Baingan)', 'Cucumber', 'Carrot', 'Cabbage', 'Fresh Coriander', 'Curry Leaves', 'Lemon'],
      Dairy: ['Paneer', 'Curd (Dahi)', 'Desi Ghee', 'Butter', 'Fresh Milk', 'Cheese', 'Fresh Cream'],
      'Grains & Pulses': ['Basmati Rice', 'Toor Dal', 'Moong Dal', 'Whole Wheat Flour (Atta)', 'Poha', 'Rava (Sooji)', 'Besan (Gram Flour)', 'Rajma', 'Kabuli Chana', 'Sprouted Moong', 'Hakka Noodles', 'Pasta', 'Raw Peanuts'],
      'Spices & Condiments': ['Cumin Seeds (Jeera)', 'Mustard Seeds (Rai)', 'Turmeric Powder', 'Coriander Powder', 'Kashmiri Red Chilli', 'Garam Masala', 'Pav Bhaji Masala', 'Sambar Powder', 'Chaat Masala', 'Kasuri Methi', 'Asafoetida (Hing)', 'Ajwain', 'Salt'],
      'Meat & Seafood': ['Eggs', 'Chicken', 'Fish Fillets', 'Mutton'],
      'Oils & Sauces': ['Mustard Oil', 'Sunflower Cooking Oil', 'Extra Virgin Olive Oil', 'Soy Sauce', 'Chilli Sauce', 'Vinegar']
    };

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
