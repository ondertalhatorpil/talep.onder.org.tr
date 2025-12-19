const db = require('../../config/db');

/**
 * Frontend'den gelen tarihi MySQL formatına çevir
 * Türkiye saati (GMT+3) olarak gelir, UTC'ye çevirir
 * 
 * Örnek:
 * Input: "2025-12-19T19:00" (Kullanıcı Türkiye'de 19:00 seçti)
 * Output: "2025-12-19 16:00:00" (MySQL'de UTC olarak saklanır)
 */
const parseISOToMySQL = (isoString) => {
  if (!isoString) return null;
  
  console.log('🔍 parseISOToMySQL input:', isoString);
  
  // ✅ SORUN BURADA ÇÖZÜLÜYOR!
  // Eğer timezone bilgisi yoksa (sadece "2025-12-19T19:00" gibi), 
  // bunu Türkiye saati (GMT+3) olarak kabul et
  let date;
  
  if (!isoString.includes('Z') && !isoString.includes('+') && !isoString.includes('-', 11)) {
    // Timezone bilgisi yok, Türkiye saati olarak kabul et
    console.log('⏰ Timezone yok, Türkiye saati olarak kabul ediliyor (GMT+3)');
    date = new Date(isoString + '+03:00');
  } else {
    // Zaten timezone bilgisi var
    console.log('✅ Timezone var, direkt parse ediliyor');
    date = new Date(isoString);
  }
  
  // MySQL datetime formatına çevir (UTC olarak)
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  const result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  console.log('✅ parseISOToMySQL output:', result);
  
  return result;
};

/**
 * MySQL'den gelen UTC tarihini ISO formatına çevir
 * 
 * Örnek:
 * Input: "2025-12-19 16:00:00" (MySQL'de UTC)
 * Output: "2025-12-19T16:00:00Z" (Frontend'e gönderilir)
 * Frontend'de: new Date("2025-12-19T16:00:00Z") → Kullanıcı 19:00 görür (GMT+3)
 */
const formatDateToUTC = (mysqlDatetime) => {
  if (!mysqlDatetime) return null;
  
  // Eğer zaten Date object ise
  if (mysqlDatetime instanceof Date) {
    return mysqlDatetime.toISOString();
  }
  
  // Eğer string ise (MySQL'den gelen format: "2025-12-19 16:00:00")
  if (typeof mysqlDatetime === 'string') {
    // MySQL'deki değer zaten UTC, sadece ISO formatına çevir
    const dateStr = mysqlDatetime.replace(' ', 'T') + 'Z';
    return dateStr;
  }
  
  console.error('❌ Invalid date format:', mysqlDatetime);
  return null;
};

const formatReservationDates = (reservation) => {
  if (!reservation) return null;
  
  return {
    ...reservation,
    start_date_time: formatDateToUTC(reservation.start_date_time),
    end_date_time: formatDateToUTC(reservation.end_date_time),
    approved_at: formatDateToUTC(reservation.approved_at),
    created_at: formatDateToUTC(reservation.created_at)
  };
};

