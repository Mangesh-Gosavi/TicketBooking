import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

/**
 * Guards routes that require authentication. While the session is being
 * restored we show a loader; unauthenticated users are redirected to /login.
 * Pass `adminOnly` to additionally restrict the route to admin users.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Authenticated but not an admin — send back to the events list.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
