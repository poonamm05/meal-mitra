import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Sparkles, Clock, Users, ChefHat, X, BookOpen, RotateCcw } from 'lucide-react';

export default function SurpriseMeModal({ isOpen, onClose, recipe, onSpinAgain, loading }) {
  useEffect(() => {
    if (isOpen && recipe) {
      // Fire celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#eab308', '#10b981', '#3b82f6'],
      });
    }
  }, [isOpen, recipe]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-fade-in border border-slate-100">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Decision Made by MealMitra
          </div>
          <h2 className="font-display font-bold text-2xl">Today's Surprise Meal! 🍽️</h2>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold text-slate-700">Spinning the culinary wheel...</p>
            <p className="text-xs text-slate-500 mt-1">Analyzing your pantry, taste, and variety</p>
          </div>
        ) : recipe ? (
          <div className="p-6">
            <div className="relative rounded-2xl overflow-hidden mb-5 h-48 shadow-md">
              <img
                src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/90 backdrop-blur-sm">
                  {recipe.cuisine}
                </span>
                <h3 className="font-display font-bold text-xl mt-1">{recipe.name}</h3>
              </div>
            </div>

            {/* Quick Stats Grid (No price) */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-700">{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min total</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-700">Serves {recipe.servingSize || 2}</span>
              </div>
            </div>

            {/* Rationale Quote */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-6 flex items-start gap-2">
              <ChefHat className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Why this is right for you:</strong>{' '}
                {recipe.defaultDecisionTip || 'Balanced comfort meal that comes together quickly using kitchen staples.'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onSpinAgain}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Spin Again
              </button>

              <Link
                to={`/recipes/${recipe._id}`}
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-glow flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Let's Cook This!
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
