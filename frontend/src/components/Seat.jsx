/**
 * A single seat button.
 * Color coding:
 *   available -> green, reserved -> yellow, booked -> red, selected -> blue
 */
const STATUS_STYLES = {
  available: 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer',
  reserved: 'bg-amber-400 text-amber-900 cursor-not-allowed',
  booked: 'bg-rose-500 text-white cursor-not-allowed',
  selected: 'bg-blue-600 text-white ring-2 ring-blue-300 cursor-pointer',
};

const Seat = ({ seat, isSelected, onToggle }) => {
  const visualStatus = isSelected ? 'selected' : seat.status;
  const isClickable = seat.status === 'available';

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={() => isClickable && onToggle(seat.seatNumber)}
      title={`${seat.seatNumber} — ${seat.status}`}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold shadow-sm transition disabled:opacity-90 ${STATUS_STYLES[visualStatus]}`}
    >
      {seat.seatNumber}
    </button>
  );
};

export default Seat;
