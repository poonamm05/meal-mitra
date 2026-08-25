import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Plus, Check, Copy, Share2,
  ArrowRight, Sparkles, X
} from 'lucide-react';
import { createFamilyVote, getUserPolls, getRecipes, closePoll } from '../utils/api';

export default function FamilyVotingPage() {
  const { user } = useAuth();

  const [polls, setPolls] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll creation form state
  const [title, setTitle] = useState('What should we cook for dinner tonight? 🍽️');
  const [mealType, setMealType] = useState('dinner');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createdPoll, setCreatedPoll] = useState(null);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const [pollRes, recipeRes] = await Promise.all([
        getUserPolls(),
        getRecipes({ limit: 30 }),
      ]);
      setPolls(pollRes.data.data || []);
      setRecipes(recipeRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const toggleRecipeSelection = (rId) => {
    if (selectedRecipeIds.includes(rId)) {
      setSelectedRecipeIds(selectedRecipeIds.filter((id) => id !== rId));
    } else {
      if (selectedRecipeIds.length >= 4) {
        alert('You can select a maximum of 4 meal candidates for family voting.');
        return;
      }
      setSelectedRecipeIds([...selectedRecipeIds, rId]);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (selectedRecipeIds.length < 2) {
      alert('Please select at least 2 meal options to vote on!');
      return;
    }

    setCreating(true);
    try {
      const res = await createFamilyVote({
        title,
        mealType,
        recipeIds: selectedRecipeIds,
      });
      setCreatedPoll(res.data.data);
      setSelectedRecipeIds([]);
      fetchPolls();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleClosePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to finalize this poll and announce the winning meal?')) {
      try {
        await closePoll(pollId);
        fetchPolls();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const copyShareLink = (shareCode) => {
    const url = `${window.location.origin}/vote/${shareCode}`;
    navigator.clipboard.writeText(url);
    alert('Copied voting link to clipboard! Share with family on WhatsApp.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Users className="w-3.5 h-3.5" />
          Collaborative Decision Making
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
          Family & Roommate Food Polls 👨‍👩‍👧
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Stop asking "What should I cook?" into the void. Pick 2-4 candidates and let everyone vote on their phone!
        </p>
      </div>

      {/* Share Box for newly created poll */}
      {createdPoll && (
        <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-500 shadow-card animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-lg text-emerald-900">
                Poll Created Successfully! 🎉
              </h3>
            </div>
            <button onClick={() => setCreatedPoll(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-emerald-800">
            Share this link or 6-digit Code (<strong>{createdPoll.shareCode}</strong>) with your family members:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/vote/${createdPoll.shareCode}`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs font-mono text-slate-700 w-full"
            />
            <button
              onClick={() => copyShareLink(createdPoll.shareCode)}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </button>
            <Link
              to={`/vote/${createdPoll.shareCode}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              Open Live Poll <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Poll Creation Wizard */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
        <h2 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
          <Plus className="w-5 h-5 text-brand-500" />
          Create a New Food Poll
        </h2>

        <form onSubmit={handleCreatePoll} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Poll Question / Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What should we eat tonight?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">
                Meal Category
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none capitalize"
              >
                {['dinner', 'lunch', 'breakfast', 'weekend_special'].map((m) => (
                  <option key={m} value={m}>
                    {m.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipe Candidate Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Select 2 to 4 Dishes for Family to Choose ({selectedRecipeIds.length} Selected)
              </label>
              <span className="text-xs text-brand-600 font-semibold">Min 2, Max 4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50">
              {recipes.map((r) => {
                const isSelected = selectedRecipeIds.includes(r._id);
                return (
                  <div
                    key={r._id}
                    onClick={() => toggleRecipeSelection(r._id)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/80 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="relative rounded-xl overflow-hidden mb-2 h-24">
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-brand-500/30 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{r.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {(r.prepTime || 0) + (r.cookTime || 0)}m
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || selectedRecipeIds.length < 2}
            className="w-full py-3.5 rounded-2xl bg-brand-500 text-white font-bold text-sm shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? 'Creating Poll...' : 'Launch Food Poll & Generate Share Code 🚀'}
          </button>
        </form>
      </div>

      {/* User's Previous Polls */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-slate-800">Your Created Polls</h2>

        {polls.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 text-slate-500 text-sm">
            No family polls created yet. Launch one above to let your household vote on dinner!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {polls.map((p) => {
              const totalVotes = (p.options || []).reduce(
                (sum, opt) => sum + ((opt.votes && opt.votes.length) || 0),
                0
              );

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.isActive ? 'Active Voting' : 'Closed Poll'}
                      </span>
                      <span className="text-xs font-mono font-bold text-brand-600">PIN: {p.shareCode}</span>
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-800">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {totalVotes} Votes Cast • {p.options?.length || 0} Dish Candidates
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Link
                      to={`/vote/${p.shareCode}`}
                      className="flex-1 py-2 rounded-xl bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 text-center transition-colors"
                    >
                      View Live Results
                    </Link>
                    <button
                      onClick={() => copyShareLink(p.shareCode)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      title="Copy Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {p.isActive && (
                      <button
                        onClick={() => handleClosePoll(p._id)}
                        className="py-2 px-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"
                      >
                        Close Poll
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
