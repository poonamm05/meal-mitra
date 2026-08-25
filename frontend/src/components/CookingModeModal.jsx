import { useState, useEffect } from 'react';
import { ChefHat, X, CheckCircle2, Play, Pause, RotateCcw, Clock } from 'lucide-react';

// Hindi UI text for cooking mode
const hi = {
  modeLabel: 'इंटरेक्टिव कुकिंग मोड',
  timerDone: '⏰ टाइमर ख़त्म! अगला चरण देखें।',
  add5m: '+5 मि',
  add10m: '+10 मि',
  stepsDone: (done, total, pct) => `${done} / ${total} चरण पूरे (${pct}%)`,
  doneCooking: 'पकाना पूरा हो गया ✅',
  tapToMark: 'चरण पर टैप करें – पूरा होने पर टिक हो जाएगा',
};

const en = {
  modeLabel: 'Interactive Cooking Mode',
  timerDone: '⏰ Timer Finished!',
  add5m: '+5m',
  add10m: '+10m',
  stepsDone: (done, total, pct) => `${done} of ${total} steps completed (${pct}%)`,
  doneCooking: 'Done Cooking',
  tapToMark: 'Tap a step to mark it done',
};

export default function CookingModeModal({ isOpen, onClose, recipe, language = 'en' }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const t = language === 'hi' ? hi : en;

  // Reset completed steps when recipe or language changes
  useEffect(() => {
    setCompletedSteps([]);
  }, [recipe?._id, language]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      alert(t.timerDone);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  if (!isOpen || !recipe) return null;

  // Use recipe.instructions as passed — RecipeDetailsPage already passes
  // `displayInstructions` (Hindi or English) via the recipe prop.
  const steps = recipe.instructions || [];

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const startTimer = (mins) => {
    setTimerSeconds(mins * 60);
    setTimerActive(true);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden z-10 border border-slate-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-400 font-bold">
                {t.modeLabel}
              </span>
              <h2 className="font-display font-bold text-lg">{recipe.name}</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2">
          <div
            className="h-full bg-emeraldChef-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Tap hint */}
        <div className="px-6 py-2 bg-brand-50 border-b border-brand-100">
          <p className="text-[11px] text-brand-700 font-medium text-center">{t.tapToMark}</p>
        </div>

        {/* Timer Bar */}
        <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-mono text-xl font-bold text-amber-900">{formatTimer(timerSeconds)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startTimer(5)}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              {t.add5m}
            </button>
            <button
              onClick={() => startTimer(10)}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              {t.add10m}
            </button>
            {timerSeconds > 0 && (
              <>
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(0);
                  }}
                  className="p-1.5 rounded-lg bg-white border text-slate-500 hover:bg-slate-100"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Steps List — renders whatever instructions are passed (English or Hindi) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {steps.length === 0 ? (
            <div className="text-center text-slate-400 py-10 text-sm">
              {language === 'hi' ? 'इस रेसिपी के चरण उपलब्ध नहीं हैं।' : 'No steps available for this recipe.'}
            </div>
          ) : (
            steps.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                      : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 shadow-sm'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-all ${
                      isDone ? 'bg-emeraldChef-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`text-sm leading-relaxed ${
                        isDone ? 'line-through opacity-60' : 'text-slate-800'
                      }`}
                      style={{ fontFamily: language === 'hi' ? "'Noto Sans Devanagari', sans-serif" : 'inherit' }}
                    >
                      {step}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {t.stepsDone(completedSteps.length, totalSteps, progressPercent)}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600"
          >
            {t.doneCooking}
          </button>
        </div>
      </div>
    </div>
  );
}
