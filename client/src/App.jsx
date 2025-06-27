import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
// import ProfilePage from './pages/profile/ProfilePage';
import LobbyPage from './pages/game/LobbyPage';
import GamePlayPage from './pages/game/GamePlayPage';
import GameResultsPage from './pages/game/GameResultsPage';
// import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Planetfall...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
        <Route path="/lobby/:id" element={<LobbyPage />} />
      </Route>
      
      <Route path="/play/:id" element={
        <ProtectedRoute>
          <GamePlayPage />
        </ProtectedRoute>
      } />
      <Route path="/results/:id" element={
        <ProtectedRoute>
          <GameResultsPage />
        </ProtectedRoute>
      } />
      
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;