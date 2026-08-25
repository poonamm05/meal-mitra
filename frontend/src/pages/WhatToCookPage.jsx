import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed, Clock, Users, Sparkles, Filter,
  ArrowRight, RotateCcw, X, Plus, CheckCircle2, Zap, ChefHat
} from 'lucide-react';
import { getSmartRecommendations, getSurpriseMeal, logCookedMeal } from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import SurpriseMeModal from '../components/SurpriseMeModal';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snack / Tea', icon: '🫖' },
];

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🥦 Vegetarian' },
  { id: 'eggetarian', label: '🥚 Eggetarian' },
  { id: 'non-vegetarian', label: '🍗 Non-Veg' },
  { id: 'vegan', label: '🌱 Vegan' },
  { id: 'jain', label: '🌿 Jain' },
];

const CUISINES = ['any', 'North Indian', 'South Indian', 'Continental', 'Indo-Chinese', 'Gujarati', 'Maharashtrian'];

const FILTER_TAGS = ['quick-meal', 'high-protein', 'healthy', 'low-calorie'];

export default function WhatToCookPage() {
  const { user } = useAuth();

  // Filter Form State (No budget)
  const [mealType, setMealType] = useState('dinner');
  const [servingSize, setServingSize] = useState(user?.householdSize || 2);
  const [maxCookingTime, setMaxCookingTime] = useState(user?.defaultMaxCookingTime || 35);
  const [dietaryPreference, setDietaryPreference] = useState(user?.dietaryPreference || 'vegetarian');
  const [cuisine, setCuisine] = useState('any');
  const [filterTags, setFilterTags] = useState([]);

  // Tag inputs for available ingredients
  const [ingredientInput, setIngredientInput] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState(() => {
    return (user?.pantryItems || []).slice(0, 4).map((p) => p.name);
  });

  // Results state
  const [recommendations, setRecommendations] = useState([]);
  const [topPick, setTopPick] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Surprise modal
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [surpriseRecipe, setSurpriseRecipe] = useState(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);

  const addIngredientTag = () => {
    if (ingredientInput.trim() && !availableIngredients.includes(ingredientInput.trim())) {
      setAvailableIngredients([...availableIngredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredientTag = (name) => {
    setAvailableIngredients(availableIngredients.filter((i) => i !== name));
  };

  const toggleFilterTag = (tag) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  const handleDecide = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await getSmartRecommendations({
        availableIngredients,
        mealType,
        servingSize: Number(servingSize),
        maxCookingTime: Number(maxCookingTime),
        dietaryPreference,
        cuisine,
        filterTags,
      });

      const recs = res.data.data || [];
      setRecommendations(recs);
      setTopPick(recs[0] || null);

      // Scroll to results on mobile
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      await logCookedMeal({ recipeId: recipe._id, mealType, rating: 5 });
      alert(`🎉 Awesome! Logged "${recipe.name}" as cooked. Enjoy your meal!`);
    } catch (e) {
      console.error(e);
    }
  };

  // Run initial decision on mount
  useEffect(() => {
    handleDecide();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Decision Intelligence Engine
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">What Should I Cook? 🍳</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tell MealMitra your ingredients & time limit — we calculate the best dishes for you right now.
          </p>
        </div>

        <button
          onClick={handleOpenSurprise}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-brand-500 text-white font-bold text-sm shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Surprise Me Instead!
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form / Filter Wizard Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-500" />
                Cooking Parameters
              </h2>
              <button
                type="button"
                onClick={() => {
                  setAvailableIngredients([]);
                  setCuisine('any');
                  setFilterTags([]);
                }}
                className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <form onSubmit={handleDecide} className="space-y-5">
              {/* 1. Meal Type */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                  1. Meal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MEAL_TYPES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMealType(m.id)}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                        mealType === m.id
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Available Ingredients at Home */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                  2. Ingredients at Home (Pantry)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addIngredientTag();
                      }
                    }}
                    placeholder="e.g. Potato, Paneer, Tomato"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addIngredientTag}
                    className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                  {availableIngredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      {ing}
                      <button
                        type="button"
                        onClick={() => removeIngredientTag(ing)}
                        className="text-emerald-500 hover:text-emerald-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {availableIngredients.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No specific ingredients selected</span>
                  )}
                </div>
              </div>

              {/* 3. People & Time Limit Sliders */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">3. Servings</span>
                    <span className="font-bold text-brand-600">{servingSize} People</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">Max Prep + Cook Time</span>
                    <span className="font-bold text-brand-600">{maxCookingTime} Mins</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={maxCookingTime}
                    onChange={(e) => setMaxCookingTime(e.target.value)}
                    className="w-full accent-brand-500"
                  />
                </div>
              </div>

              {/* 4. Dietary & Cuisine */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                  Diet & Cuisine
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    {DIETARY_OPTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white capitalize"
                  >
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'any' ? 'Any Cuisine' : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5. Filter Tag Chips */}
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_TAGS.map((t) => {
                    const active = filterTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleFilterTag(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                          active
                            ? 'bg-slate-800 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.replace('-', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-bold text-base shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Analyzing Recipes...' : 'Decide What to Cook! 🍳'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Results Panel */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Top Recommendation Highlight Card */}
          {topPick && !loading && (
            <div className="bg-white rounded-3xl border-2 border-brand-500 p-6 sm:p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-extrabold px-5 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Tonight's #1 Recommendation
              </div>

              <div className="grid sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden shadow-md h-52 sm:h-56">
                    <img
                      src={topPick.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                      alt={topPick.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {topPick.matchPercentage}% Match
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-3">
                  <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                    {topPick.cuisine} • {mealType}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900 leading-tight">
                    {topPick.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{topPick.description}</p>

                  {/* Stats Bar (No price) */}
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 py-1">
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-brand-500" /> {topPick.totalTime} mins
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <Users className="w-3.5 h-3.5 text-blue-500" /> {servingSize} Servings
                    </span>
                  </div>

                  {/* Rationale bullet points */}
                  <div className="space-y-1 pt-1">
                    {(topPick.rationale || []).map((point, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-emeraldChef-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emeraldChef-500 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleQuickCook(topPick)}
                      className="px-4 py-2.5 rounded-xl bg-emeraldChef-600 text-white text-xs font-bold hover:bg-emeraldChef-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cook This Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Ranked Recommendations Header */}
          <div>
            <h3 className="font-display font-bold text-xl text-slate-800 mb-1">
              Alternative Matches for {mealType.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ranked dynamically by ingredient overlap, prep speed, and meal variety
            </p>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 h-72 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendations.slice(1).map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    showScore={true}
                    onCook={handleQuickCook}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 mb-1">No recipes match all strict constraints</h4>
                <p className="text-xs text-slate-500 mb-4">Try relaxing max time or adding more pantry items.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Surprise Me Modal */}
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
