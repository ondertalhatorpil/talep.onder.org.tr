// backend/controllers/vehicleController.js
const db = require('../../config/db');

// Tüm araçları getir
const getAllVehicles = async (req, res) => {
  try {
    const [vehicles] = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(vehicles);
  } catch (error) {
    console.error('Araçları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tek bir aracı ID ile getir
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Araç bulunamadı' });
    }
    
    res.json(vehicles[0]);
  } catch (error) {
    console.error('Araç getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni araç ekle
const createVehicle = async (req, res) => {
  try {
    const { license_plate, brand, model, description, status } = req.body;
    
    // Plaka numarasının benzersiz olup olmadığını kontrol et
    const [existingVehicles] = await db.query(
      'SELECT * FROM vehicles WHERE license_plate = ?',
      [license_plate]
    );
    
    if (existingVehicles.length > 0) {
      return res.status(400).json({ message: 'Bu plaka numarası zaten kullanılıyor' });
    }
    
    // Yeni aracı ekle
    const [result] = await db.query(
      'INSERT INTO vehicles (license_plate, brand, model, description, status) VALUES (?, ?, ?, ?, ?)',
      [license_plate, brand, model, description, status || 'active']
    );
    
    // Eklenen aracın ID'sini al
    const vehicleId = result.insertId;
    
    // Eklenen aracı getir
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    
    res.status(201).json(vehicles[0]);
  } catch (error) {
    console.error('Araç ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Araç güncelle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { license_plate, brand, model, description, status } = req.body;
    
    // Aracın var olup olmadığını kontrol et
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Araç bulunamadı' });
    }
    
    // Eğer plaka değiştiyse benzersizliğini kontrol et
    if (license_plate !== vehicles[0].license_plate) {
      const [existingVehicles] = await db.query(
        'SELECT * FROM vehicles WHERE license_plate = ? AND id != ?',
        [license_plate, id]
      );
      
      if (existingVehicles.length > 0) {
        return res.status(400).json({ message: 'Bu plaka numarası zaten kullanılıyor' });
      }
    }
    
    // Aracı güncelle
    await db.query(
      'UPDATE vehicles SET license_plate = ?, brand = ?, model = ?, description = ?, status = ? WHERE id = ?',
      [license_plate, brand, model, description, status, id]
    );
    
    // Güncellenmiş aracı getir
    const [updatedVehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    
    res.json(updatedVehicles[0]);
  } catch (error) {
    console.error('Araç güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Araç sil
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Aracın var olup olmadığını kontrol et
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Araç bulunamadı' });
    }
    
    // Araçla ilgili rezervasyonları kontrol et
    const [reservations] = await db.query(
      'SELECT * FROM reservations WHERE vehicle_id = ? AND status IN ("pending", "approved")',
      [id]
    );
    
    if (reservations.length > 0) {
      return res.status(400).json({ 
        message: 'Bu aracın aktif rezervasyonları var, önce rezervasyonları iptal edin' 
      });
    }
    
    // Aracı sil
    await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    
    res.json({ message: 'Araç başarıyla silindi' });
  } catch (error) {
    console.error('Araç silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};