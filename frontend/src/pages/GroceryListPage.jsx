import { useState, useEffect } from 'react';
import {
  ShoppingCart, Plus, Check, Trash2, Share2, Sparkles,
  IndianRupee, CheckCircle2, RotateCcw, Copy, Filter
} from 'lucide-react';
import {
  getGroceryList,
  generateGroceryFromPlan,
  addGroceryItem,
  toggleGroceryItem,
  deleteGroceryItem
} from '../utils/api';

const CATEGORIES = ['Vegetables', 'Dairy', 'Grains & Pulses', 'Spices & Condiments', 'Meat & Seafood', 'Bakery', 'Oils & Sauces', 'Other'];

export default function GroceryListPage() {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Add Item form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('kg');
  const [estimatedCost, setEstimatedCost] = useState(40);

  // Filter: Hide purchased
  const [hidePurchased, setHidePurchased] = useState(false);

  const fetchGrocery = async () => {
    setLoading(true);
    try {
      const res = await getGroceryList();
      setList(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrocery();
  }, []);

  const handleSyncPlan = async () => {
    setSyncing(true);
    try {
      const res = await generateGroceryFromPlan();
      setList(res.data.data);
    } catch (e) {
      alert('Make sure you have an active weekly meal plan first!');
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePurchased = async (itemId) => {
    try {
      const res = await toggleGroceryItem(itemId);
      setList(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await deleteGroceryItem(itemId);
      setList(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await addGroceryItem({
        name: name.trim(),
        category,
        quantity: Number(quantity),
        unit,
        estimatedCost: Number(estimatedCost),
      });
      setList(res.data.data);
      setName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareWhatsApp = () => {
    if (!list || !list.items) return;
    let text = `🛒 *MealMitra Grocery List* (${list.title || 'Weekly'}):\n\n`;
    list.items.forEach((item) => {
      const status = item.isPurchased ? '✅' : '⬜';
      text += `${status} ${item.name} (${item.quantity} ${item.unit}) ~ ₹${item.estimatedCost}\n`;
    });
    text += `\n*Total Estimated Spend: ₹${list.totalEstimatedCost || 0}*`;

    navigator.clipboard.writeText(text);
    alert('Copied formatted Grocery List to clipboard! Ready to paste into WhatsApp.');
  };

  const allItems = list?.items || [];
  const purchasedCount = allItems.filter((i) => i.isPurchased).length;
  const progress = allItems.length > 0 ? Math.round((purchasedCount / allItems.length) * 100) : 0;

  // Group by category
  const groupedItems = {};
  allItems.forEach((item) => {
    if (hidePurchased && item.isPurchased) return;
    const cat = item.category || 'Other';
    if (!groupedItems[cat]) groupedItems[cat] = [];
    groupedItems[cat].push(item);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingCart className="w-3.5 h-3.5" />
            Smart Pantry Shopping
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            Automated Grocery List 🛒
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Aggregated from your weekly meal plan and adjusted against items already in your kitchen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncPlan}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {syncing ? 'Syncing...' : 'Sync from Weekly Plan'}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emeraldChef-600 text-white font-bold text-xs hover:bg-emeraldChef-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-4 h-4" /> WhatsApp Export
          </button>
        </div>
      </div>

      {/* Progress & Spend Bar Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card grid sm:grid-cols-3 gap-6 items-center">
        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Shopping Progress</span>
            <span className="text-brand-600">
              {purchasedCount} of {allItems.length} Purchased ({progress}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-emeraldChef-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-center sm:text-right sm:border-l sm:border-slate-100 sm:pl-6">
          <span className="text-xs text-slate-400 font-medium">Estimated Grocery Budget</span>
          <div className="font-display font-bold text-3xl text-slate-800 flex items-center justify-center sm:justify-end gap-1">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
            {list?.totalEstimatedCost || 0}
          </div>
        </div>
      </div>

      {/* Add Custom Item Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
        <h3 className="font-display font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-500" />
          Add Custom Grocery Item
        </h3>

        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name (e.g. Milk, Coriander)"
            className="sm:col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex gap-1.5">
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-16 px-2 py-2.5 rounded-xl border border-slate-200 text-xs text-center outline-none"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="flex-1 px-2 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
            >
              {['kg', 'g', 'litres', 'ml', 'packet', 'pieces', 'bunch'].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-slate-800">Shopping Items by Aisle</h2>
        <button
          onClick={() => setHidePurchased(!hidePurchased)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
            hidePurchased
              ? 'bg-brand-50 border-brand-200 text-brand-700'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          {hidePurchased ? 'Showing Unpurchased Only' : 'Show All Items'}
        </button>
      </div>

      {/* Grouped Category Aisles */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-display font-bold text-base text-slate-800">{cat}</h3>
                <span className="text-xs text-slate-400 font-medium">{items.length} items</span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="py-3 flex items-center justify-between gap-4 group"
                  >
                    <div
                      onClick={() => handleTogglePurchased(item._id)}
                      className="flex items-center gap-3.5 flex-1 cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          item.isPurchased
                            ? 'bg-emeraldChef-500 border-emeraldChef-500 text-white'
                            : 'border-slate-300 hover:border-brand-500'
                        }`}
                      >
                        {item.isPurchased && <Check className="w-4 h-4" />}
                      </div>

                      <div>
                        <h4
                          className={`text-sm font-semibold transition-all ${
                            item.isPurchased ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {item.name}
                        </h4>
                        <div className="text-xs text-slate-500">
                          {item.quantity} {item.unit}
                          {item.isPantryAvailable && (
                            <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              In Pantry
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-700">₹{item.estimatedCost}</span>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 transition-opacity"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 mb-1">Your Grocery List is Empty</h3>
          <p className="text-xs text-slate-500 mb-4">
            Click "Sync from Weekly Plan" to automatically calculate items needed for your upcoming meals!
          </p>
        </div>
      )}
    </div>
  );
}
