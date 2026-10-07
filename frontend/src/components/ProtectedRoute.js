import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.is_admin) {
    return <Navigate to="/storage" replace />;
  }
  return children;
}
