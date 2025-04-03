// backend/controllers/reservationController.js
const db = require('../config/db');

// Tüm rezervasyonları getir (admin tümünü, kullanıcı kendi departmanınınkileri)
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
    
    // Filtreler
    const filters = [];
    
    // Admin tüm rezervasyonları görebilir, normal kullanıcılar sadece kendi departmanlarınınkileri
    if (userRole !== 'admin') {
      const [users] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
      if (users.length > 0) {
        filters.push('r.department = ?');
        queryParams.push(users[0].department);
      }
    }
    
    // Durum filtresi
    if (status) {
      filters.push('r.status = ?');
      queryParams.push(status);
    }
    
    // Filtreleri ekle
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Sıralama
    query += ' ORDER BY r.start_date_time DESC';
    
    const [reservations] = await db.query(query, queryParams);
    res.json(reservations);
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
    
    // Rezervasyonu ve ilişkili verileri getir
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
    
    // Admin olmayan kullanıcılar sadece kendi departmanlarının rezervasyonlarını görebilir
    if (userRole !== 'admin') {
      const [users] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
      if (users.length > 0 && users[0].department !== reservation.department) {
        return res.status(403).json({ message: 'Bu rezervasyonu görüntüleme yetkiniz yok' });
      }
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Rezervasyon getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};



