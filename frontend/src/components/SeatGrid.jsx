import Seat from './Seat.jsx';

const LEGEND = [
  { label: 'Available', className: 'bg-emerald-500' },
  { label: 'Reserved', className: 'bg-amber-400' },
  { label: 'Booked', className: 'bg-rose-500' },
  { label: 'Selected', className: 'bg-blue-600' },
];

/**
 * Renders seats grouped by row letter (A, B, C...).
 */
const SeatGrid = ({ seats, selectedSeats, onToggle }) => {
  // Group seats by their row letter.
  const rows = seats.reduce((acc, seat) => {
    const row = seat.seatNumber[0];
    (acc[row] = acc[row] || []).push(seat);
    return acc;
  }, {});

  const rowKeys = Object.keys(rows).sort();

  return (
    <div className="space-y-6">
      {/* Stage indicator */}
      <div className="mx-auto w-full max-w-lg rounded-lg bg-slate-800 py-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-200">
        Stage / Screen
      </div>

      <div className="space-y-2">
        {rowKeys.map((row) => (
          <div key={row} className="flex items-center gap-28">
            <span className="w-5 text-sm font-bold text-slate-400">{row}</span>
            <div className="flex flex-wrap gap-2">
              {rows[row].map((seat) => (
                <Seat
                  key={seat._id || seat.seatNumber}
                  seat={seat}
                  isSelected={selectedSeats.includes(seat.seatNumber)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-4 text-xs">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded ${item.className}`} />
            <span className="text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
