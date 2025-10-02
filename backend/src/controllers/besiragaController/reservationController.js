// backend/controllers/besiragaControllers/reservationController.js
const db = require('../../config/db');

// Tüm rezervasyonları getir (PUBLIC - Şifresiz)
const getAllReservations = async (req, res) => {
  try {
    const [reservations] = await db.query(
      `SELECT 
        id, 
        room_name, 
        group_name, 
        start_datetime, 
        end_datetime, 
        capacity,
        notes
      FROM besiraga_reservations 
      WHERE end_datetime >= NOW()
      ORDER BY start_datetime ASC`
    );

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// Belirli tarih aralığındaki rezervasyonları getir
const getReservationsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Başlangıç ve bitiş tarihi gereklidir' 
      });
    }

    const [reservations] = await db.query(
      `SELECT 
        id, 
        room_name, 
        group_name, 
        start_datetime, 
        end_datetime, 
        capacity,
        notes
      FROM besiraga_reservations 
      WHERE start_datetime <= ? AND end_datetime >= ?
      ORDER BY start_datetime ASC`,
      [endDate, startDate]
    );

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Tarih aralığı rezervasyon hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// Yeni rezervasyon ekle (ADMIN - Şifreli)
const createReservation = async (req, res) => {
  try {
    const { 
      room_name, 
      group_name, 
      start_datetime, 
      end_datetime, 
      capacity,
      contact_person,
      phone,
      notes 
    } = req.body;

    // Validasyon
    if (!room_name || !group_name || !start_datetime || !end_datetime || !capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Zorunlu alanları doldurun' 
      });
    }

    // Çakışma kontrolü
    const [conflicts] = await db.query(
      `SELECT id FROM besiraga_reservations 
       WHERE room_name = ? 
       AND ((start_datetime <= ? AND end_datetime > ?) 
            OR (start_datetime < ? AND end_datetime >= ?)
            OR (start_datetime >= ? AND end_datetime <= ?))`,
      [room_name, start_datetime, start_datetime, end_datetime, end_datetime, start_datetime, end_datetime]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Bu tarih aralığında oda dolu' 
      });
    }

    // Rezervasyon ekle
    const [result] = await db.query(
      `INSERT INTO besiraga_reservations 
       (room_name, group_name, start_datetime, end_datetime, capacity, contact_person, phone, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [room_name, group_name, start_datetime, end_datetime, capacity, contact_person, phone, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Rezervasyon oluşturuldu',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// Rezervasyon güncelle (ADMIN - Şifreli)
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      room_name, 
      group_name, 
      start_datetime, 
      end_datetime, 
      capacity,
      contact_person,
      phone,
      notes 
    } = req.body;

    // Rezervasyon var mı kontrol et
    const [existing] = await db.query(
      'SELECT id FROM besiraga_reservations WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rezervasyon bulunamadı' 
      });
    }

    // Çakışma kontrolü (kendisi hariç)
    const [conflicts] = await db.query(
      `SELECT id FROM besiraga_reservations 
       WHERE room_name = ? 
       AND id != ?
       AND ((start_datetime <= ? AND end_datetime > ?) 
            OR (start_datetime < ? AND end_datetime >= ?)
            OR (start_datetime >= ? AND end_datetime <= ?))`,
      [room_name, id, start_datetime, start_datetime, end_datetime, end_datetime, start_datetime, end_datetime]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Bu tarih aralığında oda dolu' 
      });
    }

    // Güncelle
    await db.query(
      `UPDATE besiraga_reservations 
       SET room_name = ?, group_name = ?, start_datetime = ?, end_datetime = ?, 
           capacity = ?, contact_person = ?, phone = ?, notes = ?
       WHERE id = ?`,
      [room_name, group_name, start_datetime, end_datetime, capacity, contact_person, phone, notes, id]
    );

    res.json({
      success: true,
      message: 'Rezervasyon güncellendi'
    });
  } catch (error) {
    console.error('Rezervasyon güncelleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// Rezervasyon sil (ADMIN - Şifreli)
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM besiraga_reservations WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rezervasyon bulunamadı' 
      });
    }

    res.json({
      success: true,
      message: 'Rezervasyon silindi'
    });
  } catch (error) {
    console.error('Rezervasyon silme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// Admin şifre kontrolü
const checkAdminPassword = (req, res) => {
  // Middleware zaten kontrol etti, buraya geldiyse şifre doğru
  res.json({
    success: true,
    message: 'Şifre doğru'
  });
};

module.exports = {
  getAllReservations,
  getReservationsByDateRange,
  createReservation,
  updateReservation,
  deleteReservation,
  checkAdminPassword
};