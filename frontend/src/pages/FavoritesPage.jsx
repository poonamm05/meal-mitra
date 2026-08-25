import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Search, Filter, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { getRecipes, getMe } from '../utils/api';
import RecipeCard from '../components/RecipeCard';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');

  useEffect(() => {
    const fetchFavs = async () => {
      setLoading(true);
      try {
        const [meRes, recRes] = await Promise.all([
          getMe(),
          getRecipes({ limit: 40 }),
        ]);

        const favIds = (meRes.data.data?.favoriteRecipes || []).map((f) => (f._id || f).toString());
        const all = recRes.data.data || [];
        const filtered = all.filter((r) => favIds.includes(r._id.toString()));
        setFavorites(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, [user]);

  const displayedFavorites = favorites.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = cuisineFilter === 'all' || r.cuisine.toLowerCase() === cuisineFilter.toLowerCase();
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Your Saved Culinary Library
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            Favorite Dishes ({favorites.length})
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Recipes you've bookmarked for quick access and weekly meal planning.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved dishes..."
              className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
            />
          </div>

          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none"
          >
            <option value="all">All Cuisines</option>
            <option value="North Indian">North Indian</option>
            <option value="South Indian">South Indian</option>
            <option value="Continental">Continental</option>
            <option value="Indo-Chinese">Indo-Chinese</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Maharashtrian">Maharashtrian</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-white rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : displayedFavorites.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedFavorites.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <Heart className="w-12 h-12 text-rose-300 mx-auto" />
          <h3 className="font-display font-bold text-xl text-slate-800">
            {favorites.length === 0 ? 'No Favorite Recipes Yet' : 'No matches found for search'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any recipe card across MealMitra to add it to your personal favorites collection!
          </p>
          <Link
            to="/decide"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-bold text-xs shadow-glow hover:bg-brand-600 transition-colors"
          >
            Discover Recipes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