// SMS Gönderme fonksiyonu
const sendSMS = async (phoneNumber, message) => {
  try {
    // Basic Authentication için kimlik bilgilerini hazırlama
    const username = 'ondermerkez';
    const password = 'yO91GQKA39Rs';
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    console.log('SMS gönderiliyor:', phoneNumber);
    console.log('Kimlik: Basic ' + credentials);

    // SMS gönderim detayları
    const smsData = {
      type: 1,                    // Sabit değer
      sendingType: 0,             // Sabit değer
      title: "AracRezerve",       // Paket tanımlayıcı başlık (min 5 karakter)
      content: message,           // SMS içeriği
      number: phoneNumber.replace(/\s+/g, ''), // Boşlukları temizle
      encoding: 1,                // Türkçe karakterler için 1
      sender: "ONDER iHD",        // Onaylı gönderici ID
      validity: 60,               // Mesajın geçerlilik süresi (dakika)
      commercial: false,          // Ticari SMS değil
      skipAhsQuery: true,         // AHS sorgusu atlanabilir
      recipientType: 0            // Bireysel alıcı
    };

    // API isteği gönderme
    console.log('SMS isteği:', JSON.stringify(smsData, null, 2));
    
    const response = await fetch('https://panel4.ekomesaj.com:9588/sms/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(smsData)
    });
    
    console.log('API yanıt durumu:', response.status);

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
    
    // Kullanıcı bilgilerini al
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    // Aracın var olup olmadığını kontrol et
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Araç bulunamadı' });
    }
    
    // Aracın aktif olup olmadığını kontrol et
    if (vehicles[0].status !== 'active') {
      return res.status(400).json({ message: 'Bu araç şu anda kullanılamaz' });
    }
    
    // Tarih formatlarını kontrol et
    const startDate = new Date(start_date_time);
    const endDate = new Date(end_date_time);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Geçersiz tarih formatı' });
    }
    
    // Bitiş tarihi başlangıç tarihinden sonra olmalı
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı' });
    }
    
    // Geçmiş tarihler için rezervasyon yapılamaz
    const now = new Date();
    if (startDate < now) {
      return res.status(400).json({ message: 'Geçmiş tarihler için rezervasyon yapılamaz' });
    }
    
    // Çakışan rezervasyonları kontrol et
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
    
    // Yeni rezervasyon oluştur
    const [result] = await db.query(
      `INSERT INTO reservations 
        (vehicle_id, user_id, department, start_date_time, end_date_time, purpose, notes, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [vehicle_id, userId, user.department, startDate, endDate, purpose, notes]
    );
    
    // Oluşturulan rezervasyonu getir
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
    
    // SMS bildirimi gönderme
    const startDateStr = new Date(reservation.start_date_time).toLocaleDateString('tr-TR');
    const endDateStr = new Date(reservation.end_date_time).toLocaleDateString('tr-TR');
    const dateRange = `${startDateStr} - ${endDateStr}`;
    const vehicleInfo = `${reservation.brand} ${reservation.model} (${reservation.license_plate})`;
    
    // SMS içeriğini hazırla
    const smsContent = `Araç Talebi Alındı: ${reservation.username} kişisinden ${dateRange} tarihleri için ${vehicleInfo} talebi oluşturuldu bir an önce sisteme girip talebi cevaplaman gerekli!`;
    
    // SMS gönder
    const notificationNumber = '05447350111';
    await sendSMS(notificationNumber, smsContent);
    
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};



const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    
    const [reservations] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    const reservation = reservations[0];
    
    // Kullanıcı bilgilerini al
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    const user = users[0];
    
    // Admin olmayanlar sadece kendi rezervasyonlarını veya kendi departmanlarının rezervasyonlarını güncelleyebilir
    if (userRole !== 'admin' && 
        reservation.user_id !== userId && 
        reservation.department !== user.department) {
      return res.status(403).json({ message: 'Bu rezervasyonu güncelleme yetkiniz yok' });
    }
    
    // Onaylanmış rezervasyonlar güncellenince yeniden onaya gitmeli
    let newStatus = reservation.status;
    if (reservation.status === 'approved') {
      newStatus = 'pending';
    }
    
    // Aracın var olup olmadığını kontrol et
    if (vehicle_id) {
      const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
      if (vehicles.length === 0) {
        return res.status(404).json({ message: 'Araç bulunamadı' });
      }
      
      // Aracın aktif olup olmadığını kontrol et
      if (vehicles[0].status !== 'active') {
        return res.status(400).json({ message: 'Bu araç şu anda kullanılamaz' });
      }
    }
    
    // Tarih formatlarını kontrol et
    let startDate = reservation.start_date_time;
    let endDate = reservation.end_date_time;
    
    if (start_date_time) {
      startDate = new Date(start_date_time);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Geçersiz başlangıç tarihi formatı' });
      }
    }
    
    if (end_date_time) {
      endDate = new Date(end_date_time);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Geçersiz bitiş tarihi formatı' });
      }
    }
    
    // Bitiş tarihi başlangıç tarihinden sonra olmalı
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı' });
    }
    
    // Geçmiş tarihler için rezervasyon güncellenemez
    const now = new Date();
    if (startDate < now) {
      return res.status(400).json({ message: 'Geçmiş tarihler için rezervasyon güncellenemez' });
    }
    
    // Çakışan rezervasyonları kontrol et
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
    
    // Rezervasyonu güncelle
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
        notes,
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
    
    
    res.json(updatedReservations[0]);
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
    
    // Geçerli durum değerleri
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum değeri' });
    }
    
    // Rezervasyonun var olup olmadığını kontrol et
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
    
    // Zaten aynı durumda ise güncelleme yapma
    if (reservation.status === status) {
      return res.json({ message: 'Rezervasyon zaten bu durumda' });
    }
    
    let approvedBy = null;
    let approvedAt = null;
    
    // Eğer onaylanıyorsa onaylama bilgilerini ekle
    if (status === 'approved') {
      approvedBy = userId;
      approvedAt = new Date();
      
      // Onaylarken çakışma kontrolü yap
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
          message: 'Bu araç için seçilen tarih aralığında onaylanmış başka rezervasyon var',
          conflicts: conflictingReservations
        });
      }
    }
    
    // Rezervasyon durumunu güncelle
    await db.query(
      `UPDATE reservations 
        SET status = ?, notes = ?, approved_by = ?, approved_at = ?
        WHERE id = ?`,
      [status, notes, approvedBy, approvedAt, id]
    );
    
    // Güncellenmiş rezervasyonu getir
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
    
    // SMS bildirimi gönderme
    const startDateStr = new Date(updatedReservation.start_date_time).toLocaleDateString('tr-TR');
    const endDateStr = new Date(updatedReservation.end_date_time).toLocaleDateString('tr-TR');
    const dateRange = `${startDateStr} - ${endDateStr}`;
    const vehicleInfo = `${updatedReservation.brand} ${updatedReservation.model} (${updatedReservation.license_plate})`;
    
    // Durum değişikliğine göre SMS içeriğini hazırla
    let smsContent = '';
    
    if (status === 'approved') {
      smsContent = `Sayın ${updatedReservation.username}, ${dateRange} tarihleri için ${vehicleInfo} araç talebiniz ONAYLANMIŞTIR. İyi günlerde kullanmanızı dileriz.`;
    } else if (status === 'rejected') {
      smsContent = `Sayın ${updatedReservation.username}, ${dateRange} tarihleri için ${vehicleInfo} araç talebiniz REDDEDİLMİŞTİR. Detaylı bilgi için yönetici ile iletişime geçebilirsiniz.`;
    } else if (status === 'cancelled') {
      smsContent = `Sayın ${updatedReservation.username}, ${dateRange} tarihleri için ${vehicleInfo} araç talebiniz İPTAL EDİLMİŞTİR.`;
    }
    
    // Sadece durumu değiştiyse ve kullanıcının telefon numarası varsa SMS gönder
    if (smsContent && updatedReservation.phone) {
      try {
        await sendSMS(updatedReservation.phone, smsContent);
        console.log("SMS gönderildi: " + updatedReservation.phone);
      } catch (smsError) {
        console.error("SMS gönderiminde hata:", smsError);
        // SMS hatası olsa bile işleme devam et
      }
    } else if (!updatedReservation.phone) {
      console.log("Kullanıcının telefon numarası bulunamadı:", updatedReservation.username);
    }
    
    res.json(updatedReservation);
  } catch (error) {
    console.error('Rezervasyon durumu güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};




















// Rezervasyon iptal et
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Rezervasyonun var olup olmadığını kontrol et
    const [reservations] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    const reservation = reservations[0];
    
    // Admin olmayanlar sadece kendi rezervasyonlarını iptal edebilir
    if (userRole !== 'admin' && reservation.user_id !== userId) {
      return res.status(403).json({ message: 'Bu rezervasyonu iptal etme yetkiniz yok' });
    }
    
    // Zaten iptal edilmiş ise güncelleme yapma
    if (reservation.status === 'cancelled') {
      return res.json({ message: 'Rezervasyon zaten iptal edilmiş' });
    }
    
    // Rezervasyonu iptal et
    await db.query(
      `UPDATE reservations SET status = 'cancelled', notes = ? WHERE id = ?`,
      [notes, id]
    );
    
    // Güncellenmiş rezervasyonu getir
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
    
    res.json(updatedReservations[0]);
  } catch (error) {
    console.error('Rezervasyon iptal hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Rezervasyon sil (sadece admin)
const deleteReservation = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Rezervasyonun var olup olmadığını kontrol et
    const [reservations] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }
    
    // Rezervasyonu sil
    await db.query('DELETE FROM reservations WHERE id = ?', [id]);
    
    res.json({ message: 'Rezervasyon başarıyla silindi' });
  } catch (error) {
    console.error('Rezervasyon silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanılabilir araçları getir (belirli tarih aralığında)
const getAvailableVehicles = async (req, res) => {
  try {
    const { start_date_time, end_date_time } = req.query;
    
    // Tarih parametreleri zorunlu
    if (!start_date_time || !end_date_time) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihleri gerekli' });
    }
    
    // Tarih formatlarını kontrol et
    const startDate = new Date(start_date_time);
    const endDate = new Date(end_date_time);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Geçersiz tarih formatı' });
    }
    
    // Bitiş tarihi başlangıç tarihinden sonra olmalı
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı' });
    }
    
    // Tüm aktif araçları getir
    const [vehicles] = await db.query(
      'SELECT * FROM vehicles WHERE status = "active"'
    );
    
    // Belirtilen tarih aralığında rezervasyonu olan araçları getir
    const [reservedVehicles] = await db.query(
      `SELECT DISTINCT vehicle_id FROM reservations 
       WHERE status IN ('pending', 'approved')
       AND ((start_date_time BETWEEN ? AND ?) 
         OR (end_date_time BETWEEN ? AND ?)
         OR (start_date_time <= ? AND end_date_time >= ?))`,
      [startDate, endDate, startDate, endDate, startDate, endDate]
    );
    
    // Rezerve edilmiş araç ID'lerini diziye dönüştür
    const reservedVehicleIds = reservedVehicles.map(v => v.vehicle_id);
    
    // Kullanılabilir araçları filtrele
    const availableVehicles = vehicles.filter(vehicle => !reservedVehicleIds.includes(vehicle.id));
    
    res.json(availableVehicles);
  } catch (error) {
    console.error('Kullanılabilir araçları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};




const PubliCar = async (req, res) => {
  try {
    // Sadece aktif araçları getir
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
    // Sadece onaylanmış rezervasyonları getir ve kişisel bilgileri gizle
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

    // MySQL2'nin döndürdüğü sonucu düzgün bir diziye çevir
    const formattedReservations = Array.isArray(reservations) ? reservations : [];

    // Response'u log'la
    console.log('Sending reservations:', formattedReservations);

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