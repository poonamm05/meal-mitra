import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WhatToCookPage from './pages/WhatToCookPage';
import UseIngredientsPage from './pages/UseIngredientsPage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import WeeklyPlannerPage from './pages/WeeklyPlannerPage';
import MealHistoryPage from './pages/MealHistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import AiAssistantPage from './pages/AiAssistantPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailsPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/decide" element={<PrivateRoute><WhatToCookPage /></PrivateRoute>} />
          <Route path="/ingredients" element={<PrivateRoute><UseIngredientsPage /></PrivateRoute>} />
          <Route path="/planner" element={<PrivateRoute><WeeklyPlannerPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><MealHistoryPage /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
          <Route path="/ai-assistant" element={<PrivateRoute><AiAssistantPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Admin Protected Route */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
