import { Link } from 'react-router-dom';
import { Clock, Star, Heart, Zap, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleFavorite } from '../utils/api';
import { useState } from 'react';

const difficultyColors = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
};

const dietBadge = {
  vegetarian: { label: 'Veg', color: 'bg-green-500', dot: true },
  'non-vegetarian': { label: 'Non-Veg', color: 'bg-red-500', dot: true },
  vegan: { label: 'Vegan', color: 'bg-emerald-600', dot: true },
  eggetarian: { label: 'Egg', color: 'bg-yellow-500', dot: true },
};

export default function RecipeCard({ recipe, compact = false, onCook = null, showScore = false }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(() =>
    (user?.favoriteRecipes || []).some((id) => id === recipe._id || id?._id === recipe._id)
  );
  const [favLoading, setFavLoading] = useState(false);

  if (!recipe) return null;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const primaryDiet = recipe.dietaryFlags?.find((f) => dietBadge[f]);
  const dietInfo = primaryDiet ? dietBadge[primaryDiet] : null;
  const matchPercent = recipe.matchPercentage;
  const missing = recipe.missingIngredients || [];
  const isReady = missing.length === 0;

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setFavLoading(true);
    try {
      const res = await toggleFavorite(recipe._id);
      setFav(res.data.isFavorite);
    } catch {
      setFav((prev) => !prev);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: compact ? 160 : 200 }}>
        <img
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'; }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {dietInfo && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full ${dietInfo.color}`} />
              {dietInfo.label}
            </span>
          )}
          {isReady && matchPercent !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
              ✓ Ready
            </span>
          )}
          {showScore && recipe.score && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-500 text-white">
              {Math.min(100, Math.max(0, recipe.score))}pts
            </span>
          )}
        </div>

        {/* Favorite button */}
        {user && (
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
          </button>
        )}

        {/* Match percentage bar */}
        {matchPercent !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Pantry Match</span>
              <span className="font-bold">{matchPercent}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${matchPercent >= 70 ? 'bg-emerald-400' : matchPercent >= 40 ? 'bg-amber-400' : 'bg-orange-400'}`}
                style={{ width: `${matchPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* Title & cuisine */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-slate-800 text-sm leading-snug line-clamp-2 flex-1">
              {recipe.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{recipe.cuisine}</p>
        </div>

        {/* Stats row (No price) */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            {totalTime}m
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-curryGold-500 fill-curryGold-500" />
            {(recipe.rating || 4.8).toFixed(1)}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${difficultyColors[recipe.difficulty] || difficultyColors.Easy}`}>
            {recipe.difficulty}
          </span>
        </div>

        {/* Decision rationale */}
        {recipe.rationale?.length > 0 && !compact && (
          <div className="space-y-1">
            {recipe.rationale.slice(0, 2).map((point, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-emeraldChef-700">
                <Zap className="w-3 h-3 mt-0.5 flex-shrink-0 text-emeraldChef-500" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Missing ingredients */}
        {missing.length > 0 && !compact && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Missing: {missing.map(m => m.name).join(', ')}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            to={`/recipes/${recipe._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            View Recipe
          </Link>
          {onCook && (
            <button
              onClick={() => onCook(recipe)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emeraldChef-500 text-white text-sm font-semibold hover:bg-emeraldChef-600 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
