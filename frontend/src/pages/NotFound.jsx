import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto mt-20 max-w-md px-4 text-center">
    <h1 className="text-6xl font-bold text-indigo-600">404</h1>
    <p className="mt-2 text-lg text-slate-600">Page not found</p>
    <Link
      to="/"
      className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-500"
    >
      Back to Events
    </Link>
  </div>
);

export default NotFound;
