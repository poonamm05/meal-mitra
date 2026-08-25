import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    persona: {
      type: String,
      enum: ['bachelor', 'homemaker', 'working_professional', 'student', 'family', 'custom'],
      default: 'custom',
    },
    householdSize: {
      type: Number,
      default: 2,
      min: 1,
      max: 20,
    },
    dietaryPreference: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'eggetarian', 'jain', 'gluten-free'],
      default: 'vegetarian',
    },
    cuisinePreferences: {
      type: [String],
      default: ['North Indian', 'South Indian', 'Continental', 'Indo-Chinese'],
    },
    dislikedIngredients: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    defaultMaxCookingTime: {
      type: Number,
      default: 45, // in minutes
    },
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
      default: 'Medium',
    },
    pantryItems: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'General' },
        quantity: { type: String, default: 'In Stock' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
