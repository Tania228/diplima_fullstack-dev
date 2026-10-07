import { Route, Routes } from 'react-router-dom';
import { AdminRoute, PrivateRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import StoragePage from './pages/StoragePage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/storage" element={<PrivateRoute><StoragePage /></PrivateRoute>} />
        <Route path="/storage/:userId" element={<PrivateRoute><StoragePage /></PrivateRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
