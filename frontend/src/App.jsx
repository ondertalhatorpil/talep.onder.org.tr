import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayount';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleForm from './pages/VehicleForm';
import Reservations from './pages/Reservations/Reservations';
import ReservationForm from './pages/ReservationForm';
import CalendarView from './pages/CalendarView';
import NotFound from './pages/NotFound';
import PublicCalendar from './pages/PublicCalendar';
import ReservationSuccess from './pages/ReservationSuccess';


// Protected Route bileşeni
const ProtectedRoute = ({ children }) => {
  const { user, token, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuth]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Admin Route bileşeni
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/public-calendar" element={<PublicCalendar />} />

        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="vehicles" element={<Vehicles />} />
          <Route
            path="vehicles/new"
            element={
              <AdminRoute>
                <VehicleForm />
              </AdminRoute>
            }
          />
          <Route
            path="vehicles/:id"
            element={
              <AdminRoute>
                <VehicleForm />
              </AdminRoute>
            }
          />

          <Route path="reservations" element={<Reservations />} />
          <Route path="reservations/new" element={<ReservationForm />} />
          <Route path="reservations/:id" element={<ReservationForm />} />
          <Route path="rezervation-succsess" element={<ReservationSuccess />} />
          <Route path="calendar" element={<CalendarView />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;