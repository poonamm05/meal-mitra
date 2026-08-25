import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays, Sparkles, RotateCcw, Clock,
  CheckCircle2, Plus, X, Search, ChevronRight
} from 'lucide-react';
import {
  getWeeklyPlan,
  autoGenerateWeeklyPlan,
  updateMealSlot,
  getRecipes
} from '../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlannerPage() {
  const { user } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Swap Modal State
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState({ dayOfWeek: '', mealType: '' });
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipeSearch, setRecipeSearch] = useState('');

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await getWeeklyPlan();
      setPlan(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    getRecipes({ limit: 40 }).then((res) => setAllRecipes(res.data.data || []));
  }, []);

  const handleAutoPlan = async () => {
    setGenerating(true);
    try {
      const res = await autoGenerateWeeklyPlan({ dietaryPreference: user?.dietaryPreference || 'vegetarian' });
      setPlan(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenSwap = (dayOfWeek, mealType) => {
    setSwapTarget({ dayOfWeek, mealType });
    setSwapModalOpen(true);
  };

  const handleSelectSwapRecipe = async (recipeId) => {
    try {
      const res = await updateMealSlot({
        dayOfWeek: swapTarget.dayOfWeek,
        mealType: swapTarget.mealType,
        recipeId,
      });
      setPlan(res.data.data);
      setSwapModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            7-Day Balanced Rotation
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            Weekly Meal Planner 📅
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Automate your week's meals with balanced nutrition and variety. Never ask "what to cook" daily.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAutoPlan}
            disabled={generating}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-brand-500 text-white font-bold text-sm shadow-glow hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Balancing Rotation...' : 'AI Auto-Plan My Week ✨'}
          </button>
        </div>
      </div>

      {/* 7-Day Meal Matrix Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-3xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(plan?.days || []).map((day) => (
            <div
              key={day.dayOfWeek}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft hover:shadow-card transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Day Label Column */}
                <div className="lg:w-36 flex-shrink-0">
                  <div className="font-display font-bold text-lg text-slate-800">{day.dayOfWeek}</div>
                  <span className="text-xs text-slate-400 font-medium">3 Curated Meals</span>
                </div>

                {/* 3 Meal Slots: Breakfast, Lunch, Dinner */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Breakfast Slot */}
                  <MealSlotCard
                    slotName="Breakfast"
                    recipe={day.breakfast}
                    onSwap={() => handleOpenSwap(day.dayOfWeek, 'breakfast')}
                  />

                  {/* Lunch Slot */}
                  <MealSlotCard
                    slotName="Lunch"
                    recipe={day.lunch}
                    onSwap={() => handleOpenSwap(day.dayOfWeek, 'lunch')}
                  />

                  {/* Dinner Slot */}
                  <MealSlotCard
                    slotName="Dinner"
                    recipe={day.dinner}
                    onSwap={() => handleOpenSwap(day.dayOfWeek, 'dinner')}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Swap Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSwapModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col z-10 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800">
                  Choose Replacement for {swapTarget.dayOfWeek} {swapTarget.mealType?.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500">Pick any recipe from your catalog to swap</p>
              </div>
              <button
                onClick={() => setSwapModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="Search recipes (e.g. Palak Paneer, Poha)..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allRecipes
                .filter((r) => r.name.toLowerCase().includes(recipeSearch.toLowerCase()))
                .map((r) => (
                  <div
                    key={r._id}
                    onClick={() => handleSelectSwapRecipe(r._id)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 cursor-pointer flex items-center gap-3 transition-all"
                  >
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{r.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{r.cuisine}</span>
                        <span>•</span>
                        <span>{(r.prepTime || 0) + (r.cookTime || 0)}m</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-brand-500 text-white rounded-xl text-xs font-semibold">
                      Select
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MealSlotCard({ slotName, recipe, onSwap }) {
  if (!recipe) {
    return (
      <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{slotName} (Empty)</span>
        <button
          onClick={onSwap}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-colors group">
      <Link to={`/recipes/${recipe._id}`} className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            {slotName}
          </span>
          <h4 className="font-bold text-xs text-slate-800 truncate group-hover:text-brand-600 transition-colors">
            {recipe.name}
          </h4>
          <span className="text-[11px] text-slate-500">
            {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m total
          </span>
        </div>
      </Link>

      <button
        onClick={onSwap}
        title="Swap Meal"
        className="p-2 rounded-xl bg-white shadow-xs border border-slate-200 hover:border-brand-400 hover:text-brand-600 text-slate-400 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
