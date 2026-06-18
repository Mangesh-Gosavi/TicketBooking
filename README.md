# 🎟️ Event Ticket Booking System (MERN)

A simplified, production-style event ticket booking platform built with the **MERN** stack. Users browse events, view a live seat map, **reserve** seats for 10 minutes (held with a countdown timer), and **confirm a booking** before the hold expires.

The core engineering focus is **safe concurrency**: two users can never reserve or book the same seat, enforced with **MongoDB multi-document transactions** and atomic conditional updates.

---

## ✨ Features

- **JWT authentication** — register/login, bcrypt-hashed passwords, protected routes.
- **Event catalogue** — list events and view a single event with its full seat map.
- **Seat reservation** — atomic, transaction-backed seat holds (10-minute TTL).
- **Booking confirmation** — converts a valid (non-expired) reservation into a booking.
- **Double-booking prevention** — MongoDB sessions + transactions + conditional updates.
- **Automatic expiry** — MongoDB TTL index deletes expired reservations, paired with a background sweeper that releases their seats (`reserved → available`); booking also validates expiry explicitly.
- **Modern responsive UI** — React + Tailwind, color-coded seat grid, live countdown, toast notifications, loading states.
- **Clean architecture** — controllers / models / routes / middleware / utils, centralized error handling, async/await throughout.

---

## 🧱 Tech Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Backend   | Node.js, Express.js, MongoDB, Mongoose                  |
| Auth      | JWT (`jsonwebtoken`), `bcryptjs`                        |
| Validation| `express-validator`                                     |
| Frontend  | React 18, Vite, React Router v6, Context API, Fetch     |
| Styling   | Tailwind CSS                                            |

---

## 📁 Project Structure

```
Ticket-Booking/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # register / login / me
│   │   ├── eventController.js     # list events / event + seats
│   │   ├── reservationController.js  # transaction-based seat reservation
│   │   └── bookingController.js   # transaction-based booking confirmation
│   ├── middleware/
│   │   ├── authMiddleware.js      # verifyToken (Bearer JWT)
│   │   ├── errorMiddleware.js     # notFound + central error handler
│   │   └── validate.js            # express-validator result handler
│   ├── models/
│   │   ├── User.js                # name, email, password (hashed)
│   │   ├── Event.js               # name, dateTime, venue, totalSeats
│   │   ├── Seat.js                # eventId, seatNumber, status
│   │   ├── Reservation.js         # userId, eventId, seatNumbers, expiresAt (TTL)
│   │   └── Booking.js             # userId, eventId, seatNumbers, bookedAt
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── reservationRoutes.js
│   │   └── bookingRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js        # async error wrapper
│   │   ├── generateToken.js       # JWT signing
│   │   ├── ApiError.js            # operational error with status code
│   │   └── seatGenerator.js       # derive seat numbers from totalSeats
│   ├── services/
│   │   └── eventService.js        # create event + auto-generate seats (txn)
│   ├── app.js                     # express app + middleware + routes
│   ├── server.js                  # entry point (connect DB + listen)
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── SeatGrid.jsx
    │   │   ├── Seat.jsx
    │   │   ├── CountdownTimer.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Loader.jsx
    │   ├── pages/
    │   │   ├── Events.jsx
    │   │   ├── EventDetails.jsx
    │   │   ├── CreateEvent.jsx        # admin-only event creation form
    │   │   ├── MyBookings.jsx         # logged-in user's booked tickets
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── NotFound.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── ReservationContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── services/
    │   │   ├── api.js             # fetch wrapper + token helpers
    │   │   ├── authService.js
    │   │   ├── eventService.js
    │   │   └── reservationService.js
    │   ├── hooks/
    │   │   └── useCountdown.js
    │   ├── routes/
    │   │   └── AppRoutes.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── package.json
```

---

## ✅ Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running as a **replica set** (required for transactions).

> ⚠️ **Transactions need a replica set.** A plain standalone `mongod` will throw
> `Transaction numbers are only allowed on a replica set member or mongos`.
> Use one of:
> - **MongoDB Atlas** (free tier is already a replica set), or
> - A local single-node replica set:
>   ```bash
>   mongod --replSet rs0 --dbpath /your/data/path
>   # then once, in mongosh:
>   rs.initiate()
>   ```

---

