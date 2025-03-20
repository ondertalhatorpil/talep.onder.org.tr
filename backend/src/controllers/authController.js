// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../utils/jwtUtils');

// Kullanıcı girişi
const login = async (req, res) => {
  try {
    console.log("Gelen istek body:", req.body);
    const { username, password } = req.body;
    
    console.log("Aranan kullanıcı:", username);
    console.log("Gönderilen şifre:", password);
    
    // Kullanıcıyı veritabanında ara
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    console.log("Kullanıcı bulundu:", users.length > 0);
    
    // Kullanıcı bulunamadıysa
    if (users.length === 0) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    const user = users[0];
    console.log("Veritabanındaki hash:", user.password);
    
    // Şifreyi kontrol et
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("Şifre doğrulama sonucu:", isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }
    } catch (bcryptError) {
      console.error("bcrypt hatası:", bcryptError);
      return res.status(500).json({ message: 'Şifre doğrulama hatası' });
    }
    
    // Token oluştur
    const token = generateToken(user.id, user.username, user.role);
    
    // Kullanıcı bilgilerini ve token'ı gönder
    res.json({
      user: {
        id: user.id,
        username: user.username,
        department: user.department,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Mevcut kullanıcı bilgilerini al
const getCurrentUser = async (req, res) => {
  try {
    // Kimlik doğrulama middleware'i tarafından eklenen kullanıcı bilgisi
    const userId = req.user.id;
    
    // Kullanıcı bilgilerini veritabanından al
    const [users] = await db.query(
      'SELECT id, username, department, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  login,
  getCurrentUser
};