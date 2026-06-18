import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <span className="text-2xl">🎟️</span> EventTix
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="font-medium text-slate-600 hover:text-indigo-600">
            Events
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-bookings"
                className="font-medium text-slate-600 hover:text-indigo-600"
              >
                My Tickets
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/events/new"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white transition hover:bg-indigo-500"
                >
                  + Create Event
                </Link>
              )}
              <span className="hidden text-slate-500 sm:inline">
                Hi, <span className="font-semibold text-slate-700">{user?.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-900 px-3 py-1.5 font-medium text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-medium text-slate-600 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white transition hover:bg-indigo-500"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
