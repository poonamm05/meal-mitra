import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('mealmitra_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const demoLogin = (persona) => api.post('/auth/demo-login', { persona });
export const getMe = () => api.get('/auth/me');
export const updatePreferences = (data) => api.put('/auth/preferences', data);
export const updatePantry = (pantryItems) => api.put('/auth/pantry', { pantryItems });
export const toggleFavorite = (recipeId) => api.post(`/auth/favorites/${recipeId}`);

// Recipes
export const getRecipes = (params) => api.get('/recipes', { params });
export const getRecipeById = (id) => api.get(`/recipes/${id}`);
export const getIngredientCatalog = () => api.get('/recipes/ingredients/catalog');

// Recommendations
export const getSmartRecommendations = (data) => api.post('/recommendations/smart-decide', data);
export const getPantryCookingMatches = (data) => api.post('/recommendations/use-my-ingredients', data);
export const getSurpriseMeal = () => api.get('/recommendations/surprise-me');

// Meal Plans
export const getWeeklyPlan = () => api.get('/meal-plans/weekly');
export const autoGenerateWeeklyPlan = (data) => api.post('/meal-plans/auto-generate', data);
export const updateMealSlot = (data) => api.put('/meal-plans/update-slot', data);

// Meal History
export const logCookedMeal = (data) => api.post('/meal-history/log-cooked', data);
export const getMealHistory = () => api.get('/meal-history');
export const getRepetitionInsights = () => api.get('/meal-history/insights');

// Family Votes
export const createFamilyVote = (data) => api.post('/family-votes/create', data);
export const getUserPolls = () => api.get('/family-votes/my-polls');
export const getVoteByShareCode = (shareCode) => api.get(`/family-votes/poll/${shareCode}`);
export const castVote = (shareCode, data) => api.post(`/family-votes/poll/${shareCode}/vote`, data);
export const closePoll = (id) => api.put(`/family-votes/poll/${id}/close`);

// Grocery
export const getGroceryList = () => api.get('/groceries');
export const generateGroceryFromPlan = () => api.post('/groceries/generate-from-plan');
export const addGroceryItem = (data) => api.post('/groceries/items', data);
export const toggleGroceryItem = (itemId) => api.patch(`/groceries/items/${itemId}/toggle`);
export const deleteGroceryItem = (itemId) => api.delete(`/groceries/items/${itemId}`);

// AI Assistant
export const sendAiMessage = (data) => api.post('/ai/chat', data);
export const getConversation = () => api.get('/ai/conversation');
export const clearConversation = () => api.post('/ai/clear');

// Admin APIs (require admin role)
export const adminGetStats = () => api.get('/admin/stats');
export const adminGetRecipes = () => api.get('/admin/recipes');
export const adminUpdateRecipe = (id, data) => api.put(`/admin/recipes/${id}`, data);
export const adminDeleteRecipe = (id) => api.delete(`/admin/recipes/${id}`);
export const adminCreateRecipe = (data) => api.post('/admin/recipes', data);

export default api;
