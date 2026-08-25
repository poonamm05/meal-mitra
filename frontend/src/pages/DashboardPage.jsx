import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed, Refrigerator, CalendarDays, Users, Bot,
  Sparkles, Clock, ArrowRight, Star, ChefHat
} from 'lucide-react';
import { getRecipes, getMealHistory, getSurpriseMeal, logCookedMeal } from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import SurpriseMeModal from '../components/SurpriseMeModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Surprise Me Modal state
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [surpriseRecipe, setSurpriseRecipe] = useState(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);

  // Greeting
  const hour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  let mealContext = 'Breakfast';
  if (hour >= 11 && hour < 16) {
    timeGreeting = 'Good Afternoon';
    mealContext = 'Lunch';
  } else if (hour >= 16) {
    timeGreeting = 'Good Evening';
    mealContext = 'Dinner';
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recipeRes, historyRes] = await Promise.all([
          getRecipes({ limit: 6 }),
          getMealHistory().catch(() => ({ data: { data: [] } })),
        ]);
        setRecipes(recipeRes.data.data || []);
        setHistory(historyRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenSurprise = async () => {
    setSurpriseOpen(true);
    setSurpriseLoading(true);
    try {
      const res = await getSurpriseMeal();
      setSurpriseRecipe(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSurpriseLoading(false);
    }
  };

  const handleQuickCook = async (recipe) => {
    try {
      await logCookedMeal({ recipeId: recipe._id, mealType: mealContext.toLowerCase(), rating: 5 });
      alert(`Marked "${recipe.name}" as cooked today! Great choice! 🍳`);
      const hRes = await getMealHistory();
      setHistory(hRes.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const quickActions = [
    {
      title: 'Decide My Meal',
      desc: 'Smart decision wizard based on time, pantry & diet',
      icon: UtensilsCrossed,
      to: '/decide',
      color: 'bg-brand-50 text-brand-600 border-brand-200 hover:border-brand-400',
      badge: 'Smart AI',
    },
    {
      title: 'Use My Ingredients',
      desc: 'Cook with what you already have in your kitchen',
      icon: Refrigerator,
      to: '/ingredients',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
      badge: `${user?.pantryItems?.length || 6} in Pantry`,
    },
    {
      title: 'Plan My Week',
      desc: '1-Click AI 7-day personalized weekly meal rotation',
      icon: CalendarDays,
      to: '/planner',
      color: 'bg-violet-50 text-violet-600 border-violet-200 hover:border-violet-400',
      badge: 'Auto-Balanced',
    },
    {
      title: 'Ask MealMitra AI',
      desc: 'Chat with your culinary companion for instant meal ideas',
      icon: Bot,
      to: '/ai-assistant',
      color: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-400',
      badge: 'Assistant',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-500 via-brand-600 to-amber-500 p-8 sm:p-10 text-white shadow-glow">
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3">
            Hello, {user?.name?.split(' ')[0] || user?.name || 'Chef'}! 🍳
          </h1>

          <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
            Ready to solve today's cooking puzzle? Tell us what you have or let us surprise you with the best dishes.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/decide"
              className="px-6 py-3 rounded-xl bg-white text-brand-600 font-bold text-sm shadow-md hover:bg-orange-50 transition-all flex items-center gap-2 hover:scale-105"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Plan My Meal
            </Link>

            <button
              onClick={handleOpenSurprise}
              className="px-6 py-3 rounded-xl bg-slate-900/40 backdrop-blur-md text-white font-semibold text-sm border border-white/30 hover:bg-slate-900/60 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Surprise Me!
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 bottom-0 top-0 w-96 opacity-20 pointer-events-none hidden lg:flex items-center justify-center">
          <ChefHat className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-2">
            <span>What are we cooking today?</span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">Select a mode to get started</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.to}
                className={`group p-5 rounded-2xl bg-white border shadow-soft hover:shadow-card hover:-translate-y-1 transition-all flex flex-col justify-between ${action.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white shadow-sm text-slate-700">
                      {action.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-800 group-hover:text-brand-600 transition-colors mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{action.desc}</p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold mt-4 pt-3 border-t border-slate-100/80 group-hover:translate-x-1 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recommended for Today */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-800">Recommended for Your Rotation</h2>
            <p className="text-xs text-slate-500">Curated dishes matching your cooking style & preferences</p>
          </div>
          <Link to="/decide" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-72 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recipes.slice(0, 4).map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} onCook={handleQuickCook} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Meal History strip */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-500" />
              <h3 className="font-display font-bold text-lg text-slate-800">Recently Prepared Meals</h3>
            </div>
            <Link to="/history" className="text-xs font-semibold text-brand-600 hover:underline">
              View History & Analytics
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3"
              >
                <img
                  src={item.recipe?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'}
                  alt={item.recipe?.name || 'Cooked Dish'}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{item.recipe?.name || 'Meal'}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="capitalize">{item.mealType}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating || 5}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Surprise Me Modal Component */}
      <SurpriseMeModal
        isOpen={surpriseOpen}
        onClose={() => setSurpriseOpen(false)}
        recipe={surpriseRecipe}
        onSpinAgain={handleOpenSurprise}
        loading={surpriseLoading}
      />
    </div>
  );
}
