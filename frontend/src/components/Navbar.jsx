import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    toast.info('You have been logged out');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-lg font-bold text-indigo-600"
        >
          <span className="text-2xl">🎟️</span> EventTix
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 text-sm sm:flex">
        {user?.name && (
          <span className="hidden text-slate-500 sm:inline">
            Hi, <span className="font-semibold text-slate-700">{user?.name}</span>
          </span>
          )}
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

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 sm:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="absolute left-0 right-0 top-full mt-px flex flex-col gap-1 border-b border-slate-200 bg-white p-3 text-sm shadow-lg sm:hidden">
            {user?.name && (
              <span className="px-3 py-2 text-slate-500">
                Hi, <span className="font-semibold text-slate-700">{user.name}</span>
              </span>
            )}
            <Link
              to="/"
              onClick={closeMenu}
              className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Events
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Tickets
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/events/new"
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2 font-medium text-indigo-600 hover:bg-slate-100"
                  >
                    + Create Event
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-left font-medium text-white transition hover:bg-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-center font-medium text-white transition hover:bg-indigo-500"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
