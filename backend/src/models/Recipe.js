import mongoose from 'mongoose';

const ingredientItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'item' },
    isPantryStaple: { type: Boolean, default: false }, // salt, oil, turmeric, etc.
    category: {
      type: String,
      enum: ['Vegetables', 'Dairy', 'Grains & Pulses', 'Spices & Condiments', 'Meat & Seafood', 'Bakery', 'Oils & Sauces', 'Other'],
      default: 'Vegetables',
    },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    mealType: {
      type: [String],
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
      index: true,
    },
    prepTime: {
      type: Number, // in minutes
      required: true,
    },
    cookTime: {
      type: Number, // in minutes
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    servingSize: {
      type: Number,
      default: 2,
    },
    nutrition: {
      calories: { type: Number, default: 350 },
      protein: { type: Number, default: 12 }, // grams
      carbs: { type: Number, default: 45 }, // grams
      fat: { type: Number, default: 10 }, // grams
      fiber: { type: Number, default: 6 },
    },
    dietaryFlags: {
      type: [String],
      enum: [
        'vegetarian',
        'non-vegetarian',
        'vegan',
        'eggetarian',
        'jain',
        'gluten-free',
        'high-protein',
        'quick-meal',
        'low-calorie',
        'healthy',
      ],
      default: ['vegetarian'],
    },
    ingredients: [ingredientItemSchema],
    instructions: {
      type: [String],
      required: true,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    defaultDecisionTip: {
      type: String,
      default: 'Balanced comfort meal that comes together quickly with kitchen staples.',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual total time
recipeSchema.virtual('totalTime').get(function () {
  return (this.prepTime || 0) + (this.cookTime || 0);
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
