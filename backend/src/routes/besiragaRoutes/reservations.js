// backend/routes/besiragaRoutes/reservations.js
const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservationsByDateRange,
  createReservation,
  updateReservation,
  deleteReservation,
  checkAdminPassword
} = require('../../controllers/besiragaController/reservationController');
const { checkBesiragaPassword } = require('../../middleware/besiragaMiddleware/besiragaAuth');

// PUBLIC ROUTES (Şifresiz - Herkes görebilir)
router.get('/reservations', getAllReservations);
router.get('/reservations/range', getReservationsByDateRange);

// ADMIN ROUTES (Şifreli)
router.post('/admin/check-password', checkBesiragaPassword, checkAdminPassword);
router.post('/admin/reservations', checkBesiragaPassword, createReservation);
router.put('/admin/reservations/:id', checkBesiragaPassword, updateReservation);
router.delete('/admin/reservations/:id', checkBesiragaPassword, deleteReservation);

module.exports = router;