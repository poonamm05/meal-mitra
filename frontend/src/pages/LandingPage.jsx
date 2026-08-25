import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Zap, Users, CalendarDays, Bot, Clock, ArrowRight, Star, CheckCircle, Sparkles, Refrigerator } from 'lucide-react';

const sampleMeals = [
  { name: 'Aloo Jeera with Phulka & Salad', time: 25, match: 95 },
  { name: 'Dal Tadka with Steamed Basmati Rice & Papad', time: 20, match: 88 },
  { name: 'Paneer Bhurji with Butter Toast / Paratha', time: 20, match: 76 },
  { name: 'Moong Dal Khichdi with Ghee, Kadhi & Papad', time: 20, match: 100 },
  { name: 'Veg Hakka Noodles with Stir-Fried Veggies', time: 20, match: 82 },
];

const features = [
  { icon: Zap, title: 'Smart Meal Decision', desc: 'Multi-factor AI picks the perfect meal based on your ingredients, cooking time, and history.', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { icon: Refrigerator, title: 'Pantry-Based Cooking', desc: 'Enter what\'s in your kitchen and instantly see 100% ready dishes vs those needing minor items.', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { icon: CalendarDays, title: 'Weekly Meal Planner', desc: 'AI generates a nutritionally balanced 7-day plan. Swap any meal with one click.', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  { icon: Bot, title: 'AI Meal Assistant', desc: 'Ask anything — "What can I cook with potatoes & tomatoes in 20 minutes?" — and get instant culinary answers.', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
];

const personas = [
  { emoji: '🧑', title: 'Bachelor / Student', desc: 'Quick meals under 20 mins, minimal effort, maximum satisfaction — from Egg Bhurji to quick Poha.', perks: ['Under 20 min recipes', 'Minimal kitchen utensils', 'Simple pantry staples'] },
  { emoji: '👨‍👩‍👧', title: 'Family & Homemaker', desc: 'Plan a full week\'s meals for 4 people, track what everyone likes, and never repeat the same dinner.', perks: ['Family-size portions', 'Weekly rotation planner', 'Anti-repetition memory'] },
  { emoji: '💼', title: 'Working Professional', desc: 'Decide dinner in 30 seconds, eat healthy all week — zero everyday kitchen decision stress.', perks: ['30-second quick decide', 'High-protein & light filters', 'Smart pantry matching'] },
];

export default function LandingPage() {
  const [mealType, setMealType] = useState('dinner');
  const [servings, setServings] = useState('2');
  const [mealIdx, setMealIdx] = useState(0);
  const [decided, setDecided] = useState(false);

  const decide = () => {
    setMealIdx(Math.floor(Math.random() * sampleMeals.length));
    setDecided(true);
  };

  const meal = sampleMeals[mealIdx];

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pt-8 pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative pt-4">
          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-slate-900 mb-6 leading-tight">
            No more daily<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-amber-500">‘Aaj kya banau?’</span><br />
            <span className="text-slate-900">confusion.</span> 👀
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tell MealMitra what you have, tell it what you need — it decides what you should cook. The everyday meal companion for every Indian home.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-brand-500 text-white rounded-2xl text-lg font-bold shadow-glow hover:bg-brand-600 transition-all hover:scale-105">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-2xl text-lg font-semibold border border-slate-200 hover:border-brand-300 hover:text-brand-600 transition-all">
              Login
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-700">
            {[['40+', 'Recipes'], ['3', 'Smart Personas'], ['100%', 'Free to Use'], ['0', 'Wasted Food']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-3xl text-brand-600">{val}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE DEMO SIMULATOR */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-slate-900 mb-3">See How It Works</h2>
            <p className="text-slate-500 text-lg">Try the decision engine right here — no sign up needed.</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-orange-50 rounded-3xl p-8 border border-slate-200 shadow-card">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Form */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-xl text-slate-800">Tell MealMitra...</h3>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Meal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(t => (
                      <button key={t} onClick={() => setMealType(t)}
                        className={`py-2 rounded-xl text-sm font-medium capitalize transition-all ${mealType === t ? 'bg-brand-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">For how many people?</label>
                  <select value={servings} onChange={e => setServings(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 bg-white text-sm focus:ring-2 focus:ring-brand-300 focus:border-transparent outline-none">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                  </select>
                </div>
                <button onClick={decide}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" /> Decide for Me!
                </button>
              </div>

              {/* Result */}
              <div>
                <h3 className="font-display font-semibold text-xl text-slate-800 mb-3">MealMitra Recommends...</h3>
                {decided ? (
                  <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-100 animate-fade-in">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Tonight's Pick 🍽️</div>
                        <h4 className="font-display font-bold text-lg text-slate-800">{meal.name}</h4>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{meal.match}% Match</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center bg-orange-50 rounded-xl py-2">
                        <Clock className="w-4 h-4 text-brand-500 mx-auto mb-0.5" />
                        <div className="text-xs font-bold text-slate-700">{meal.time} min</div>
                      </div>
                      <div className="text-center bg-blue-50 rounded-xl py-2">
                        <Users className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
                        <div className="text-xs font-bold text-slate-700">Serves {servings}</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-emerald-700">
                      <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Uses ingredients you likely have</div>
                      <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Fresh variety in your meal cycle</div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link to="/register" className="flex-1 py-2 bg-brand-500 text-white text-sm font-semibold rounded-xl text-center hover:bg-brand-600 transition-colors">Sign Up to Cook This</Link>
                      <button onClick={decide} className="px-3 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors">Try Another</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center min-h-[200px]">
                    <ChefHat className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">Configure your preferences and click<br /><strong>Decide for Me!</strong> to see the magic ✨</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl text-slate-900 mb-3">Everything You Need to Decide What to Cook</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">More than a recipe app — MealMitra is your daily cooking decision companion.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONAS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl text-slate-900 mb-3">Built for Every Kitchen</h2>
            <p className="text-slate-500 text-lg">MealMitra adapts to your lifestyle and household.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {personas.map(p => (
              <div key={p.title} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className="font-display font-bold text-xl text-slate-800 mb-2">{p.title}</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{p.desc}</p>
                <div className="space-y-1.5">
                  {p.perks.map(perk => (
                    <div key={perk} className="flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-500 to-amber-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ChefHat className="w-14 h-14 text-white/80 mx-auto mb-4" />
          <h2 className="font-display font-bold text-4xl text-white mb-4">Ready to Cook Smarter?</h2>
          <p className="text-white/80 text-lg mb-8">Join thousands of home cooks with zero ‘Aaj kya banau?’ confusion.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-brand-600 rounded-2xl text-lg font-bold hover:bg-orange-50 transition-all hover:scale-105 shadow-lg">
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ChefHat className="w-5 h-5 text-brand-400" />
          <span className="font-display font-bold text-white text-lg"><span className="text-brand-400">Meal</span>Mitra</span>
        </div>
        <p className="text-sm italic mb-4">"Your Everyday Meal Companion"</p>
        <p className="text-xs text-slate-600">Built with ❤️ using MERN Stack + Tailwind CSS + AI</p>
      </footer>
    </div>
  );
}
