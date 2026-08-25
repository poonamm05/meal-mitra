import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Users, CheckCircle2, Trophy,
  Send, AlertCircle
} from 'lucide-react';
import { getVoteByShareCode, castVote } from '../utils/api';

export default function VotingPublicPage() {
  const { shareCode } = useParams();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Vote form state
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [voterName, setVoterName] = useState(() => {
    return localStorage.getItem('mealmitra_voter_name') || '';
  });
  const [comment, setComment] = useState('');
  const [votedSuccess, setVotedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPoll = async () => {
    try {
      const res = await getVoteByShareCode(shareCode);
      setPoll(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Poll not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
    // Poll every 8 seconds for live voting updates
    const interval = setInterval(fetchPoll, 8000);
    return () => clearInterval(interval);
  }, [shareCode]);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!voterName.trim()) {
      alert('Please enter your name to vote!');
      return;
    }
    if (!selectedOptionId) {
      alert('Please select your preferred dish!');
      return;
    }

    setSubmitting(true);
    try {
      localStorage.setItem('mealmitra_voter_name', voterName.trim());
      await castVote(shareCode, {
        optionId: selectedOptionId,
        voterName: voterName.trim(),
        comment: comment.trim(),
      });
      setVotedSuccess(true);
      fetchPoll();

      // Confetti effect on vote
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading Family Poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-card border border-slate-100">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Poll Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The code <strong>{shareCode}</strong> might be invalid or expired.
          </p>
          <Link to="/" className="px-6 py-2.5 bg-brand-500 text-white text-xs font-bold rounded-xl">
            Go to MealMitra Home
          </Link>
        </div>
      </div>
    );
  }

  const totalVotes = poll.totalVotes || 0;
  const isLeaderWinner = poll.winningRecipe;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            Family Food Poll (PIN: {poll.shareCode})
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
            {poll.title}
          </h1>

          <p className="text-xs text-slate-500 mt-2">
            Created by <strong>{poll.creator?.name || 'Chef'}</strong> • {totalVotes} votes cast so far
          </p>

          {!poll.isActive && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Voting is Closed — Winner Decided!
            </div>
          )}
        </div>

        {/* Winner Highlight if available */}
        {isLeaderWinner && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-brand-500 text-white shadow-glow flex flex-col sm:flex-row items-center gap-5">
            <img
              src={isLeaderWinner.imageUrl}
              alt={isLeaderWinner.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-white/40 shadow-md"
            />
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-100 mb-1">
                <Trophy className="w-4 h-4 text-amber-200" /> Winning Meal 👑
              </div>
              <h3 className="font-display font-bold text-2xl">{isLeaderWinner.name}</h3>
              <p className="text-xs text-white/80 mt-1">
                {(isLeaderWinner.prepTime || 0) + (isLeaderWinner.cookTime || 0)} mins total
              </p>
            </div>
          </div>
        )}

        {/* Voting Options */}
        <form onSubmit={handleVoteSubmit} className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-display font-bold text-lg text-slate-800">
              {poll.isActive ? 'Choose What You Want to Eat:' : 'Vote Breakdown:'}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {(poll.options || []).map((opt) => {
                const isSelected = selectedOptionId === opt._id;
                const voteCount = opt.voteCount || 0;
                const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const r = opt.recipe;

                return (
                  <div
                    key={opt._id}
                    onClick={() => {
                      if (poll.isActive) setSelectedOptionId(opt._id);
                    }}
                    className={`bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer shadow-soft flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 ring-4 ring-brand-100'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="relative rounded-2xl overflow-hidden mb-3 h-36">
                        <img
                          src={r.imageUrl}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-brand-500 text-white rounded-full p-1 shadow-md">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                          {(r.prepTime || 0) + (r.cookTime || 0)}m
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base text-slate-900 mb-1">
                        {r.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">{r.cuisine}</p>
                    </div>

                    {/* Live Vote Bar */}
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</span>
                        <span className="text-brand-600">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Voters List */}
                      {opt.voters?.length > 0 && (
                        <div className="text-[11px] text-slate-400 pt-1 truncate">
                          Voted by: {opt.voters.map((v) => v.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voting Action Box if Poll is Active */}
          {poll.isActive && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800">
                Cast Your Vote
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">
                    Your Name (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    placeholder="e.g. Papa, Mom, Rahul, Priya"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">
                    Optional Comment
                  </label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Please make it extra spicy!"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedOptionId}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-bold text-base shadow-glow hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting Vote...' : 'Submit My Vote 🗳️'}
              </button>

              {votedSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your vote has been recorded and the live tally updated!
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
