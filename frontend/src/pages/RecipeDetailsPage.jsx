import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Clock, Users, ChefHat, Star, Heart, ArrowLeft,
  CheckCircle2, Play, AlertCircle, Languages, Sparkles
} from 'lucide-react';
import { getRecipeById, logCookedMeal, toggleFavorite } from '../utils/api';
import { getHindiRecipe, hindiUILabels } from '../utils/hindiRecipes';
import RecipeCard from '../components/RecipeCard';
import CookingModeModal from '../components/CookingModeModal';

export default function RecipeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Language state: 'en' | 'hi'
  const [language, setLanguage] = useState('en');

  // Scaled serving
  const [servings, setServings] = useState(2);

  // Modal
  const [cookingModalOpen, setCookingModalOpen] = useState(false);
  const [cookedSuccess, setCookedSuccess] = useState(false);

  // Favorite state
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await getRecipeById(id);
        const data = res.data.data;
        setRecipe(data);
        setServings(data.servingSize || 2);
        setSimilar(res.data.similar || []);

        if (user && user.favoriteRecipes) {
          setFav(user.favoriteRecipes.some((fId) => fId === data._id || fId?._id === data._id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center animate-pulse">
        <div className="h-80 bg-slate-200 rounded-3xl mb-6" />
        <div className="h-10 bg-slate-200 rounded-xl w-2/3 mx-auto mb-4" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Recipe not found</h2>
        <Link to="/decide" className="text-brand-600 text-sm mt-3 inline-block font-semibold">
          ← Back to Decisions
        </Link>
      </div>
    );
  }

  const isHindi = language === 'hi';
  const hindiData = isHindi ? getHindiRecipe(recipe) : null;

  const displayName = isHindi && hindiData ? hindiData.name : recipe.name;
  const displayDescription = isHindi && hindiData ? hindiData.description : recipe.description;
  const displayCuisine = isHindi && hindiData ? hindiData.cuisine : recipe.cuisine;
  const displayDifficulty = isHindi && hindiData ? hindiData.difficulty : recipe.difficulty;
  const displayInstructions = isHindi && hindiData && hindiData.instructions?.length > 0 ? hindiData.instructions : recipe.instructions || [];

  const baseServings = recipe.servingSize || 2;
  const scaleRatio = servings / baseServings;

  const pantryNames = (user?.pantryItems || []).map((p) => p.name.toLowerCase());

  const rawIngredients = isHindi && hindiData && hindiData.ingredients?.length > 0 ? hindiData.ingredients : recipe.ingredients || [];

  const availableIngredients = [];
  const missingIngredients = [];

  rawIngredients.forEach((ing, idx) => {
    const originalIng = (recipe.ingredients || [])[idx] || ing;
    const isPantry = originalIng.isPantryStaple || pantryNames.some((pn) => pn.includes(originalIng.name.toLowerCase()) || originalIng.name.toLowerCase().includes(pn));
    const scaledQuantity = Math.round((ing.quantity * scaleRatio) * 10) / 10;
    const item = { ...ing, quantity: scaledQuantity };

    if (isPantry) {
      availableIngredients.push(item);
    } else {
      missingIngredients.push(item);
    }
  });

  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      const res = await toggleFavorite(recipe._id);
      setFav(res.data.isFavorite);
    } catch (e) {
      setFav(!fav);
    }
  };

  const handleLogCooked = async () => {
    try {
      await logCookedMeal({
        recipeId: recipe._id,
        mealType: (recipe.mealType && recipe.mealType[0]) || 'dinner',
        servingsPrepared: servings,
        rating: 5,
      });
      setCookedSuccess(true);
      setTimeout(() => setCookedSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar: Back Button & Language Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {isHindi ? hindiUILabels.back : 'Back'}
        </button>

        {/* Language Selector Pill */}
        <div className="inline-flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-soft gap-1">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              language === 'en'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              language === 'hi'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇮🇳 हिंदी
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-card border border-slate-100 bg-slate-900 text-white">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80'}
            alt={displayName}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {user && (
              <button
                onClick={handleFavoriteToggle}
                className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:scale-110 transition-transform"
              >
                <Heart className={`w-5 h-5 ${fav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </button>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider">
                {displayCuisine}
              </span>
              {(recipe.dietaryFlags || []).map((flag) => (
                <span
                  key={flag}
                  className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium capitalize"
                >
                  {flag.replace('-', ' ')}
                </span>
              ))}
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
              {displayName}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">{displayDescription}</p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-950/90 text-center py-4 px-6">
          <div className="py-2">
            <div className="text-xs text-slate-400">{isHindi ? hindiUILabels.totalTime : 'Total Time'}</div>
            <div className="font-display font-bold text-lg text-brand-400">
              {(recipe.prepTime || 0) + (recipe.cookTime || 0)} {isHindi ? 'मिनट' : 'mins'}
            </div>
          </div>
          <div className="py-2">
            <div className="text-xs text-slate-400">{isHindi ? hindiUILabels.difficulty : 'Difficulty'}</div>
            <div className="font-display font-bold text-lg text-amber-400">{displayDifficulty}</div>
          </div>
          <div className="py-2">
            <div className="text-xs text-slate-400">{isHindi ? hindiUILabels.rating : 'Rating'}</div>
            <div className="font-display font-bold text-lg text-curryGold-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-curryGold-400 text-curryGold-400" />
              {(recipe.rating || 4.8).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Servings & Ingredients */}
        <div className="lg:col-span-5 space-y-6">
          {/* Servings Scaler Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  {isHindi ? hindiUILabels.servingCalc : 'Serving Calculator'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHindi ? hindiUILabels.servingDesc : 'Auto-scales ingredient proportions'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-50"
                >
                  -
                </button>
                <span className="font-bold text-sm text-slate-800 px-1">
                  {servings} {isHindi ? 'लोग' : 'Servings'}
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-800">
                {isHindi ? hindiUILabels.ingredients : 'Ingredients'}
              </h3>
              <span className="text-xs text-slate-400">
                {rawIngredients.length} {isHindi ? 'कुल' : 'total'}
              </span>
            </div>

            {/* In Pantry List */}
            {availableIngredients.length > 0 && (
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isHindi ? hindiUILabels.inKitchen : 'In Your Kitchen'} ({availableIngredients.length})
                </div>
                <div className="space-y-1.5">
                  {availableIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-50/60 text-xs flex items-center justify-between text-slate-700"
                    >
                      <span className="font-medium">{ing.name}</span>
                      <span className="font-bold text-emerald-800">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Ingredients List */}
            {missingIngredients.length > 0 && (
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {isHindi ? hindiUILabels.needToBuy : 'Additional Items'} ({missingIngredients.length})
                </div>
                <div className="space-y-1.5">
                  {missingIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-amber-50/60 text-xs flex items-center justify-between text-slate-700"
                    >
                      <span className="font-medium">{ing.name}</span>
                      <span className="font-bold text-amber-800">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nutrition Panel */}
          {recipe.nutrition && (
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
              <h3 className="font-display font-bold text-sm text-slate-800 mb-3">
                {isHindi ? hindiUILabels.nutritionTitle : 'Nutrition per Serving'}
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl shadow-xs">
                  <div className="text-slate-400 text-[10px]">{isHindi ? hindiUILabels.calories : 'Calories'}</div>
                  <div className="font-bold text-slate-800">{recipe.nutrition.calories}</div>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-xs">
                  <div className="text-slate-400 text-[10px]">{isHindi ? hindiUILabels.protein : 'Protein'}</div>
                  <div className="font-bold text-emerald-600">{recipe.nutrition.protein}g</div>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-xs">
                  <div className="text-slate-400 text-[10px]">{isHindi ? hindiUILabels.carbs : 'Carbs'}</div>
                  <div className="font-bold text-slate-800">{recipe.nutrition.carbs}g</div>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-xs">
                  <div className="text-slate-400 text-[10px]">{isHindi ? hindiUILabels.fat : 'Fat'}</div>
                  <div className="font-bold text-slate-800">{recipe.nutrition.fat}g</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Step by Step Instructions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-800">
                  {isHindi ? hindiUILabels.instructions : 'Step-by-Step Instructions'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHindi ? hindiUILabels.followAlong : 'Follow along to cook this meal'}
                </p>
              </div>

              <button
                onClick={() => setCookingModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-all shadow-glow flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> {isHindi ? hindiUILabels.cookingMode : 'Start Cooking Mode'}
              </button>
            </div>

            {/* Instructions List */}
            <div className="space-y-4">
              {displayInstructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-display font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {/* Cooked Today Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {isHindi ? 'क्या आपने यह बना लिया? भोजन इतिहास में दर्ज करें।' : 'Finished this meal? Log it in your history to prevent repetition.'}
              </span>
              <button
                onClick={handleLogCooked}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emeraldChef-600 text-white text-xs font-bold hover:bg-emeraldChef-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> {isHindi ? hindiUILabels.markCooked : 'Mark Cooked Today'}
              </button>
            </div>

            {cookedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold text-center animate-fade-in">
                {isHindi ? hindiUILabels.cookedSuccess : '🎉 Logged in your meal history! Your weekly rotation is updated.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Dishes Section */}
      {similar.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h3 className="font-display font-bold text-xl text-slate-800 mb-4">
            {isHindi ? hindiUILabels.moreSuggestions : `More ${recipe.cuisine} Suggestions`}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similar.map((r) => (
              <RecipeCard key={r._id} recipe={r} />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Cooking Mode Modal */}
      <CookingModeModal
        isOpen={cookingModalOpen}
        onClose={() => setCookingModalOpen(false)}
        language={language}
        recipe={{
          ...recipe,
          name: displayName,
          instructions: displayInstructions,
        }}
      />
    </div>
  );
}
