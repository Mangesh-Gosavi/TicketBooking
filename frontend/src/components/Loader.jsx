const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600" />
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

export default Loader;
