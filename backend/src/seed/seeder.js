import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { sampleRecipes } from './recipesData.js';


export const ensureUsersExist = async () => {
  try {
    // Ensure Admin account exists with Admin@1234
    const adminExists = await User.findOne({ email: 'admin@mealmitra.com' });
    if (!adminExists) {
      await User.create({
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
      });
      console.log('✅ Created Admin user: admin@mealmitra.com / Admin@1234');
    }

    // Demo users setup
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
      }
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`✅ Created demo user: ${u.email}`);
      }
    }
  } catch (err) {
    console.warn('User setup warning:', err.message);
  }
};

export const seedDatabase = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.log('Skipping DB seeding because MongoDB is offline.');
      return;
    }

    console.log('🌱 Seeding initial recipes into empty database...');
    const insertedRecipes = await Recipe.insertMany(sampleRecipes);
    console.log(`✅ Seeded ${insertedRecipes.length} recipes successfully!`);

    await ensureUsersExist();
    console.log('✨ Database Seeding Complete!');
    return { success: true, count: insertedRecipes.length };
  } catch (err) {
    console.error('Error during database seeding:', err);
    throw err;
  }
};

// If run directly via node seeder.js
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  seedDatabase().then(() => mongoose.disconnect());
}
