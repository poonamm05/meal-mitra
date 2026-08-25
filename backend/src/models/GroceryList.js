import mongoose from 'mongoose';

const groceryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Vegetables', 'Dairy', 'Grains & Pulses', 'Spices & Condiments', 'Meat & Seafood', 'Bakery', 'Oils & Sauces', 'Other'],
      default: 'Vegetables',
    },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'item' },
    isPurchased: { type: Boolean, default: false },
    isPantryAvailable: { type: Boolean, default: false },
    estimatedCost: { type: Number, default: 30 },
    recipeName: { type: String, default: '' },
    addedManually: { type: Boolean, default: false },
  },
  { _id: true }
);

const groceryListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'My Weekly Grocery List',
    },
    weekStartDate: {
      type: String,
    },
    items: [groceryItemSchema],
    totalEstimatedCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const GroceryList = mongoose.model('GroceryList', groceryListSchema);
export default GroceryList;
