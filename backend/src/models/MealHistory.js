import mongoose from 'mongoose';

const mealHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    cookedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    servingsPrepared: {
      type: Number,
      default: 2,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    feedback: {
      type: String,
      enum: ['loved_it', 'good', 'too_spicy', 'took_too_long', 'ingredients_missing', 'average'],
      default: 'loved_it',
    },
    userNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MealHistory = mongoose.model('MealHistory', mealHistorySchema);
export default MealHistory;
