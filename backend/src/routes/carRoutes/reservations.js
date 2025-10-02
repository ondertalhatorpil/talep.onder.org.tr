const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  getAvailableVehicles,
  PubliCar,
  PublicCalendar
} = require('../../controllers/carControllers/reservationController');
const { authenticate, isAdmin } = require('../../middleware/auth');

// Public routes (no authentication required)
router.get('/public/vehicles', PubliCar);
router.get('/public/calendar', PublicCalendar);

// Protected routes
// Tüm rezervasyonları getir
router.get('/', authenticate, getAllReservations);

// Kullanılabilir araçları getir
router.get('/available-vehicles', authenticate, getAvailableVehicles);

// Tek bir rezervasyonu ID ile getir
router.get('/:id', authenticate, getReservationById);

// Yeni rezervasyon oluştur
router.post('/', authenticate, createReservation);

// Rezervasyon güncelle
router.put('/:id', authenticate, updateReservation);

// Rezervasyon durumunu güncelle (onaylama/reddetme - sadece admin)
router.patch('/:id/status', authenticate, isAdmin, updateReservationStatus);

// Rezervasyon iptal et
router.patch('/:id/cancel', authenticate, cancelReservation);

// Rezervasyon sil (sadece admin)
router.delete('/:id', authenticate, isAdmin, deleteReservation);

module.exports = router;