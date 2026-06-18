import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEventRequest } from '../services/eventService.js';
import { useToast } from '../context/ToastContext.jsx';

const INITIAL = { name: '', dateTime: '', venue: '', totalSeats: 50 };

const CreateEvent = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalSeats = Number(form.totalSeats);
    if (!Number.isInteger(totalSeats) || totalSeats < 1 || totalSeats > 260) {
      toast.error('Total seats must be a whole number between 1 and 260');
      return;
    }

    setSubmitting(true);
    try {
      const data = await createEventRequest({
        name: form.name.trim(),
        // datetime-local gives "YYYY-MM-DDTHH:mm" which is valid ISO-8601.
        dateTime: form.dateTime,
        venue: form.venue.trim(),
        totalSeats,
      });
      toast.success('Event created! Seats were generated automatically.');
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      toast.error(err.message || 'Could not create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-lg px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Create Event</h1>
        <p className="mb-6 text-sm text-slate-500">
          Seats are generated automatically from the total (rows of 10: A1–A10, B1–…).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Event name
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Coldplay - Music of the Spheres"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Date &amp; time
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              required
              value={form.dateTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Venue</label>
            <input
              type="text"
              name="venue"
              required
              value={form.venue}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Wankhede Stadium, Mumbai"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Total seats (1–260)
            </label>
            <input
              type="number"
              name="totalSeats"
              required
              min={1}
              max={260}
              value={form.totalSeats}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
