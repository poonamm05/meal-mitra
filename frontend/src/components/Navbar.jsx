import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChefHat, Menu, X, LayoutDashboard, UtensilsCrossed, Refrigerator,
  CalendarDays, Bot, Heart, Clock, LogOut, User, ChevronDown, ShieldCheck
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/decide', label: 'Decide Meal', icon: UtensilsCrossed },
  { to: '/ingredients', label: 'My Pantry', icon: Refrigerator },
  { to: '/planner', label: 'Weekly Plan', icon: CalendarDays },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel shadow-soft border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-display font-bold text-xl text-brand-600">Meal</span>
                <span className="font-display font-bold text-xl text-slate-700">Mitra</span>
              </div>
            </Link>

            {/* Desktop nav */}
            {user && (
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive(to)
                        ? 'bg-brand-50 text-brand-600 shadow-sm'
                        : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                    <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100 mb-1 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                            {user.role === 'admin' && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 font-bold hover:bg-rose-50 transition-colors">
                          <ShieldCheck className="w-4 h-4 text-rose-600" /> Admin Control Center
                        </Link>
                      )}

                      <Link to="/favorites" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Heart className="w-4 h-4 text-rose-500" /> Favorites
                      </Link>
                      <Link to="/history" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Clock className="w-4 h-4 text-brand-500" /> Meal History
                      </Link>
                      <Link to="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <User className="w-4 h-4 text-slate-500" /> Profile & Settings
                      </Link>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register"
                    className="px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-sm">
                    Get Started Free
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              {user && (
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && user && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center gap-2.5 p-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl"><span className="text-brand-600">Meal</span><span className="text-slate-700">Mitra</span></span>
            </div>

            {/* Mobile User Profile Header */}
            <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                  {user.role === 'admin' && (
                    <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-rose-50 text-rose-700">
                  <ShieldCheck className="w-5 h-5" /> Admin Control Center
                </Link>
              )}
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive(to) ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <Link to="/favorites" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Heart className="w-5 h-5 text-rose-500" /> Favorites
              </Link>
              <Link to="/history" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Clock className="w-4 h-4 text-brand-500" /> Meal History
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                <User className="w-4 h-4" /> Profile & Settings
              </Link>
            </div>
            <div className="p-3 border-t border-slate-100">
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {profileOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
}
