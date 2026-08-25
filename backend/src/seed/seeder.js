import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { sampleRecipes } from './recipesData.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.log('Skipping DB seeding because MongoDB is offline.');
      return;
    }

    console.log('🌱 Starting DB Seeder with refreshed recipes & photos...');

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('Cleared existing recipes.');

    // Insert sample recipes
    const insertedRecipes = await Recipe.insertMany(sampleRecipes);
    console.log(`✅ Seeded ${insertedRecipes.length} recipes successfully!`);

    // Check if demo users exist or create them
    const demoUsers = [
      {
        name: 'Rohit Sharma',
        email: 'bachelor@mealmitra.com',
        password: 'password123',
        persona: 'bachelor',
        householdSize: 1,
        dietaryPreference: 'vegetarian',
        cuisinePreferences: ['North Indian', 'Indo-Chinese'],
        defaultMaxCookingTime: 25,
        pantryItems: [
          { name: 'Potato', category: 'Vegetables', quantity: '1 kg' },
          { name: 'Onion', category: 'Vegetables', quantity: '1 kg' },
          { name: 'Tomato', category: 'Vegetables', quantity: '500 g' },
          { name: 'Rice', category: 'Grains & Pulses', quantity: '2 kg' },
          { name: 'Toor Dal', category: 'Grains & Pulses', quantity: '1 kg' },
          { name: 'Atta', category: 'Grains & Pulses', quantity: '5 kg' },
          { name: 'Eggs', category: 'Meat & Seafood', quantity: '6 pieces' },
        ],
        favoriteRecipes: [insertedRecipes[0]._id, insertedRecipes[2]._id]
      },
      {
        name: 'Priya & Anand Verma',
        email: 'family@mealmitra.com',
        password: 'password123',
        persona: 'family',
        householdSize: 4,
        dietaryPreference: 'vegetarian',
        cuisinePreferences: ['North Indian', 'South Indian', 'Gujarati'],
        defaultMaxCookingTime: 45,
        pantryItems: [
          { name: 'Potato', category: 'Vegetables', quantity: '3 kg' },
          { name: 'Onion', category: 'Vegetables', quantity: '2 kg' },
          { name: 'Tomato', category: 'Vegetables', quantity: '2 kg' },
          { name: 'Paneer', category: 'Dairy', quantity: '500 g' },
          { name: 'Basmati Rice', category: 'Grains & Pulses', quantity: '5 kg' },
          { name: 'Toor Dal', category: 'Grains & Pulses', quantity: '2 kg' },
          { name: 'Moong Dal', category: 'Grains & Pulses', quantity: '1 kg' },
          { name: 'Ghee', category: 'Dairy', quantity: '1 kg' },
          { name: 'Atta', category: 'Grains & Pulses', quantity: '10 kg' }
        ],
        favoriteRecipes: [insertedRecipes[1]._id, insertedRecipes[4]._id, insertedRecipes[7]._id]
      },
      {
        name: 'Sneha Patel',
        email: 'workingpro@mealmitra.com',
        password: 'password123',
        persona: 'working_professional',
        householdSize: 2,
        dietaryPreference: 'vegetarian',
        cuisinePreferences: ['North Indian', 'Continental', 'South Indian'],
        defaultMaxCookingTime: 30,
        pantryItems: [
          { name: 'Paneer', category: 'Dairy', quantity: '250 g' },
          { name: 'Spinach', category: 'Vegetables', quantity: '1 bunch' },
          { name: 'Eggs', category: 'Meat & Seafood', quantity: '6 pcs' },
          { name: 'Sprouts', category: 'Grains & Pulses', quantity: '250 g' },
          { name: 'Pasta', category: 'Grains & Pulses', quantity: '500 g' },
          { name: 'Olive Oil', category: 'Oils & Sauces', quantity: '500 ml' }
        ],
        favoriteRecipes: [insertedRecipes[2]._id, insertedRecipes[9]._id, insertedRecipes[13]._id]
      },
      {
        name: 'MealMitra Admin',
        email: 'admin@mealmitra.com',
        password: 'Admin@1234',
        role: 'admin',
        persona: 'custom',
        householdSize: 1,
        dietaryPreference: 'vegetarian',
        cuisinePreferences: ['North Indian', 'South Indian', 'Continental'],
        defaultMaxCookingTime: 60,
        pantryItems: []
      }
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created user: ${u.email} [role: ${u.role || 'user'}]`);
      } else if (u.role === 'admin') {
        // Always ensure admin has the correct role even if account exists
        await User.findOneAndUpdate({ email: u.email }, { role: 'admin' });
        console.log(`Ensured admin role for: ${u.email}`);
      }
    }

    console.log('✨ Database Seeding Complete!');
  } catch (err) {
    console.error('Error during database seeding:', err);
  }
};

// If run directly via node seeder.js
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  seedDatabase().then(() => mongoose.disconnect());
}
