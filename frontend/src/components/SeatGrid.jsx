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
      {/* Horizontal scroll wrapper: keeps rows on a single line and lets the
          grid scroll sideways instead of wrapping on narrow screens. */}
      <div className="overflow-x-auto pb-2">
        {/* w-max keeps fixed seat sizes (never shrinks); mx-auto centers the
            grid so it looks identical at every screen width, and the parent
            scrolls horizontally only when the viewport is too narrow. */}
        <div className="mx-auto w-max space-y-6">
          {/* Stage indicator — mirrors a seat row (spacer matching the row
              label) so it starts at the seats, not at the row letters. */}
          <div className="flex items-center gap-6">
            <span className="w-5 shrink-0" aria-hidden="true" />
            <div className="flex-1 rounded-lg bg-slate-800 py-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-200">
              Stage / Screen
            </div>
          </div>

          <div className="space-y-2">
            {rowKeys.map((row) => (
              <div key={row} className="flex items-center gap-6">
                <span className="w-5 shrink-0 text-sm font-bold text-slate-400">{row}</span>
                <div className="flex gap-2">
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
        </div>
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
