import { useEffect, useState } from 'react';

/**
 * Counts down to a target time.
 * @param {string|Date|null} expiresAt - ISO string or Date of the deadline.
 * @returns {{ secondsLeft: number, isExpired: boolean, formatted: string }}
 */
const useCountdown = (expiresAt) => {
  const computeRemaining = () => {
    if (!expiresAt) return 0;
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(computeRemaining);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return undefined;
    }

    // Sync immediately, then tick every second.
    setSecondsLeft(computeRemaining());
    const interval = setInterval(() => {
      const remaining = computeRemaining();
      setSecondsLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return {
    secondsLeft,
    isExpired: Boolean(expiresAt) && secondsLeft <= 0,
    formatted: `${minutes}:${seconds}`,
  };
};

export default useCountdown;
