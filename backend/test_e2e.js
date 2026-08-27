import axios from 'axios';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('🧪 Starting MealMitra Full-Stack E2E Automated Verification...\n');
  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.response?.data?.message || err.message);
    }
  };

  let token = '';
  let adminToken = '';

  // 1. Health check
  await test('Backend Health API', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'ok') throw new Error('Health status not ok');
  });

  // 2. Admin Login
  await test('Admin Login (admin@mealmitra.com / Admin@1234)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mealmitra.com',
      password: 'Admin@1234',
    });
    adminToken = res.data.data.token;
    if (!adminToken) throw new Error('No admin token returned');
    if (res.data.data.role !== 'admin') throw new Error('User is not admin role');
  });

  const adminHeaders = () => ({ headers: { Authorization: `Bearer ${adminToken}` } });

  // 3. Admin Recipe Access & Photo Update
  await test('Admin Recipes API & Dish Photo Modification', async () => {
    const recipesRes = await axios.get(`${BASE_URL}/admin/recipes`, adminHeaders());
    if (!recipesRes.data.data || recipesRes.data.data.length === 0) throw new Error('No recipes for admin');
    const firstRecipe = recipesRes.data.data[0];

    // Update photo URL
    const updatedPhoto = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80';
    const updateRes = await axios.put(
      `${BASE_URL}/admin/recipes/${firstRecipe._id}`,
      { imageUrl: updatedPhoto },
      adminHeaders()
    );
    if (updateRes.data.data.imageUrl !== updatedPhoto) throw new Error('Photo was not updated');
  });

  // 4. Demo login as Regular User
  await test('Demo Login (Bachelor Persona)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/demo-login`, { persona: 'bachelor' });
    token = res.data.data.token;
    if (!token) throw new Error('No token returned');
  });

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // 5. Recipes catalog
  await test('Fetch Recipe Catalog & Accurate Ingredients', async () => {
    const res = await axios.get(`${BASE_URL}/recipes`);
    if (res.data.data.length < 10) throw new Error('Recipes count too low');
    const catRes = await axios.get(`${BASE_URL}/recipes/ingredients/catalog`);
    if (!catRes.data.data.Vegetables) throw new Error('Catalog missing categories');
  });

  // 6. Smart Recommendation Engine
  await test('Smart Meal Recommendation Engine', async () => {
    const res = await axios.post(
      `${BASE_URL}/recommendations/smart-decide`,
      {
        mealType: 'dinner',
        servingSize: 4,
        maxCookingTime: 35,
        dietaryPreference: 'vegetarian',
        availableIngredients: ['Potato', 'Onion', 'Tomato'],
      },
      authHeaders()
    );
    if (!res.data.data || res.data.data.length === 0) throw new Error('No recommendations generated');
    const top = res.data.data[0];
    if (!top.rationale || top.rationale.length === 0) throw new Error('No decision rationale provided');
  });

  // 7. Pantry Matching — Only dishes containing pantry items
  await test('Pantry-First Cooking Matcher (Strict Ingredient Inclusion)', async () => {
    const res = await axios.post(
      `${BASE_URL}/recommendations/use-my-ingredients`,
      { ingredients: ['Potato'] },
      authHeaders()
    );
    if (!res.data.data.readyToCook && !res.data.data.almostReady) throw new Error('Invalid pantry response format');
    
    // Verify each returned dish actually contains Potato
    const allMatches = [...(res.data.data.readyToCook || []), ...(res.data.data.almostReady || [])];
    if (allMatches.length > 0) {
      allMatches.forEach((dish) => {
        const containsPotato = dish.ingredients?.some((ing) => ing.name.toLowerCase().includes('potato'));
        if (!containsPotato) throw new Error(`Dish "${dish.name}" returned without containing Potato!`);
      });
    }
  });

  // 8. AI Assistant Chat
  await test('AI Meal Assistant Chat & Suggestion', async () => {
    const res = await axios.post(
      `${BASE_URL}/ai/chat`,
      { message: 'I have potatoes, onions and tomatoes. What can I make in 20 minutes?' },
      authHeaders()
    );
    if (!res.data.data.reply) throw new Error('No AI reply returned');
  });

  // 9. 1-Click AI Weekly Meal Planner
  await test('AI Weekly Meal Planner Auto-Generation', async () => {
    const res = await axios.post(
      `${BASE_URL}/meal-plans/auto-generate`,
      { dietaryPreference: 'vegetarian' },
      authHeaders()
    );
    if (!res.data.data.days || res.data.data.days.length !== 7) throw new Error('Plan does not have 7 days');
  });

  // 10. Meal History Logging & Repetition Insights
  await test('Meal History Logging & Variety Score Analytics', async () => {
    const recipesRes = await axios.get(`${BASE_URL}/recipes`);
    const rId = recipesRes.data.data[0]._id;

    await axios.post(
      `${BASE_URL}/meal-history/log-cooked`,
      { recipeId: rId, mealType: 'dinner', rating: 5, feedback: 'loved_it' },
      authHeaders()
    );

    const insightsRes = await axios.get(`${BASE_URL}/meal-history/insights`, authHeaders());
    if (insightsRes.data.data.varietyScore === undefined) throw new Error('No variety score calculated');
  });

  console.log(`\n==============================================`);
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`==============================================\n`);
}

runTests();
