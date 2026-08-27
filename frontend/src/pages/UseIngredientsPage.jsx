import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Refrigerator, Check, Plus, X, Search, ChevronDown, ChevronUp, ChefHat, Sparkles
} from 'lucide-react';
import { getIngredientCatalog, getPantryCookingMatches } from '../utils/api';
import RecipeCard from '../components/RecipeCard';

export default function UseIngredientsPage() {
  const { user } = useAuth();

  const [catalog, setCatalog] = useState({});
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Results
  const [results, setResults] = useState({ readyToCook: [], almostReady: [], needShopping: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Active category accordion
  const [expandedCat, setExpandedCat] = useState('Vegetables');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await getIngredientCatalog();
        setCatalog(res.data.data || {});
      } catch (e) {
        console.error(e);
      }
    };
    fetchCatalog();
  }, []);

  // Fetch matches whenever selected ingredients change
  const handleFindMeals = async (items = selectedIngredients) => {
    if (!items || items.length === 0) {
      setResults({ readyToCook: [], almostReady: [], needShopping: [] });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await getPantryCookingMatches({ ingredients: items });
      setResults(res.data.data || { readyToCook: [], almostReady: [], needShopping: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIngredients.length > 0) {
      handleFindMeals(selectedIngredients);
    }
  }, []);

  const toggleIngredient = (name) => {
    let updated;
    if (selectedIngredients.includes(name)) {
      updated = selectedIngredients.filter((i) => i !== name);
    } else {
      updated = [...selectedIngredients, name];
    }
    setSelectedIngredients(updated);
    handleFindMeals(updated);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customInput.trim() && !selectedIngredients.includes(customInput.trim())) {
      const updated = [...selectedIngredients, customInput.trim()];
      setSelectedIngredients(updated);
      setCustomInput('');
      handleFindMeals(updated);
    }
  };

  const handleLoadUserPantry = () => {
    const pItems = (user?.pantryItems || []).map((p) => p.name);
    setSelectedIngredients(pItems);
    handleFindMeals(pItems);
  };

  const hasAnyResults = (results.readyToCook?.length > 0) || (results.almostReady?.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Refrigerator className="w-3.5 h-3.5" />
            Pantry-Specific Cooking
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            Cook With What You Have 🥕
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Select what's in your kitchen. We'll only show dishes that actually contain your ingredients.
          </p>
        </div>

        {user && (user.pantryItems?.length > 0) && (
          <button
            onClick={handleLoadUserPantry}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <Check className="w-4 h-4" /> Load My Saved Pantry ({user?.pantryItems?.length || 0})
          </button>
        )}
      </div>

      {/* Ingredient Tag Selector Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-5">
        {/* Selected Summary Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Selected Ingredients ({selectedIngredients.length} Items):
            </span>
            {selectedIngredients.length > 0 && (
              <button
                onClick={() => {
                  setSelectedIngredients([]);
                  handleFindMeals([]);
                }}
                className="text-xs text-rose-500 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[38px] p-3 rounded-2xl bg-slate-50 border border-slate-100">
            {selectedIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emeraldChef-600 text-white shadow-sm"
              >
                {item}
                <button
                  onClick={() => toggleIngredient(item)}
                  className="hover:text-emeraldChef-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {selectedIngredients.length === 0 && (
              <span className="text-xs text-slate-400 italic">
                No ingredients selected yet. Tap ingredients from below or type custom ones to find matching dishes.
              </span>
            )}
          </div>
        </div>

        {/* Custom Input + Search */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add other ingredient (e.g. Capsicum, Spinach)"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emeraldChef-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              Add
            </button>
          </form>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter ingredient catalog..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emeraldChef-500 outline-none"
            />
          </div>
        </div>

        {/* Categories Tabs / Accordions */}
        <div className="space-y-3 pt-2">
          {Object.entries(catalog).map(([category, items]) => {
            const isExpanded = expandedCat === category;
            const filteredItems = searchTerm
              ? items.filter((i) => i.toLowerCase().includes(searchTerm.toLowerCase()))
              : items;

            if (searchTerm && filteredItems.length === 0) return null;

            return (
              <div key={category} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : category)}
                  className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{category}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[10px] text-slate-500 border">
                      {filteredItems.length}
                    </span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {(isExpanded || searchTerm) && (
                  <div className="p-4 flex flex-wrap gap-2 bg-white">
                    {filteredItems.map((item) => {
                      const isSelected = selectedIngredients.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emeraldChef-500 text-white font-bold shadow-sm'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Section */}
      {selectedIngredients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft">
          <ChefHat className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-slate-800 mb-1">Pick Ingredients to See Matches</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select items you currently have (e.g. Potato, Onion, Paneer, Rice) above to discover dishes you can cook with them.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Ready to Cook (0 Missing) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="font-display font-bold text-2xl text-slate-800">
                100% Ready to Cook ({results.readyToCook?.length || 0})
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Contains Your Ingredients
              </span>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border" />
                ))}
              </div>
            ) : results.readyToCook?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {results.readyToCook.map((r) => (
                  <RecipeCard key={r._id} recipe={r} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                <p className="text-sm text-slate-500">
                  No 100% complete recipes for this exact combination yet. Check the dishes below that only need 1 or 2 more items!
                </p>
              </div>
            )}
          </div>

          {/* 2. Almost Ready (1-2 Missing Items) */}
          {results.almostReady?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h2 className="font-display font-bold text-2xl text-slate-800">
                  Almost Ready ({results.almostReady?.length || 0})
                </h2>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                  Contains Your Ingredients • Missing 1-2 Items
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {results.almostReady.map((r) => (
                  <RecipeCard key={r._id} recipe={r} />
                ))}
              </div>
            </div>
          )}

          {!loading && !hasAnyResults && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft">
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 mb-1">No recipes found containing these ingredients</h4>
              <p className="text-xs text-slate-500">
                Try selecting staple items like Potato, Paneer, Rice, or Dal above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