## 🚀 Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit values (Windows: copy .env.example .env)
npm run dev                 # starts on http://localhost:5000
```

> The database starts **empty** — there is no seed step. Create events through
> the authenticated `POST /api/events` endpoint (see below); seats are generated
> automatically from `totalSeats`. With no events, the frontend simply shows
> "No events available."

**Backend `.env`:**

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/ticket-booking?replicaSet=rs0
JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRES_IN=7d
RESERVATION_TTL_MINUTES=10
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # optional; leave VITE_API_BASE_URL empty to use the dev proxy
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so no CORS setup is needed in development.

Open **http://localhost:5173**, register an account, pick an event, select green seats, **Reserve**, watch the countdown, then **Confirm Booking**.

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint         | Body                              | Auth | Description              |
| ------ | ---------------- | --------------------------------- | ---- | ------------------------ |
| POST   | `/auth/register` | `{ name, email, password }`       | No   | Create account, get JWT  |
| POST   | `/auth/login`    | `{ email, password }`             | No   | Log in, get JWT          |
| GET    | `/auth/me`       | —                                 | Yes  | Current user             |

### Events

| Method | Endpoint      | Auth | Description                                       |
| ------ | ------------- | ---- | ------------------------------------------------ |
| GET    | `/events`     | No   | List all events                                  |
| GET    | `/events/:id` | No   | Event details **+ seat information**             |
| POST   | `/events`     | **Admin** | Create an event; **seats auto-generated** from `totalSeats` |

Create an event (admin only; seats are generated automatically — no seed files):

```
POST /api/events
Authorization: Bearer <token>

{ "name": "Coldplay Live", "dateTime": "2026-08-15T19:30:00", "venue": "Wankhede Stadium", "totalSeats": 50 }
```

`totalSeats: 50` generates seats `A1–A10, B1–B10, C1–C10, D1–D10, E1–E10`
(rows of 10; supported range 1–260).

### Reservation (protected)

```
POST /api/reserve
Authorization: Bearer <token>

{ "eventId": "...", "seatNumbers": ["A1", "A2"] }
```

Response:

```json
{
  "success": true,
  "reservationId": "...",
  "eventId": "...",
  "seatNumbers": ["A1", "A2"],
  "expiresAt": "2026-06-18T12:10:00.000Z"
}
```

### Cancel reservation (protected)

```
DELETE /api/reservations/:reservationId
Authorization: Bearer <token>
```

Releases the reservation's seats (`reserved → available`) and deletes the
reservation atomically. Returns `{ success, message, seatNumbers }`.

### Booking (protected)

```
POST /api/bookings
Authorization: Bearer <token>

