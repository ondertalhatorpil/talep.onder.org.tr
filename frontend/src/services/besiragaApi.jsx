// frontend/src/services/besiragaApi.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8060/api';
const BESIRAGA_API_URL = `${API_URL}/besiraga`;

// Beşirağa servisleri
export const besiragaService = {
  // PUBLIC - Tüm rezervasyonları getir (Şifresiz)
  getAllReservations: async () => {
    const response = await axios.get(`${BESIRAGA_API_URL}/reservations`);
    return response.data;
  },

  // PUBLIC - Tarih aralığına göre rezervasyonları getir (Şifresiz)
  getReservationsByDateRange: async (startDate, endDate) => {
    const response = await axios.get(`${BESIRAGA_API_URL}/reservations/range`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // ADMIN - Şifre kontrolü
  checkAdminPassword: async (password) => {
    const response = await axios.post(`${BESIRAGA_API_URL}/admin/check-password`, {
      password
    });
    return response.data;
  },

  // ADMIN - Yeni rezervasyon ekle
  createReservation: async (password, reservationData) => {
    const response = await axios.post(
      `${BESIRAGA_API_URL}/admin/reservations`,
      { ...reservationData, password }
    );
    return response.data;
  },

  // ADMIN - Rezervasyon güncelle
  updateReservation: async (password, id, reservationData) => {
    const response = await axios.put(
      `${BESIRAGA_API_URL}/admin/reservations/${id}`,
      { ...reservationData, password }
    );
    return response.data;
  },

  // ADMIN - Rezervasyon sil
  deleteReservation: async (password, id) => {
    const response = await axios.delete(
      `${BESIRAGA_API_URL}/admin/reservations/${id}`,
      { data: { password } }
    );
    return response.data;
  },
};

// Oda bilgileri
export const ROOM_INFO = {
  Yemekhane: { 
    name: 'Yemekhane', 
    capacity: 40, 
    color: '#dc2626',
    image: '/images/besiraga/yemekhane.jpg'
  },
  Atolye: { 
    name: 'Atölye', 
    capacity: 30, 
    color: '#ea580c',
    image: '/images/besiraga/atolye.jpg'
  },
  Cardaklar: { 
    name: 'Çardaklar', 
    capacity: 30, 
    color: '#f59e0b',
    image: '/images/besiraga/cardaklar.jpg'
  },
  Medrese_Sedir: { 
    name: 'Medrese Sedirli Oda', 
    capacity: 15, 
    color: '#ec4899',
    image: '/images/besiraga/medrese-sedir.jpg'
  },
  Cami_Sedir: { 
    name: 'Cami Yanı Sedirli Oda', 
    capacity: 40, 
    color: '#ef4444',
    image: '/images/besiraga/cami-sedir.jpg'
  },
};

export default besiragaService;