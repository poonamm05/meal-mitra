import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Star, Sparkles, AlertCircle, ChefHat, CheckCircle2,
  Calendar, RotateCcw, Plus, Flame
} from 'lucide-react';
import { getMealHistory, getRepetitionInsights, logCookedMeal, getRecipes } from '../utils/api';

export default function MealHistoryPage() {
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick log modal / form
  const [allRecipes, setAllRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [mealType, setMealType] = useState('dinner');
  const [rating, setRating] = useState(5);
  const [userNotes, setUserNotes] = useState('');
  const [logging, setLogging] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, insRes, recRes] = await Promise.all([
        getMealHistory(),
        getRepetitionInsights(),
        getRecipes({ limit: 40 }),
      ]);
      setHistory(histRes.data.data || []);
      setInsights(insRes.data.data || null);
      setAllRecipes(recRes.data.data || []);
      if (recRes.data.data?.length > 0) {
        setSelectedRecipeId(recRes.data.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!selectedRecipeId) return;
    setLogging(true);
    try {
      await logCookedMeal({
        recipeId: selectedRecipeId,
        mealType,
        rating: Number(rating),
        userNotes,
      });
      setUserNotes('');
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Clock className="w-3.5 h-3.5" />
          Anti-Repetition & Cooking Insights
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
          Meal History & Cycle Tracker 🍳
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          MealMitra learns your household's cooking cadence to prevent dish fatigue and suggest exciting twists.
        </p>
      </div>

      {/* Analytics & Variety Score Card */}
      {insights && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-800 grid md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-5 sm:border-r border-slate-700 sm:pr-6">
            <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border-2 border-brand-500 flex flex-col items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-2xl text-brand-400">
                {insights.varietyScore || 90}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Variety Score
              </span>
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">14-Day Rotation Health</h3>
              <p className="text-xs text-slate-300 mt-1">{insights.varietyTip}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Most Cooked Dishes Recently
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(insights.frequentDishes || []).slice(0, 3).map((d) => (
                <span
                  key={d.name}
                  className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-medium text-amber-200"
                >
                  {d.name} ({d.count}x)
                </span>
              ))}
              {(!insights.frequentDishes || insights.frequentDishes.length === 0) && (
                <span className="text-xs text-slate-400 italic">No repeats logged yet</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Top Kitchen Ingredients Used
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(insights.frequentIngredients || []).slice(0, 4).map((ing) => (
                <span
                  key={ing.name}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-xs font-medium text-emerald-300"
                >
                  {ing.name} ({ing.count})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Log Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <h3 className="font-display font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-500" />
          Log a Cooked Meal to Update History
        </h3>

        <form onSubmit={handleLogMeal} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(e.target.value)}
            className="sm:col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
          >
            {allRecipes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} ({r.cuisine})
              </option>
            ))}
          </select>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none capitalize"
          >
            {['dinner', 'lunch', 'breakfast', 'snack'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={logging}
            className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors shadow-glow flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> {logging ? 'Logging...' : 'Log as Cooked'}
          </button>
        </form>
      </div>

      {/* History Feed */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-slate-800">Cooked Meals Timeline</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => {
              const r = item.recipe;
              const dateStr = new Date(item.cookedAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-soft hover:shadow-card transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                      src={r?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'}
                      alt={r?.name || 'Meal'}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          {item.mealType}
                        </span>
                        <span className="text-xs text-slate-400">{dateStr}</span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-800 truncate">
                        {r?.name || 'Home Cooked Special'}
                      </h4>
                      <p className="text-xs text-slate-500">{r?.cuisine} • {item.servingsPrepared || 2} Servings</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{item.rating || 5}.0</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 mb-1">No meals logged yet</h3>
            <p className="text-xs text-slate-500">
              As you cook meals from recommendations, log them here to help MealMitra optimize your weekly rotation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