// Tüm rezervasyonları getir
const getAllReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;
    
    let query = `
      SELECT r.*, 
        v.license_plate, v.brand, v.model,
        u.username, u.department
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON r.user_id = u.id
    `;
    
    const queryParams = [];
    const filters = [];
    
    if (userRole !== 'admin') {
      const [users] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
      if (users.length > 0) {
        filters.push('r.department = ?');
        queryParams.push(users[0].department);
      }
    }
    
    if (status) {
      filters.push('r.status = ?');
      queryParams.push(status);
    }
    
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    query += ' ORDER BY r.start_date_time DESC';
    
    const [reservations] = await db.query(query, queryParams);
    
    // Tarihleri UTC formatına çevir
    const formattedReservations = reservations.map(formatReservationDates);
    
    res.json(formattedReservations);
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tek bir rezervasyonu ID ile getir
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const [reservations] = await db.query(
      `SELECT r.*, 
        v.license_plate, v.brand, v.model,
        u.username, u.department
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );
    
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    const reservation = reservations[0];
    
    if (userRole !== 'admin') {
      const [users] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
      if (users.length > 0 && users[0].department !== reservation.department) {
        return res.status(403).json({ message: 'Bu rezervasyonu görüntüleme yetkiniz yok' });
      }
    }
    
    const formattedReservation = formatReservationDates(reservation);
    
    res.json(formattedReservation);
  } catch (error) {
    console.error('Rezervasyon getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// SMS Gönderme fonksiyonu
const sendSMS = async (phoneNumber, message) => {
  try {
    const username = 'ondermerkez';
    const password = 'yO91GQKA39Rs';
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    const smsData = {
      type: 1,
      sendingType: 0,
      title: "AracRezerve",
      content: message,
      number: phoneNumber.replace(/\s+/g, ''),
      encoding: 1,
      sender: "ONDER iHD",
      validity: 60,
      commercial: false,
      skipAhsQuery: true,
      recipientType: 0
    };
    
    const response = await fetch('https://panel4.ekomesaj.com:9588/sms/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(smsData)
    });

    const result = await response.json();
    
    if (result.data && result.data.pkgID) {
      console.log(`SMS gönderildi. Paket ID: ${result.data.pkgID}`);
      return { success: true, packageId: result.data.pkgID };
    } else {
      console.error('SMS gönderimi başarısız:', result.err);
      return { success: false, error: result.err };
    }
  } catch (error) {
    console.error('SMS gönderim hatası:', error);
    return { success: false, error: error.message };
  }
};

const createReservation = async (req, res) => {
  try {
    const { vehicle_id, start_date_time, end_date_time, purpose, notes } = req.body;
    const userId = req.user.id;
    
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Araç bulunamadı' });
    }
    
    if (vehicles[0].status !== 'active') {
      return res.status(400).json({ message: 'Bu araç şu anda kullanılamaz' });
    }
    
    // Frontend'den gelen tarihleri MySQL formatına çevir
    const startDate = parseISOToMySQL(start_date_time);
    const endDate = parseISOToMySQL(end_date_time);
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Geçersiz tarih formatı' });
    }
    
    const now = new Date();
    const startDateObj = new Date(start_date_time.includes('+') ? start_date_time : start_date_time + '+03:00');
    
    if (startDateObj < now) {
      return res.status(400).json({ message: 'Geçmiş tarihler için rezervasyon yapılamaz' });
    }
    
    const [conflictingReservations] = await db.query(
      `SELECT * FROM reservations 
        WHERE vehicle_id = ? 
        AND status IN ('pending', 'approved')
        AND ((start_date_time BETWEEN ? AND ?)
          OR (end_date_time BETWEEN ? AND ?)
          OR (start_date_time <= ? AND end_date_time >= ?))`,
      [vehicle_id, startDate, endDate, startDate, endDate, startDate, endDate]
    );
    
    if (conflictingReservations.length > 0) {
      return res.status(409).json({
        message: 'Bu araç için seçilen tarih aralığında çakışan rezervasyon var',
        conflicts: conflictingReservations
      });
    }
    
    const [result] = await db.query(
      `INSERT INTO reservations 
        (vehicle_id, user_id, department, start_date_time, end_date_time, purpose, notes, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [vehicle_id, userId, user.department, startDate, endDate, purpose, notes]
    );
    
    const [newReservations] = await db.query(
      `SELECT r.*, 
         v.license_plate, v.brand, v.model, 
        u.username, u.department 
      FROM reservations r 
      JOIN vehicles v ON r.vehicle_id = v.id 
      JOIN users u ON r.user_id = u.id 
      WHERE r.id = ?`,
      [result.insertId]
    );
    
    const reservation = newReservations[0];
    
    // SMS bildirimi - Türkiye saatinde göster
    const startDateTR = new Date(startDate + 'Z').toLocaleString('tr-TR', { 
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const endDateTR = new Date(endDate + 'Z').toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    });
    const vehicleInfo = `${reservation.brand} ${reservation.model} (${reservation.license_plate})`;
    const smsContent = `Araç Talebi Alındı: ${reservation.username} kişisinden ${startDateTR} - ${endDateTR} tarihleri için ${vehicleInfo} talebi oluşturuldu!`;
    
    await sendSMS('05447350111', smsContent);
    
    const formattedReservation = formatReservationDates(reservation);
    
    res.status(201).json(formattedReservation);
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_id, start_date_time, end_date_time, purpose, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const [reservations] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    const reservation = reservations[0];
    
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    if (userRole !== 'admin' && 
        reservation.user_id !== userId && 
        reservation.department !== user.department) {
      return res.status(403).json({ message: 'Bu rezervasyonu güncelleme yetkiniz yok' });
    }
    
    let newStatus = reservation.status;
    if (reservation.status === 'approved') {
      newStatus = 'pending';
    }
    
    if (vehicle_id) {
      const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
      if (vehicles.length === 0) {
        return res.status(404).json({ message: 'Araç bulunamadı' });
      }
      
      if (vehicles[0].status !== 'active') {
        return res.status(400).json({ message: 'Bu araç şu anda kullanılamaz' });
      }
    }
    
    // Tarihleri MySQL formatına çevir
    const startDate = start_date_time ? parseISOToMySQL(start_date_time) : reservation.start_date_time;
    const endDate = end_date_time ? parseISOToMySQL(end_date_time) : reservation.end_date_time;
    
    const vehicleIdToCheck = vehicle_id || reservation.vehicle_id;
    const [conflictingReservations] = await db.query(
      `SELECT * FROM reservations 
       WHERE vehicle_id = ? 
       AND id != ?
       AND status IN ('pending', 'approved')
       AND ((start_date_time BETWEEN ? AND ?) 
         OR (end_date_time BETWEEN ? AND ?)
         OR (start_date_time <= ? AND end_date_time >= ?))`,
      [vehicleIdToCheck, id, startDate, endDate, startDate, endDate, startDate, endDate]
    );
    
    if (conflictingReservations.length > 0) {
      return res.status(409).json({ 
        message: 'Bu araç için seçilen tarih aralığında çakışan rezervasyon var',
        conflicts: conflictingReservations
      });
    }
    
    await db.query(
      `UPDATE reservations 
       SET vehicle_id = ?, start_date_time = ?, end_date_time = ?, 
           purpose = ?, notes = ?, status = ?
       WHERE id = ?`,
      [
        vehicle_id || reservation.vehicle_id,
        startDate,
        endDate,
        purpose || reservation.purpose,
        notes !== undefined ? notes : reservation.notes,
        newStatus,
        id
      ]
    );
    
    const [updatedReservations] = await db.query(
      `SELECT r.*, 
         v.license_plate, v.brand, v.model,
        u.username, u.department
      FROM reservations r 
      JOIN vehicles v ON r.vehicle_id = v.id 
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );
    
    const formattedReservation = formatReservationDates(updatedReservations[0]);
    
    res.json(formattedReservation);
  } catch (error) {
    console.error('Rezervasyon güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum değeri' });
    }
    
    const [reservations] = await db.query(
      `SELECT r.*, v.brand, v.model, v.license_plate, 
              u.username, u.department, u.phone
       FROM reservations r 
       JOIN vehicles v ON r.vehicle_id = v.id 
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`, 
      [id]
    );
    
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    const reservation = reservations[0];
    
    if (reservation.status === status) {
      return res.json({ message: 'Rezervasyon zaten bu durumda' });
    }
    
    let approvedBy = null;
    let approvedAt = null;
    
    if (status === 'approved') {
      approvedBy = userId;
      approvedAt = parseISOToMySQL(new Date().toISOString());
      
      const [conflictingReservations] = await db.query(
        `SELECT * FROM reservations 
          WHERE vehicle_id = ? 
          AND id != ?
          AND status = 'approved'
          AND ((start_date_time BETWEEN ? AND ?) 
            OR (end_date_time BETWEEN ? AND ?)
            OR (start_date_time <= ? AND end_date_time >= ?))`,
        [
          reservation.vehicle_id, 
          id, 
          reservation.start_date_time, 
          reservation.end_date_time,
          reservation.start_date_time, 
          reservation.end_date_time,
          reservation.start_date_time, 
          reservation.end_date_time
        ]
      );
      
      if (conflictingReservations.length > 0) {
        return res.status(409).json({
          message: 'Bu araç için seçilen tarih aralığında onaylanmış başka rezervasyon var'
        });
      }
    }
    
    await db.query(
      `UPDATE reservations 
        SET status = ?, notes = ?, approved_by = ?, approved_at = ?
        WHERE id = ?`,
      [status, notes, approvedBy, approvedAt, id]
    );
    
    const [updatedReservations] = await db.query(
      `SELECT r.*, 
         v.license_plate, v.brand, v.model,
        u.username, u.department, u.phone
      FROM reservations r 
      JOIN vehicles v ON r.vehicle_id = v.id 
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );
    
    const updatedReservation = updatedReservations[0];
    
    // SMS bildirimi - Türkiye saatinde göster
    const startDateTR = new Date(updatedReservation.start_date_time + 'Z').toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const endDateTR = new Date(updatedReservation.end_date_time + 'Z').toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const vehicleInfo = `${updatedReservation.brand} ${updatedReservation.model} (${updatedReservation.license_plate})`;
    
    let smsContent = '';
    
    if (status === 'approved') {
      smsContent = `Sayın ${updatedReservation.username}, ${startDateTR} - ${endDateTR} tarihleri için ${vehicleInfo} araç talebiniz ONAYLANMIŞTIR.`;
    } else if (status === 'rejected') {
      smsContent = `Sayın ${updatedReservation.username}, ${startDateTR} - ${endDateTR} tarihleri için ${vehicleInfo} araç talebiniz REDDEDİLMİŞTİR.`;
    } else if (status === 'cancelled') {
      smsContent = `Sayın ${updatedReservation.username}, ${startDateTR} - ${endDateTR} tarihleri için ${vehicleInfo} araç talebiniz İPTAL EDİLMİŞTİR.`;
    }
    
    if (smsContent && updatedReservation.phone) {
      try {
        await sendSMS(updatedReservation.phone, smsContent);
      } catch (smsError) {
        console.error("SMS gönderiminde hata:", smsError);
      }
    }
    
    const formattedReservation = formatReservationDates(updatedReservation);
    
    res.json(formattedReservation);
  } catch (error) {
    console.error('Rezervasyon durumu güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const [reservations] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    const reservation = reservations[0];
    
    if (userRole !== 'admin' && reservation.user_id !== userId) {
      return res.status(403).json({ message: 'Bu rezervasyonu iptal etme yetkiniz yok' });
    }
    
    if (reservation.status === 'cancelled') {
      return res.json({ message: 'Rezervasyon zaten iptal edilmiş' });
    }
    
    await db.query(
      `UPDATE reservations SET status = 'cancelled', notes = ? WHERE id = ?`,
      [notes, id]
    );
    
    const [updatedReservations] = await db.query(
      `SELECT r.*, 
        v.license_plate, v.brand, v.model,
        u.username, u.department
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );
    
    const formattedReservation = formatReservationDates(updatedReservations[0]);
    
    res.json(formattedReservation);
  } catch (error) {
    console.error('Rezervasyon iptal hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [reservations] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    await db.query('DELETE FROM reservations WHERE id = ?', [id]);
    
    res.json({ message: 'Rezervasyon başarıyla silindi' });
  } catch (error) {
    console.error('Rezervasyon silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const getAvailableVehicles = async (req, res) => {
  try {
    const { start_date_time, end_date_time } = req.query;
    
    if (!start_date_time || !end_date_time) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihleri gerekli' });
    }
    
    // Frontend'den gelen tarihleri MySQL formatına çevir
    const startDate = parseISOToMySQL(start_date_time);
    const endDate = parseISOToMySQL(end_date_time);
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Geçersiz tarih formatı' });
    }
    
    const [vehicles] = await db.query(
      'SELECT * FROM vehicles WHERE status = "active"'
    );
    
    const [reservedVehicles] = await db.query(
      `SELECT DISTINCT vehicle_id FROM reservations 
       WHERE status IN ('pending', 'approved')
       AND ((start_date_time BETWEEN ? AND ?) 
         OR (end_date_time BETWEEN ? AND ?)
         OR (start_date_time <= ? AND end_date_time >= ?))`,
      [startDate, endDate, startDate, endDate, startDate, endDate]
    );
    
    const reservedVehicleIds = reservedVehicles.map(v => v.vehicle_id);
    const availableVehicles = vehicles.filter(vehicle => !reservedVehicleIds.includes(vehicle.id));
    
    res.json(availableVehicles);
  } catch (error) {
    console.error('Kullanılabilir araçları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const PubliCar = async (req, res) => {
  try {
    const [vehicles] = await db.query(
      'SELECT id, brand, model, license_plate FROM vehicles WHERE status = "active"'
    );
    
    res.json(vehicles);
  } catch (error) {
    console.error('Herkese açık araçlar getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const PublicCalendar = async (req, res) => {
  try {
    const [reservations] = await db.query(
      `SELECT 
        r.id,
        r.vehicle_id,
        r.start_date_time,
        r.end_date_time,
        r.status,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.status = 'approved'
      ORDER BY r.start_date_time ASC`
    );

    const formattedReservations = reservations.map(formatReservationDates);
    
    res.json(formattedReservations);
  } catch (error) {
    console.error('Herkese açık rezervasyonlar getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  getAvailableVehicles,
  PubliCar,
  PublicCalendar,
  sendSMS
};