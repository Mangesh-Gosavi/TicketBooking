import { Routes, Route } from 'react-router-dom';
import Events from '../pages/Events.jsx';
import EventDetails from '../pages/EventDetails.jsx';
import CreateEvent from '../pages/CreateEvent.jsx';
import MyBookings from '../pages/MyBookings.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import NotFound from '../pages/NotFound.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Events />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/events/new"
      element={
        <ProtectedRoute adminOnly>
          <CreateEvent />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-bookings"
      element={
        <ProtectedRoute>
          <MyBookings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/events/:id"
      element={
        <ProtectedRoute>
          <EventDetails />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
