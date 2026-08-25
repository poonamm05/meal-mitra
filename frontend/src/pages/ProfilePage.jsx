import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Settings, Refrigerator, Check, Plus, Trash2,
  Sparkles, Save, ShieldCheck, Flame, Heart, AlertCircle
} from 'lucide-react';
import { updatePreferences, updatePantry, getMe } from '../utils/api';

const CUISINES = ['North Indian', 'South Indian', 'Continental', 'Indo-Chinese', 'Gujarati', 'Maharashtrian', 'Hyderabadi'];
const DIETARY_OPTIONS = ['vegetarian', 'eggetarian', 'non-vegetarian', 'vegan', 'jain'];
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('preferences');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [persona, setPersona] = useState(user?.persona || 'custom');
  const [householdSize, setHouseholdSize] = useState(user?.householdSize || 2);
  const [dietaryPreference, setDietaryPreference] = useState(user?.dietaryPreference || 'vegetarian');
  const [cuisinePreferences, setCuisinePreferences] = useState(user?.cuisinePreferences || ['North Indian']);
  const [defaultMaxCookingTime, setDefaultMaxCookingTime] = useState(user?.defaultMaxCookingTime || 35);
  const [spiceLevel, setSpiceLevel] = useState(user?.spiceLevel || 'Medium');

  // Disliked ingredients
  const [dislikedList, setDislikedList] = useState(user?.dislikedIngredients || []);
  const [dislikedInput, setDislikedInput] = useState('');

  // Pantry items
  const [pantryItems, setPantryItems] = useState(user?.pantryItems || []);
  const [newPantryName, setNewPantryName] = useState('');
  const [newPantryCat, setNewPantryCat] = useState('Vegetables');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPersona(user.persona || 'custom');
      setHouseholdSize(user.householdSize || 2);
      setDietaryPreference(user.dietaryPreference || 'vegetarian');
      setCuisinePreferences(user.cuisinePreferences || ['North Indian']);
      setDefaultMaxCookingTime(user.defaultMaxCookingTime || 35);
      setSpiceLevel(user.spiceLevel || 'Medium');
      setDislikedList(user.dislikedIngredients || []);
      setPantryItems(user.pantryItems || []);
    }
  }, [user]);

  const toggleCuisine = (c) => {
    if (cuisinePreferences.includes(c)) {
      setCuisinePreferences(cuisinePreferences.filter((item) => item !== c));
    } else {
      setCuisinePreferences([...cuisinePreferences, c]);
    }
  };

  const addDisliked = (e) => {
    e.preventDefault();
    if (dislikedInput.trim() && !dislikedList.includes(dislikedInput.trim())) {
      setDislikedList([...dislikedList, dislikedInput.trim()]);
      setDislikedInput('');
    }
  };

  const removeDisliked = (item) => {
    setDislikedList(dislikedList.filter((d) => d !== item));
  };

  const addPantryItem = (e) => {
    e.preventDefault();
    if (!newPantryName.trim()) return;
    const item = {
      name: newPantryName.trim(),
      category: newPantryCat,
      quantity: 'In Stock',
      addedAt: new Date(),
    };
    setPantryItems([...pantryItems, item]);
    setNewPantryName('');
  };

  const removePantryItem = (idx) => {
    setPantryItems(pantryItems.filter((_, i) => i !== idx));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({
        name,
        persona,
        householdSize: Number(householdSize),
        dietaryPreference,
        cuisinePreferences,
        defaultMaxCookingTime: Number(defaultMaxCookingTime),
        spiceLevel,
        dislikedIngredients: dislikedList,
      });

      await updatePantry(pantryItems);
      await refreshUser();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" />
          Settings & Cooking Profile
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
          User Preferences ⚙️
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Customize your household taste profile, dietary rules, and kitchen pantry inventory.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: 'preferences', label: 'Taste & Diet Rules', icon: Sparkles },
          { id: 'pantry', label: `Kitchen Pantry (${pantryItems.length})`, icon: Refrigerator },
          { id: 'account', label: 'Account Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            {/* Dietary Preference */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DIETARY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDietaryPreference(d)}
                    className={`py-3 px-3 rounded-2xl border text-xs font-semibold capitalize transition-all ${
                      dietaryPreference === d
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Cuisines */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                Preferred Cuisines
              </label>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => {
                  const isSelected = cuisinePreferences.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-500 text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders: Time Limit */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-600 uppercase tracking-wider">
                  Default Max Cooking Time
                </span>
                <span className="font-bold text-brand-600">{defaultMaxCookingTime} mins</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={defaultMaxCookingTime}
                onChange={(e) => setDefaultMaxCookingTime(e.target.value)}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Spice Level */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                Spice Tolerance Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SPICE_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      spiceLevel === level
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Disliked Ingredients Blacklist */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wider">
                Disliked Ingredients (Never Recommend Dishes With These)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={dislikedInput}
                  onChange={(e) => setDislikedInput(e.target.value)}
                  placeholder="e.g. Karela, Mushroom, Capsicum"
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <button
                  type="button"
                  onClick={addDisliked}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {dislikedList.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    {item}
                    <button type="button" onClick={() => removeDisliked(item)}>
                      <Trash2 className="w-3 h-3 text-rose-400 hover:text-rose-700" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-brand-500 text-white font-bold text-sm shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Cooking Preferences'}
            </button>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center">
                ✓ Preferences updated successfully!
              </div>
            )}
          </div>
        </form>
      )}

      {/* Tab 2: Pantry Inventory */}
      {activeTab === 'pantry' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-800 mb-1">
              Your Kitchen Pantry Stock
            </h3>
            <p className="text-xs text-slate-500">
              Items saved here are automatically recognized as "Available at Home" across all recommendation wizards.
            </p>
          </div>

          <form onSubmit={addPantryItem} className="grid sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              value={newPantryName}
              onChange={(e) => setNewPantryName(e.target.value)}
              placeholder="Ingredient name (e.g. Basmati Rice)"
              className="sm:col-span-2 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emeraldChef-600 text-white rounded-xl text-xs font-bold hover:bg-emeraldChef-700 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {pantryItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
              >
                <div>
                  <h5 className="font-bold text-xs text-slate-800">{item.name}</h5>
                  <span className="text-[10px] text-emerald-600 font-medium">In Stock</span>
                </div>
                <button
                  type="button"
                  onClick={() => removePantryItem(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Pantry Items
          </button>
        </div>
      )}

      {/* Tab 3: Account Profile */}
      {activeTab === 'account' && (
        <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">
              Household Size (Serving Scale)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="10"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
                className="w-24 px-4 py-3 rounded-xl border border-slate-200 text-sm text-center font-bold outline-none"
              />
              <span className="text-xs text-slate-500">People living & eating together</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-brand-500 text-white font-bold text-sm shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Update Profile
          </button>
        </form>
      )}
    </div>
  );
}
