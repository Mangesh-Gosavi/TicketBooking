import { createContext, useContext, useState } from 'react';

const ReservationContext = createContext(null);

/**
 * Holds the active reservation (id, seats, expiry) so it can be shared across
 * the seat grid, countdown timer, and booking button on the Event Details page.
 */
export const ReservationProvider = ({ children }) => {
  const [reservation, setReservation] = useState(null);

  const startReservation = (data) => setReservation(data);
  const clearReservation = () => setReservation(null);

  const value = { reservation, startReservation, clearReservation };

  return (
    <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservation must be used within a ReservationProvider');
  return ctx;
};