{ "reservationId": "..." }
```

Response:

```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "booking": { "id": "...", "eventId": "...", "seatNumbers": ["A1", "A2"], "bookedAt": "..." }
}
```

Confirming a booking also persists a **Booking** record for the user and deletes
the reservation — all in the same transaction.

### My bookings (protected)

```
GET /api/bookings
Authorization: Bearer <token>
```

Returns the logged-in user's bookings (most recent first), each with its event
details populated (`name`, `venue`, `dateTime`). Shown on the frontend
**"My Tickets"** page (`/my-bookings`).

All error responses share the shape:

```json
{ "success": false, "message": "Human-readable error" }
```

---

## 🔐 How Double-Booking Is Prevented

The reservation flow runs inside a **MongoDB transaction** using a Mongoose session
(`startSession()` + `session.withTransaction()`):

1. **Atomic conditional update** — every requested seat is flipped from
   `available → reserved` with a single `updateMany` that filters on
   `status: 'available'`. A seat already taken simply won't match.
2. **Count check** — if `modifiedCount !== requestedSeats.length`, at least one
   seat was grabbed by someone else, so we **throw**, which **aborts** the entire
   transaction. No partial reservations, no overwrites.
3. **Commit** — only if all seats were claimed does the reservation document get
   created and the transaction commit.

Because the seat-status flip and the count check happen atomically within the
transaction, two concurrent requests for the same seat cannot both succeed — one
commits, the other aborts with a `409 Conflict`.

Booking confirmation uses the same pattern: `reserved → booked` is applied
conditionally (matching the reservation id), the reservation is deleted, and the
whole thing commits or aborts as a unit.

---

## ⏱️ Reservation Expiry & Cancellation

A **TTL index** is used on `Reservation.expiresAt` (`expireAfterSeconds: 0`), but
because a TTL index can *only* delete the reservation document — it can never
flip the linked seats from `reserved → available` — it is paired with a cleanup
sweeper that handles seat release. Together they guarantee correctness:

1. **TTL index** (`models/Reservation.js`) — MongoDB auto-deletes expired
   reservation documents, so stale records never accumulate (even if the app is
   down).
2. **Background cleanup sweeper** (`services/reservationCleanup.js`, started in
   `server.js`) — runs every 60s. It releases seats (`reserved → available`) for
   expired reservations **inside a transaction**, and self-heals *orphaned* seats
   whose reservation was already removed by the TTL index.
3. **`DELETE /api/reservations/:reservationId`** — manual cancellation. Releases
   the reservation's seats and deletes it atomically.
4. **Explicit check at booking time** — the booking controller verifies
   `Date.now() < expiresAt`; if expired it releases the seats, deletes the
   reservation, and returns `410 Gone`.

On the frontend, a `useCountdown` hook drives a live `MM:SS` timer. **Cancel
Reservation** calls the DELETE endpoint; when the timer hits zero the app calls
the same endpoint (best-effort) and shows "Reservation expired." — and even if
that call is missed, the sweeper releases the seats within ~60s.

> **Upgrading an existing database:** if a previous version left a *non-TTL*
> `expiresAt_1` index, drop it once so Mongoose can recreate it as a TTL index:
> `db.reservations.dropIndex("expiresAt_1")` then restart the backend.

---

## 🎨 Seat Color Coding

| Color   | Meaning   |
| ------- | --------- |
| 🟢 Green  | Available |
| 🟡 Yellow | Reserved  |
| 🔴 Red    | Booked    |
| 🔵 Blue   | Selected  |

---

## 🌱 Populating Data (No Seed Files)

There is **no seed script** — the app is entirely database-driven. Events are
created by **admins** through the **"Create Event"** page in the UI (or the
authenticated `POST /api/events` endpoint). Seat documents are generated
automatically from `totalSeats` (rows of 10: A1–A10, B1–B10, …) inside the same
transaction as the event, so an event always has its seats. An empty database is
a valid state: the frontend shows "No events available."

### Becoming an admin

Only users with `role: 'admin'` can create events. To create your first admin,
add their email to `ADMIN_EMAILS` (comma-separated) in `backend/.env` **before
registering** that account:

```env
ADMIN_EMAILS=admin@example.com,you@example.com
```

Any email listed there is promoted to `admin` automatically on registration.
(You can also flip an existing user in `mongosh`:
`db.users.updateOne({ email: 'x@y.com' }, { $set: { role: 'admin' } })`.)

Once logged in as an admin, a **"+ Create Event"** button appears in the navbar
→ fill the form (name, date/time, venue, total seats) → seats are generated and
you're redirected to the new event.

---

## 🧪 Quick Manual Test (curl)

```bash
# Register (returns a JWT token)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@test.com","password":"secret123"}'

# Create an event (seats auto-generated). Use the token from register/login.
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Coldplay Live","dateTime":"2026-08-15T19:30:00","venue":"Wankhede Stadium","totalSeats":50}'

# Reserve (use the token + a real eventId from GET /api/events)
curl -X POST http://localhost:5000/api/reserve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"eventId":"<EVENT_ID>","seatNumbers":["A1","A2"]}'

# Book
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"reservationId":"<RESERVATION_ID>"}'
```

---

## 🛡️ Security & Quality Notes

- Passwords hashed with bcrypt; password hash never serialized (`select: false`).
- JWT required on reservation/booking routes via `verifyToken` middleware.
- Input validated with `express-validator` on auth, reserve, and booking routes.
- Centralized error middleware normalizes Mongoose/JWT/duplicate-key errors.
- CORS restricted to the configured `CLIENT_URL`.
- `.env` is git-ignored; only `.env.example` is committed.

---

## 📦 Available Scripts

**Backend** (`backend/`)
- `npm run dev` — start with nodemon
- `npm start` — start (production)

**Frontend** (`frontend/`)
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the build

---

## 📝 License

MIT — for assignment / educational use.
