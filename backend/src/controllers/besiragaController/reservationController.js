const db = require('../../config/db');

// ===================================================================
//                     KONTENJAN KONTROL FONKSİYONU
// ===================================================================

/**
 * @desc    Belirli bir saat aralığında mevcut kişi sayısını ve kalan kontenjanlı hesaplar
 * @route   POST /api/besiraga/check-availability
 * @access  Public (Kullanıcılar anlık kontrol için kullanacak)
 */
const checkTimeSlotAvailability = async (req, res) => {
  try {
    const { start_datetime, end_datetime, participant_count } = req.body;

    if (!start_datetime || !end_datetime || !participant_count) {
      return res.status(400).json({ 
        success: false, 
        message: 'Başlangıç, bitiş zamanı ve katılımcı sayısı gerekli.' 
      });
    }

    // Sadece ONAYLANMIŞ rezervasyonların toplam kişi sayısını hesapla
    const [approvedReservations] = await db.query(
      `SELECT COALESCE(SUM(participant_count), 0) as total_participants
       FROM reservation_requests
       WHERE status = 'approved'
       AND (
         (start_datetime < ? AND end_datetime > ?) OR
         (start_datetime >= ? AND start_datetime < ?)
       )`,
      [end_datetime, start_datetime, start_datetime, end_datetime]
    );

    const currentApproved = parseInt(approvedReservations[0].total_participants) || 0;
    const requestedCount = parseInt(participant_count);
    const maxCapacity = 100;
    const remainingCapacity = maxCapacity - currentApproved;
    const isAvailable = (currentApproved + requestedCount) <= maxCapacity;

    res.json({
      success: true,
      data: {
        current_approved: currentApproved,
        requested_count: requestedCount,
        total_if_approved: currentApproved + requestedCount,
        max_capacity: maxCapacity,
        remaining_capacity: remainingCapacity,
        is_available: isAvailable,
        message: isAvailable 
          ? `Müsait! ${remainingCapacity} kişilik kontenjan kaldı.`
          : `Kontenjan yetersiz! Sadece ${remainingCapacity} kişilik yer kaldı.`
      }
    });

  } catch (error) {
    console.error('Kontenjan kontrolü hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};


// ===================================================================
//                     KULLANICI TALEP OLUŞTURMA
// ===================================================================

const createReservationRequest = async (req, res) => {
  try {
    const {
      room_name,
      start_datetime,
      end_datetime,
      participant_count,
      contact_name,
      contact_phone,
      organization_name,
      user_notes
    } = req.body;

    // Gerekli alanların kontrolü
    if (!room_name || !start_datetime || !end_datetime || !participant_count || !contact_name || !contact_phone) {
      return res.status(400).json({ success: false, message: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    // ÖNEMLİ: Kullanıcı talep oluştururken sadece ONAYLANMIŞ rezervasyonları kontrol et
    const [approvedReservations] = await db.query(
      `SELECT COALESCE(SUM(participant_count), 0) as total_participants
       FROM reservation_requests
       WHERE status = 'approved'
       AND (
         (start_datetime < ? AND end_datetime > ?) OR
         (start_datetime >= ? AND start_datetime < ?)
       )`,
      [end_datetime, start_datetime, start_datetime, end_datetime]
    );

    const currentApproved = parseInt(approvedReservations[0].total_participants) || 0;
    const requestedCount = parseInt(participant_count);
    const maxCapacity = 100;

    if (currentApproved + requestedCount > maxCapacity) {
      const remaining = maxCapacity - currentApproved;
      return res.status(409).json({ 
        success: false, 
        message: `Bu saat dilimi için kontenjan yetersiz! Sadece ${remaining} kişilik yer kaldı.`,
        data: {
          current_approved: currentApproved,
          remaining_capacity: remaining,
          requested: requestedCount
        }
      });
    }

    const [result] = await db.query(
      `INSERT INTO reservation_requests (
        room_name, start_datetime, end_datetime, participant_count, contact_name, 
        contact_phone, organization_name, user_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [room_name, start_datetime, end_datetime, participant_count, contact_name, contact_phone, organization_name, user_notes]
    );

    res.status(201).json({
      success: true,
      message: 'Rezervasyon talebiniz başarıyla alınmıştır. Onay sürecinden sonra size geri dönüş yapılacaktır.',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Rezervasyon talebi oluşturma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin.' });
  }
};


const getPublicApprovedReservations = async (req, res) => {
  try {
    const [reservations] = await db.query(
      `SELECT id, room_name, organization_name, start_datetime, end_datetime, participant_count
       FROM reservation_requests 
       WHERE status = 'approved' AND end_datetime >= NOW()
       ORDER BY start_datetime ASC`
    );
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error('Public rezervasyonları getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};


// =============================================
// ADMIN - Şifre Korumalı Yönetim Fonksiyonları
// =============================================

/**
 * @desc    Admin paneli için tüm talepleri getirir. Duruma göre filtrelenebilir.
 * @route   GET /api/admin/requests?status=pending
 */
const getAllRequests = async (req, res) => {
  try {
    let query = 'SELECT * FROM reservation_requests';
    const params = [];
    if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
      query += ' WHERE status = ?';
      params.push(req.query.status);
    }
    query += ' ORDER BY created_at DESC';
    
    const [requests] = await db.query(query, params);
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Tüm talepleri getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

/**
 * @desc    Adminin bir talebin saatini, kişi sayısını vb. detaylarını düzenlemesini sağlar.
 * @route   PUT /api/admin/requests/:id
 */
const updateRequestDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_name, start_datetime, end_datetime, participant_count, contact_name, contact_phone, organization_name, user_notes, admin_notes } = req.body;
        
        await db.query(
            `UPDATE reservation_requests SET 
                room_name = ?, start_datetime = ?, end_datetime = ?, participant_count = ?, 
                contact_name = ?, contact_phone = ?, organization_name = ?, user_notes = ?, admin_notes = ? 
            WHERE id = ?`,
            [room_name, start_datetime, end_datetime, participant_count, contact_name, contact_phone, organization_name, user_notes, admin_notes, id]
        );

        res.json({ success: true, message: 'Rezervasyon detayları başarıyla güncellendi.' });
    } catch (error) {
        console.error('Rezervasyon güncelleme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * @desc    Bir talebin durumunu değiştirir (Onaylama / Reddetme).
 * HİBRİT KONTROL: Admin onaylarken hem APPROVED hem PENDING talepleri kontrol eder.
 * @route   PATCH /api/admin/requests/:id/status
 */
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum bilgisi.' });
    }

    // Eğer bir talep ONAYLANIYORSA, HİBRİT KONTROL yap
    if (status === 'approved') {
      const [requestToApprove] = await db.query(
        'SELECT room_name, start_datetime, end_datetime, participant_count FROM reservation_requests WHERE id = ?', 
        [id]
      );
      
      if (requestToApprove.length === 0) {
        return res.status(404).json({ success: false, message: 'Onaylanacak talep bulunamadı.' });
      }
      
      const { room_name, start_datetime, end_datetime, participant_count } = requestToApprove[0];
      const maxCapacity = 100;

      // HİBRİT KONTROL: Admin için hem APPROVED hem PENDING talepleri say
      const [existingReservations] = await db.query(
        `SELECT COALESCE(SUM(participant_count), 0) as total_participants
         FROM reservation_requests
         WHERE status IN ('approved', 'pending') AND id != ?
         AND (
           (start_datetime < ? AND end_datetime > ?) OR
           (start_datetime >= ? AND start_datetime < ?)
         )`,
        [id, end_datetime, start_datetime, start_datetime, end_datetime]
      );

      const currentTotal = parseInt(existingReservations[0].total_participants) || 0;
      const requestedCount = parseInt(participant_count);
      const totalIfApproved = currentTotal + requestedCount;

      if (totalIfApproved > maxCapacity) {
        const remaining = maxCapacity - currentTotal;
        return res.status(409).json({ 
          success: false, 
          message: `Bu saat diliminde kontenjan yetersiz! Mevcut: ${currentTotal} kişi (onaylı + bekleyen), Talep: ${requestedCount} kişi, Limit: ${maxCapacity} kişi. Sadece ${remaining} kişilik yer kaldı.`,
          data: {
            current_total: currentTotal,
            requested: requestedCount,
            max_capacity: maxCapacity,
            remaining: remaining,
            total_if_approved: totalIfApproved
          }
        });
      }

      // Ek bilgi: Admin'e kontenjan durumunu göster
      console.log(`✅ ONAYLAMA BAŞARILI:
        - Mevcut Toplam: ${currentTotal} kişi
        - Yeni Talep: ${requestedCount} kişi
        - Onaylandıktan Sonra: ${totalIfApproved} kişi
        - Kalan Kontenjan: ${maxCapacity - totalIfApproved} kişi
      `);
    }

    await db.query('UPDATE reservation_requests SET status = ?, admin_notes = ? WHERE id = ?', [status, admin_notes, id]);

    res.json({ success: true, message: `Rezervasyon durumu başarıyla "${status}" olarak güncellendi.` });

  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

/**
 * @desc    Bir rezervasyon talebini kalıcı olarak siler.
 * @route   DELETE /api/admin/requests/:id
 */
const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM reservation_requests WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Silinecek talep bulunamadı.' });
        }
        res.json({ success: true, message: 'Rezervasyon talebi kalıcı olarak silindi.' });
    } catch (error) {
        console.error('Rezervasyon silme hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
};

/**
 * @desc    Admin paneli için saat dilimlerine göre kontenjan özeti
 * @route   GET /api/admin/capacity-summary?date=2025-10-10
 */
const getCapacitySummary = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD formatında
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Tarih parametresi gerekli.' });
    }

    const [summary] = await db.query(
      `SELECT 
        DATE_FORMAT(start_datetime, '%H:%i') as start_time,
        DATE_FORMAT(end_datetime, '%H:%i') as end_time,
        status,
        SUM(participant_count) as total_participants,
        COUNT(*) as request_count
       FROM reservation_requests
       WHERE DATE(start_datetime) = ?
       GROUP BY start_time, end_time, status
       ORDER BY start_time ASC`,
      [date]
    );

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Kontenjan özeti hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};


module.exports = {
  createReservationRequest,
  getPublicApprovedReservations,
  checkTimeSlotAvailability, // YENİ
  getAllRequests,
  updateRequestDetails,
  updateRequestStatus,
  deleteRequest,
  getCapacitySummary // YENİ (Admin için bonus özellik)
};