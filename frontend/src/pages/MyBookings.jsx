import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookingsRequest } from '../services/reservationService.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

const MyBookings = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getMyBookingsRequest();
        if (active) setBookings(data.bookings);
      } catch (err) {
        toast.error(err.message || 'Failed to load your bookings');
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

  if (loading) return <Loader label="Loading your tickets..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">My Tickets</h1>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">You haven&apos;t booked any tickets yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-500"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            // eventId is populated to an object; fall back gracefully if the
            // event was since deleted.
            const event = booking.eventId || {};
            return (
              <div
                key={booking._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {event.name || 'Event no longer available'}
                  </h2>
                  {event.venue && <p className="text-sm text-slate-500">📍 {event.venue}</p>}
                  {event.dateTime && (
                    <p className="text-sm text-slate-500">🗓️ {formatDate(event.dateTime)}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Booked on {formatDate(booking.bookedAt)}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Seats</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 sm:justify-end">
                    {booking.seatNumbers.map((seat) => (
                      <span
                        key={seat}
                        className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
