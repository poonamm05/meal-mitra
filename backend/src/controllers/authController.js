import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mealmitra_secret_jwt_key_super_secure_2026', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, persona, householdSize, dietaryPreference, defaultMaxCookingTime, defaultBudgetPerMeal } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      persona: persona || 'custom',
      householdSize: householdSize || 2,
      dietaryPreference: dietaryPreference || 'vegetarian',
      defaultMaxCookingTime: defaultMaxCookingTime || 45,
      defaultBudgetPerMeal: defaultBudgetPerMeal || 250,
      pantryItems: [
        { name: 'Salt', category: 'Spices & Condiments', quantity: 'In Stock' },
        { name: 'Turmeric Powder', category: 'Spices & Condiments', quantity: 'In Stock' },
        { name: 'Cooking Oil', category: 'Oils & Sauces', quantity: 'In Stock' },
        { name: 'Cumin Seeds', category: 'Spices & Condiments', quantity: 'In Stock' },
        { name: 'Potato', category: 'Vegetables', quantity: '1 kg' },
        { name: 'Onion', category: 'Vegetables', quantity: '1 kg' },
      ],
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        persona: user.persona,
        householdSize: user.householdSize,
        dietaryPreference: user.dietaryPreference,
        cuisinePreferences: user.cuisinePreferences,
        defaultMaxCookingTime: user.defaultMaxCookingTime,
        defaultBudgetPerMeal: user.defaultBudgetPerMeal,
        pantryItems: user.pantryItems,
        favoriteRecipes: user.favoriteRecipes,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          persona: user.persona,
          householdSize: user.householdSize,
          dietaryPreference: user.dietaryPreference,
          cuisinePreferences: user.cuisinePreferences,
          dislikedIngredients: user.dislikedIngredients,
          defaultMaxCookingTime: user.defaultMaxCookingTime,
          defaultBudgetPerMeal: user.defaultBudgetPerMeal,
          pantryItems: user.pantryItems,
          favoriteRecipes: user.favoriteRecipes,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const { persona = 'bachelor' } = req.body;
    let email = 'bachelor@mealmitra.com';
    let defaultName = 'Rohit Sharma';
    let defaultHousehold = 1;
    let defaultDiet = 'vegetarian';
    let defaultTime = 25;
    let defaultBudget = 120;

    if (persona === 'family') {
      email = 'family@mealmitra.com';
      defaultName = 'Priya & Anand Verma';
      defaultHousehold = 4;
      defaultDiet = 'vegetarian';
      defaultTime = 45;
      defaultBudget = 300;
    } else if (persona === 'working_professional') {
      email = 'workingpro@mealmitra.com';
      defaultName = 'Sneha Patel';
      defaultHousehold = 2;
      defaultDiet = 'vegetarian';
      defaultTime = 30;
      defaultBudget = 200;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: defaultName,
        email,
        password: 'password123',
        persona,
        householdSize: defaultHousehold,
        dietaryPreference: defaultDiet,
        defaultMaxCookingTime: defaultTime,
        defaultBudgetPerMeal: defaultBudget,
        pantryItems: [
          { name: 'Potato', category: 'Vegetables', quantity: '1 kg' },
          { name: 'Onion', category: 'Vegetables', quantity: '1 kg' },
          { name: 'Tomato', category: 'Vegetables', quantity: '500 g' },
          { name: 'Rice', category: 'Grains & Pulses', quantity: '2 kg' },
          { name: 'Ghee', category: 'Dairy', quantity: '500 g' },
          { name: 'Atta', category: 'Grains & Pulses', quantity: '5 kg' },
        ],
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        persona: user.persona,
        householdSize: user.householdSize,
        dietaryPreference: user.dietaryPreference,
        cuisinePreferences: user.cuisinePreferences,
        dislikedIngredients: user.dislikedIngredients,
        defaultMaxCookingTime: user.defaultMaxCookingTime,
        defaultBudgetPerMeal: user.defaultBudgetPerMeal,
        pantryItems: user.pantryItems,
        favoriteRecipes: user.favoriteRecipes,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriteRecipes');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const fields = [
      'name',
      'householdSize',
      'dietaryPreference',
      'cuisinePreferences',
      'dislikedIngredients',
      'allergies',
      'defaultMaxCookingTime',
      'defaultBudgetPerMeal',
      'spiceLevel',
      'persona',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    const updatedUser = await user.save();
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePantry = async (req, res) => {
  try {
    const { pantryItems } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.pantryItems = pantryItems;
    await user.save();

    res.json({ success: true, data: user.pantryItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const index = user.favoriteRecipes.indexOf(recipeId);
    let isFavorite = false;
    if (index > -1) {
      user.favoriteRecipes.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoriteRecipes.push(recipeId);
      isFavorite = true;
    }

    await user.save();
    res.json({ success: true, isFavorite, favoriteRecipes: user.favoriteRecipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
