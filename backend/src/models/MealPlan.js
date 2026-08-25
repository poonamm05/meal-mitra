import mongoose from 'mongoose';

const dayPlanSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
    },
    breakfast: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    snacks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'My Weekly Meal Plan',
    },
    weekStartDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    days: [dayPlanSchema],
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export default MealPlan;
