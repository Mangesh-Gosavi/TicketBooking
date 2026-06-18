export const SEATS_PER_ROW = 10;

/**
 * Generate seat numbers for a given seat count.
 * Seats are laid out in rows of 10, labelled A, B, C, ...
 *
 * Example: totalSeats = 50  ->  A1..A10, B1..B10, C1..C10, D1..D10, E1..E10
 * A non-multiple of 10 produces a partial final row (e.g. 23 -> A1..A10, B1..B10, C1..C3).
 *
 * @param {number} totalSeats
 * @returns {string[]} ordered seat numbers
 */
export const generateSeatNumbers = (totalSeats) => {
  if (!Number.isInteger(totalSeats) || totalSeats < 1) {
    throw new Error('totalSeats must be a positive integer');
  }

  const rows = Math.ceil(totalSeats / SEATS_PER_ROW);
  if (rows > 26) {
    // Rows are single letters A–Z, so 260 seats is the supported maximum.
    throw new Error('totalSeats too large: a maximum of 260 seats (rows A–Z) is supported');
  }

  const seatNumbers = [];
  for (let r = 0; r < rows; r += 1) {
    const rowLetter = String.fromCharCode(65 + r); // 65 = 'A'
    const seatsInRow = Math.min(SEATS_PER_ROW, totalSeats - r * SEATS_PER_ROW);
    for (let i = 1; i <= seatsInRow; i += 1) {
      seatNumbers.push(`${rowLetter}${i}`);
    }
  }
  return seatNumbers;
};
