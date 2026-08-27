import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import Recipe from './models/Recipe.js';
import { seedDatabase } from './seed/seeder.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import mealHistoryRoutes from './routes/mealHistoryRoutes.js';
import familyVoteRoutes from './routes/familyVoteRoutes.js';
import groceryRoutes from './routes/groceryRoutes.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Bulletproof CORS Middleware for cross-origin browser requests
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Immediate response for browser preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/meal-history', mealHistoryRoutes);
app.use('/api/family-votes', familyVoteRoutes);
app.use('/api/groceries', groceryRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MealMitra Backend API',
    status: 'online',
    message: 'Welcome to MealMitra API 🍳',
    health: '/api/health',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MealMitra API is running smoothly 🚀',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Public catalog sync endpoint to refresh photos & admin credentials on demand
app.get('/api/sync-catalog', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json({
      success: true,
      message: '✅ Database recipes, photos, and admin credentials synchronized successfully!',
      details: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server immediately and connect Database in parallel
const server = app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🍳 MealMitra Backend Server Running on Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini AI Live' : 'Intelligent Heuristic Engine'}`);
  console.log(`==============================================\n`);
});

// Attempt database connection & seeding asynchronously
connectDB().then(async (isConnected) => {
  if (isConnected) {
    try {
      console.log('🔄 Synchronizing recipes, accurate dish photos, and admin credentials...');
      await seedDatabase();
    } catch (e) {
      console.warn('Seeding check warning:', e.message);
    }
  }
});
