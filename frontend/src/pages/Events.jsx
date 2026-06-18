import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEventsRequest } from '../services/eventService.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const Events = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getEventsRequest();
        if (active) setEvents(data.events);
      } catch (err) {
        if (active) setError(err.message);
        toast.error(err.message || 'Failed to load events');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader label="Loading events..." />;

  if (error) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-lg bg-rose-50 p-6 text-center text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Upcoming Events</h1>

      {events.length === 0 ? (
        <p className="text-slate-500">No events available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event._id}
              to={`/events/${event._id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-5xl">
                🎤
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-indigo-600">
                  {event.name}
                </h2>
                <p className="mb-1 text-sm text-slate-500">📍 {event.venue}</p>
                <p className="mb-4 text-sm text-slate-500">🗓️ {formatDate(event.dateTime)}</p>
                <span className="mt-auto inline-block rounded-lg bg-indigo-50 px-3 py-1.5 text-center text-sm font-semibold text-indigo-600">
                  {event.totalSeats} seats · View &amp; Book →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
