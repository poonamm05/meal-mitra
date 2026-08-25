import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Image, Edit3, Trash2, Plus, Search,
  CheckCircle2, X, AlertTriangle, ExternalLink, ChefHat,
  RefreshCw, UtensilsCrossed, Clock, Eye
} from 'lucide-react';
import {
  adminGetRecipes,
  adminUpdateRecipe,
  adminDeleteRecipe,
  adminCreateRecipe,
  adminGetStats
} from '../utils/api';

const CUISINES = ['North Indian', 'South Indian', 'Continental', 'Indo-Chinese', 'Gujarati', 'Maharashtrian', 'Hyderabadi', 'Italian', 'Mexican'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({ totalRecipes: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Photo edit modal / inline state
  const [photoEditId, setPhotoEditId] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoSaving, setPhotoSaving] = useState(false);

  // Full recipe edit modal state
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Add new recipe modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRecipeData, setNewRecipeData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    cuisine: 'North Indian',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 20,
    servingSize: 2,
    dietaryFlags: ['vegetarian'],
    defaultDecisionTip: '',
    ingredients: '',
    instructions: '',
  });
  const [createSaving, setCreateSaving] = useState(false);

  // Notification message
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipesRes, statsRes] = await Promise.all([
        adminGetRecipes(),
        adminGetStats().catch(() => ({ data: { data: { totalRecipes: 0, totalUsers: 0 } } }))
      ]);
      setRecipes(recipesRes.data.data || []);
      setStats(statsRes.data.data || { totalRecipes: 0, totalUsers: 0 });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert('Access denied. You must be logged in as an Administrator.');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      alert('Access denied. Administrator privileges required.');
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user]);

  // Handle direct photo update
  const handleSavePhoto = async (recipeId) => {
    if (!newPhotoUrl.trim()) return;
    setPhotoSaving(true);
    try {
      await adminUpdateRecipe(recipeId, { imageUrl: newPhotoUrl.trim() });
      setRecipes((prev) =>
        prev.map((r) => (r._id === recipeId ? { ...r, imageUrl: newPhotoUrl.trim() } : r))
      );
      setPhotoEditId(null);
      setNewPhotoUrl('');
      showToast('✅ Photo updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update photo');
    } finally {
      setPhotoSaving(false);
    }
  };

  // Handle full recipe edit save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRecipe) return;
    setEditSaving(true);
    try {
      const res = await adminUpdateRecipe(editingRecipe._id, editFormData);
      setRecipes((prev) =>
        prev.map((r) => (r._id === editingRecipe._id ? res.data.data : r))
      );
      setEditingRecipe(null);
      showToast(`✅ "${editFormData.name}" updated successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update recipe');
    } finally {
      setEditSaving(false);
    }
  };

  // Handle recipe deletion
  const handleDeleteRecipe = async (recipe) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${recipe.name}" from MealMitra? This will remove it from all meal recommendations and planner.`
    );
    if (!confirmDelete) return;

    try {
      await adminDeleteRecipe(recipe._id);
      setRecipes((prev) => prev.filter((r) => r._id !== recipe._id));
      showToast(`🗑️ "${recipe.name}" deleted from website.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete recipe');
    }
  };

  // Handle create new recipe
  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (!newRecipeData.name || !newRecipeData.cuisine) {
      alert('Dish name and cuisine are required.');
      return;
    }
    setCreateSaving(true);
    try {
      const res = await adminCreateRecipe(newRecipeData);
      setRecipes((prev) => [res.data.data, ...prev]);
      setAddModalOpen(false);
      setNewRecipeData({
        name: '',
        description: '',
        imageUrl: '',
        cuisine: 'North Indian',
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 20,
        servingSize: 2,
        dietaryFlags: ['vegetarian'],
        defaultDecisionTip: '',
        ingredients: '',
        instructions: '',
      });
      showToast(`🎉 "${res.data.data.name}" added to MealMitra!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create recipe');
    } finally {
      setCreateSaving(false);
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || r.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator Control Center
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            Dish & Content Manager 🛡️
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Update dish photos, edit descriptions, remove outdated items, or add new dishes to MealMitra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-bold text-sm shadow-glow hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Dish
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Catalog Dishes</div>
          <div className="font-display font-bold text-3xl text-brand-600">{recipes.length}</div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Admin Account</div>
          <div className="font-display font-bold text-base text-slate-800 truncate">{user?.email || 'admin@mealmitra.com'}</div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">System Status</div>
          <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live & Healthy
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish name or cuisine..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter Cuisine:</span>
          {['All', 'North Indian', 'South Indian', 'Continental', 'Indo-Chinese'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCuisine === c
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-500" />
            <p className="text-sm">Loading dish database...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ChefHat className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No dishes match your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Dish & Photo</th>
                  <th className="py-4 px-4">Cuisine & Diet</th>
                  <th className="py-4 px-4">Time / Difficulty</th>
                  <th className="py-4 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Dish & Photo Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative group flex-shrink-0">
                          <img
                            src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'}
                            alt={recipe.name}
                            className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-100"
                          />
                          <button
                            onClick={() => {
                              setPhotoEditId(recipe._id);
                              setNewPhotoUrl(recipe.imageUrl || '');
                            }}
                            title="Change Photo"
                            className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <Image className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {recipe.name}
                          </h4>
                          <p className="text-slate-500 line-clamp-1 text-[11px] mt-0.5 max-w-md">
                            {recipe.description || 'No description provided.'}
                          </p>
                          <Link
                            to={`/recipes/${recipe._id}`}
                            className="text-brand-600 hover:underline inline-flex items-center gap-1 text-[10px] font-semibold mt-1"
                          >
                            <Eye className="w-3 h-3" /> View on Website
                          </Link>
                        </div>
                      </div>

                      {/* Inline photo update input if open */}
                      {photoEditId === recipe._id && (
                        <div className="mt-3 p-3 bg-brand-50/60 rounded-2xl border border-brand-200 animate-fade-in space-y-2">
                          <div className="text-[11px] font-bold text-brand-800">Paste New Dish Image URL:</div>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={newPhotoUrl}
                              onChange={(e) => setNewPhotoUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-brand-300 bg-white outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <button
                              onClick={() => handleSavePhoto(recipe._id)}
                              disabled={photoSaving || !newPhotoUrl.trim()}
                              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 disabled:opacity-50"
                            >
                              {photoSaving ? 'Saving...' : 'Update Photo'}
                            </button>
                            <button
                              onClick={() => setPhotoEditId(null)}
                              className="px-2.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Cuisine & Diet */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] mb-1">
                        {recipe.cuisine}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(recipe.dietaryFlags || []).slice(0, 2).map((flag) => (
                          <span
                            key={flag}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] capitalize"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Time / Difficulty */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)} mins
                      </div>
                      <span className="text-[11px] text-slate-400">{recipe.difficulty}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPhotoEditId(recipe._id);
                            setNewPhotoUrl(recipe.imageUrl || '');
                          }}
                          title="Change Photo URL"
                          className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <Image className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecipe(recipe);
                            setEditFormData({
                              name: recipe.name,
                              description: recipe.description || '',
                              cuisine: recipe.cuisine,
                              difficulty: recipe.difficulty || 'Easy',
                              prepTime: recipe.prepTime || 10,
                              cookTime: recipe.cookTime || 20,
                              servingSize: recipe.servingSize || 2,
                              imageUrl: recipe.imageUrl || '',
                            });
                          }}
                          title="Edit Details"
                          className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe)}
                          title="Delete Dish from Website"
                          className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingRecipe(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-xl text-slate-900">
                Edit Dish: {editingRecipe.name}
              </h3>
              <button onClick={() => setEditingRecipe(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={editFormData.imageUrl || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Cuisine</label>
                  <select
                    value={editFormData.cuisine || 'North Indian'}
                    onChange={(e) => setEditFormData({ ...editFormData, cuisine: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Difficulty</label>
                  <select
                    value={editFormData.difficulty || 'Easy'}
                    onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.prepTime || 10}
                    onChange={(e) => setEditFormData({ ...editFormData, prepTime: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Cook Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.cookTime || 20}
                    onChange={(e) => setEditFormData({ ...editFormData, cookTime: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 disabled:opacity-50"
                >
                  {editSaving ? 'Saving Changes...' : 'Save Updates'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRecipe(null)}
                  className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Recipe Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-xl text-slate-900">
                Add New Dish to Catalog
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={newRecipeData.name}
                  onChange={(e) => setNewRecipeData({ ...newRecipeData, name: e.target.value })}
                  placeholder="e.g. Masala Dosa with Sambar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={newRecipeData.imageUrl}
                  onChange={(e) => setNewRecipeData({ ...newRecipeData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Cuisine *</label>
                  <select
                    value={newRecipeData.cuisine}
                    onChange={(e) => setNewRecipeData({ ...newRecipeData, cuisine: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Difficulty</label>
                  <select
                    value={newRecipeData.difficulty}
                    onChange={(e) => setNewRecipeData({ ...newRecipeData, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRecipeData.prepTime}
                    onChange={(e) => setNewRecipeData({ ...newRecipeData, prepTime: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Cook Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRecipeData.cookTime}
                    onChange={(e) => setNewRecipeData({ ...newRecipeData, cookTime: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newRecipeData.description}
                  onChange={(e) => setNewRecipeData({ ...newRecipeData, description: e.target.value })}
                  placeholder="Short description of this dish..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Ingredients <span className="text-slate-400 font-normal">(comma-separated, e.g. Potato, Onion, Tomato)</span>
                </label>
                <textarea
                  rows="3"
                  value={newRecipeData.ingredients}
                  onChange={(e) => setNewRecipeData({ ...newRecipeData, ingredients: e.target.value })}
                  placeholder="Potato, Onion, Tomato, Cumin seeds, Oil, Salt..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Cooking Steps / Instructions <span className="text-slate-400 font-normal">(one step per line)</span>
                </label>
                <textarea
                  rows="6"
                  value={newRecipeData.instructions}
                  onChange={(e) => setNewRecipeData({ ...newRecipeData, instructions: e.target.value })}
                  placeholder={"Step 1: Wash and chop all vegetables.\nStep 2: Heat oil in a pan...\nStep 3: Add spices and cook until done."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Each new line becomes a separate cooking step visible to users.</p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={createSaving}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 disabled:opacity-50"
                >
                  {createSaving ? 'Creating Dish...' : 'Publish Dish to Website'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
