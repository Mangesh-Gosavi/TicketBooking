import { useEffect, useRef } from 'react';
import useCountdown from '../hooks/useCountdown.js';

/**
 * Displays a live MM:SS countdown to `expiresAt` and notifies the parent
 * when it reaches zero via onExpire (fired exactly once).
 */
const CountdownTimer = ({ expiresAt, onExpire }) => {
  const { formatted, isExpired, secondsLeft } = useCountdown(expiresAt);
  const firedRef = useRef(false);

  // Reset the "fired" guard whenever a new reservation starts.
  useEffect(() => {
    firedRef.current = false;
  }, [expiresAt]);

  useEffect(() => {
    if (isExpired && !firedRef.current) {
      firedRef.current = true;
      onExpire?.();
    }
  }, [isExpired, onExpire]);

  const isUrgent = secondsLeft <= 60 && !isExpired;

  if (isExpired) {
    return (
      <div className="rounded-lg bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700">
        Reservation expired
      </div>
    );
  }

  return (
    <div className={`rounded-lg px-4 py-3 text-center ${isUrgent ? 'bg-rose-50' : 'bg-amber-50'}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Reservation expires in
      </p>
      <p
        className={`font-mono text-3xl font-bold ${
          isUrgent ? 'text-rose-600' : 'text-amber-600'
        }`}
      >
        {formatted}
      </p>
    </div>
  );
};

export default CountdownTimer;
