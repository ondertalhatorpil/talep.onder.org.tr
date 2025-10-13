const express = require('express');
const router = express.Router();
const {
  createReservationRequest,
  getPublicApprovedReservations,
  checkTimeSlotAvailability, // YENİ
  getAllRequests,
  updateRequestDetails,
  updateRequestStatus,
  deleteRequest,
  getCapacitySummary // YENİ (Admin için bonus)
} = require('../../controllers/besiragaController/reservationController');

// Middleware'inizi import edin
const { checkBesiragaPassword } = require('../../middleware/besiragaMiddleware/besiragaAuth');

// ===================================================================
//                    PUBLIC ROUTES (Şifresiz Erişim)
// ===================================================================

// Kullanıcı rezervasyon talebi oluşturur
router.post('/requests', createReservationRequest);

// Onaylanmış rezervasyonları görüntüler (Public takvim için)
router.get('/public-reservations', getPublicApprovedReservations);

// ✨ YENİ: Anlık kontenjan kontrolü (Kullanıcı form doldururken)
router.post('/check-availability', checkTimeSlotAvailability);


// ===================================================================
//                    ADMIN ROUTES (Şifreli Erişim)
// ===================================================================

// Tüm talepleri listeler (status'e göre filtrelenebilir)
router.get('/admin/requests', checkBesiragaPassword, getAllRequests);

// Bir talebin detaylarını günceller
router.put('/admin/requests/:id', checkBesiragaPassword, updateRequestDetails);

// Bir talebin durumunu değiştirir (onaylar/reddeder)
router.patch('/admin/requests/:id/status', checkBesiragaPassword, updateRequestStatus);

// Bir talebi kalıcı olarak siler
router.delete('/admin/requests/:id', checkBesiragaPassword, deleteRequest);

// ✨ YENİ: Admin için kontenjan özeti (bonus özellik)
router.get('/admin/capacity-summary', checkBesiragaPassword, getCapacitySummary);


module.exports = router;