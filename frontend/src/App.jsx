import Navbar from './components/Navbar.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

const App = () => (
  <div className="flex min-h-full flex-col">
    <Navbar />
    <main className="flex-1">
      <AppRoutes />
    </main>
    <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
      EventTix · Event Ticket Booking System
    </footer>
  </div>
);

export default App;
