import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Mail, Lock, User, ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

const CUISINES = ['North Indian', 'South Indian', 'Continental', 'Indo-Chinese', 'Gujarati', 'Maharashtrian', 'Hyderabadi'];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Step 1 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 fields
  const [persona, setPersona] = useState('custom');
  const [householdSize, setHouseholdSize] = useState(2);
  const [dietaryPreference, setDietaryPreference] = useState('vegetarian');
  const [cuisinePreferences, setCuisinePreferences] = useState(['North Indian', 'South Indian']);
  const [defaultMaxCookingTime, setDefaultMaxCookingTime] = useState(30);

  const toggleCuisine = (c) => {
    if (cuisinePreferences.includes(c)) {
      setCuisinePreferences(cuisinePreferences.filter((item) => item !== c));
    } else {
      setCuisinePreferences([...cuisinePreferences, c]);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all account fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await register({
      name,
      email,
      password,
      persona,
      householdSize: Number(householdSize),
      dietaryPreference,
      cuisinePreferences,
      defaultMaxCookingTime: Number(defaultMaxCookingTime),
    });

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-3 shadow-glow">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Join MealMitra</h1>
            <p className="text-sm text-slate-500 mt-1">
              {step === 1 ? 'Step 1 of 2: Basic Account Details' : 'Step 2 of 2: Your Cooking Preferences'}
            </p>

            {/* Stepper dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`h-2 rounded-full transition-all ${step === 1 ? 'w-8 bg-brand-500' : 'w-2 bg-slate-300'}`} />
              <div className={`h-2 rounded-full transition-all ${step === 2 ? 'w-8 bg-brand-500' : 'w-2 bg-slate-300'}`} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rohit Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rohit@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-500 text-white font-semibold shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-2 mt-4"
              >
                Next: Cooking Preferences
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Persona / Household */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">I am cooking for</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bachelor', label: 'Solo / Bachelor', size: 1, icon: '🧑' },
                    { id: 'working_professional', label: 'Couples / Pros', size: 2, icon: '💼' },
                    { id: 'family', label: 'Family (3+)', size: 4, icon: '👨‍👩‍👧' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPersona(p.id);
                        setHouseholdSize(p.size);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        persona === p.id
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{p.icon}</div>
                      <div className="text-xs">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Preference */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">Dietary Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'vegetarian', label: '🥦 Vegetarian' },
                    { id: 'eggetarian', label: '🥚 Eggetarian' },
                    { id: 'non-vegetarian', label: '🍗 Non-Veg' },
                    { id: 'vegan', label: '🌱 Vegan' },
                    { id: 'jain', label: '🌿 Jain (No root veg)' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDietaryPreference(d.id)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        dietaryPreference === d.id
                          ? 'border-emeraldChef-500 bg-emeraldChef-50 text-emeraldChef-700 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Cuisines */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">Favorite Cuisines</label>
                <div className="flex flex-wrap gap-1.5">
                  {CUISINES.map((c) => {
                    const isSelected = cuisinePreferences.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCuisine(c)}
                        className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3.5 rounded-xl bg-brand-500 text-white text-sm font-semibold shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Setting Up...' : 'Start Cooking with MealMitra'}
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
