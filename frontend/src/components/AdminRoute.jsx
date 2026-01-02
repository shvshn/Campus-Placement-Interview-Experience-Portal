import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminRoute({ children }) {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname, openLogin: true }}
      />
    );
  }

  if (user?.role !== 'admin') {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ error: 'Access denied. Admin privileges required.' }}
      />
    );
  }

  return children;
}

export default AdminRoute;

