import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import RegistroPage from '../features/auth/RegistroPage.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import EstudianteDashboard from '../pages/EstudianteDashboard.jsx';
import ProtectedRoute from '../auth/ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute rol="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/estudiante/*"
        element={
          <ProtectedRoute rol="estudiante">
            <EstudianteDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
