import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';

import UserStoresPage from './pages/user/UserStoresPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';

import './styles/global.css';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/update-password" element={<ProtectedRoute><UpdatePasswordPage /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute roles={['admin']}><AdminUserDetailPage /></ProtectedRoute>} />
          <Route path="/admin/stores" element={<ProtectedRoute roles={['admin']}><AdminStoresPage /></ProtectedRoute>} />
          <Route path="/stores" element={<ProtectedRoute roles={['normal_user']}><UserStoresPage /></ProtectedRoute>} />
          <Route path="/owner/dashboard" element={<ProtectedRoute roles={['store_owner']}><OwnerDashboardPage /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<div style={{textAlign:'center',padding:60}}><h2>403 — Unauthorized</h2></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
