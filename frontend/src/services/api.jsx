import axios from 'axios';

// API temel URL'si
const API_URL = 'http://localhost:3001/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token süresi dolmuşsa logout yap
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Public servisleri
export const publicService = {
  getPublicVehicles: async () => {
    const response = await axios.get(`${API_URL}/reservations/public/vehicles`);
    return response.data;
  },
  getPublicCalendar: async () => {
    const response = await axios.get(`${API_URL}/reservations/public/calendar`);
    return response.data;
  },
};

// Auth servisleri
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Araç servisleri
export const vehicleService = {
  getAllVehicles: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  getVehicleById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },
  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },
  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

// Rezervasyon servisleri
export const reservationService = {
  getAllReservations: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },
  getReservationById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },
  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },
  updateReservation: async (id, reservationData) => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data;
  },
  updateReservationStatus: async (id, statusData) => {
    const response = await api.patch(`/reservations/${id}/status`, statusData);
    return response.data;
  },
  cancelReservation: async (id, notes) => {
    const response = await api.patch(`/reservations/${id}/cancel`, { notes });
    return response.data;
  },
  getAvailableVehicles: async (startDateTime, endDateTime) => {
    const response = await api.get('/reservations/available-vehicles', {
      params: { start_date_time: startDateTime, end_date_time: endDateTime }
    });
    return response.data;
  },
};

export default api;