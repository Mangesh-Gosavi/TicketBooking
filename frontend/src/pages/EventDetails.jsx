import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventByIdRequest } from '../services/eventService.js';
import {
  reserveSeatsRequest,
  createBookingRequest,
  cancelReservationRequest,
} from '../services/reservationService.js';
import { useToast } from '../context/ToastContext.jsx';
import { useReservation } from '../context/ReservationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';
import Loader from '../components/Loader.jsx';

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });

const EventDetails = () => {
  const { id } = useParams();
  const toast = useToast();
  const { user } = useAuth();
  const { reservation, startReservation, clearReservation } = useReservation();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [expired, setExpired] = useState(false);

  // Is the active reservation (from context) for THIS event?
  const activeReservation =
    reservation && reservation.eventId === id ? reservation : null;

  // Track the live reservation id in a ref so the expiry handler (which fires
  // from a timer effect) always sees the current value, never a stale closure.
  const reservationIdRef = useRef(null);
  useEffect(() => {
    reservationIdRef.current = activeReservation?.reservationId || null;
  }, [activeReservation]);

  const fetchEvent = useCallback(async () => {
    try {
      const data = await getEventByIdRequest(id);
      setEvent(data.event);
      setSeats(data.seats);
    } catch (err) {
      toast.error(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const toggleSeat = (seatNumber) => {
    if (activeReservation) return; // lock selection once reserved
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) {
      toast.info('Please select at least one seat');
      return;
    }
    setReserving(true);
    try {
      const data = await reserveSeatsRequest({ eventId: id, seatNumbers: selectedSeats });
      startReservation({
        reservationId: data.reservationId,
        eventId: id,
        seatNumbers: data.seatNumbers,
        expiresAt: data.expiresAt,
      });
      setExpired(false);
      toast.success(`Reserved ${data.seatNumbers.join(', ')}. Confirm within the timer!`);
      await fetchEvent(); // refresh grid -> seats now yellow
    } catch (err) {
      toast.error(err.message || 'Could not reserve seats');
      await fetchEvent(); // re-sync in case seats changed
    } finally {
      setReserving(false);
    }
  };

  const handleBooking = async () => {
    if (!activeReservation || expired) return;
    setBooking(true);
    try {
      await createBookingRequest(activeReservation.reservationId);
      toast.success('🎉 Booking confirmed! Enjoy the event.');
      clearReservation();
      setSelectedSeats([]);
      setExpired(false);
      await fetchEvent(); // refresh grid -> seats now red
    } catch (err) {
      toast.error(err.message || 'Booking failed');
      if (err.status === 410) {
        // expired/gone — reset
        clearReservation();
        setExpired(true);
      }
      await fetchEvent();
    } finally {
      setBooking(false);
    }
  };

  // Manual cancel: tell the backend to release the seats, then reset locally.
  const handleCancelReservation = async () => {
    if (!activeReservation) return;
    setCancelling(true);
    try {
      await cancelReservationRequest(activeReservation.reservationId);
      toast.success('Reservation cancelled. Seats released.');
    } catch (err) {
      // 404 => already released (e.g. just swept after expiry); treat as success.
      if (err.status !== 404) {
        toast.error(err.message || 'Could not cancel reservation');
      }
    } finally {
      clearReservation(); // unmounts the countdown -> timer stops
      setSelectedSeats([]);
      setExpired(false);
      await fetchEvent(); // refresh seat grid
      setCancelling(false);
    }
  };

  // Timer hit zero: release seats immediately (best-effort), show expired message.
  const handleExpire = useCallback(async () => {
    setExpired(true);
    const reservationId = reservationIdRef.current;
    try {
      if (reservationId) await cancelReservationRequest(reservationId);
    } catch {
      // Ignore: the backend cleanup sweeper is the guaranteed safety net.
    }
    toast.error('Reservation expired.');
    clearReservation();
    setSelectedSeats([]);
    await fetchEvent(); // refresh seat grid -> seats now green again
  }, [clearReservation, fetchEvent, toast]);

  if (loading) return <Loader label="Loading event..." />;
  if (!event) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Event header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="mt-2 opacity-90">📍 {event.venue}</p>
        <p className="opacity-90">🗓️ {formatDate(event.dateTime)}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Seat grid — min-w-0 lets this grid column shrink below the seat
            grid's intrinsic width so the horizontal scroll stays contained
            inside the card instead of overflowing the whole page. */}
        <div className="min-w-0 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Select your seats</h2>
            <SeatGrid
              seats={seats}
              selectedSeats={
                activeReservation ? activeReservation.seatNumbers : selectedSeats
              }
              onToggle={toggleSeat}
            />
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Your Order</h2>

            {!user && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Please log in to reserve and book seats.
              </p>
            )}

            <div>
              <p className="text-sm text-slate-500">Selected seats</p>
              <p className="font-semibold text-slate-800">
                {(activeReservation
                  ? activeReservation.seatNumbers
                  : selectedSeats
                ).join(', ') || '—'}
              </p>
            </div>

            {/* Countdown when a reservation is active */}
            {activeReservation && !expired && (
              <CountdownTimer
                expiresAt={activeReservation.expiresAt}
                onExpire={handleExpire}
              />
            )}

            {expired && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700">
                Reservation expired. Please select seats again.
              </div>
            )}

            {/* Action buttons */}
            {!activeReservation ? (
              <button
                onClick={handleReserve}
                disabled={reserving || selectedSeats.length === 0 || !user}
                className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reserving ? 'Reserving...' : 'Reserve Seats'}
              </button>
            ) : (
              <button
                onClick={handleBooking}
                disabled={booking || expired}
                className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking ? 'Confirming...' : 'Confirm Booking'}
              </button>
            )}

            {activeReservation && !expired && (
              <button
                onClick={handleCancelReservation}
                disabled={cancelling}
                className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
