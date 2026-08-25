import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  const handleDemo = async (persona) => {
    setError('');
    const res = await demoLogin(persona);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-8 overflow-hidden relative">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-3 shadow-glow">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your MealMitra companion</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-500 text-white font-semibold shadow-glow hover:bg-brand-600 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Instant Demo Persona Logins */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Or 1-Click Instant Demo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('bachelor')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-xs font-medium text-slate-700 flex flex-col items-center gap-1 transition-all group"
              >
                <span className="text-lg">🧑</span>
                <span className="group-hover:text-brand-600">Bachelor</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('family')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-xs font-medium text-slate-700 flex flex-col items-center gap-1 transition-all group"
              >
                <span className="text-lg">👨‍👩‍👧</span>
                <span className="group-hover:text-brand-600">Family</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('working_professional')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-xs font-medium text-slate-700 flex flex-col items-center gap-1 transition-all group"
              >
                <span className="text-lg">💼</span>
                <span className="group-hover:text-brand-600">Working Pro</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
