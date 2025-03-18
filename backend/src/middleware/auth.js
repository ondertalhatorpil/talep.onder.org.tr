// backend/middleware/auth.js
const { verifyToken } = require('../utils/jwtUtils');

const authenticate = (req, res, next) => {
  // Bearer token'ı al
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Kimlik doğrulama hatası: Token bulunamadı' });
  }
  
  // Token'ı ayır
  const token = authHeader.split(' ')[1];
  
  // Token'ı doğrula
  const { valid, expired, data } = verifyToken(token);
  
  if (!valid) {
    return res.status(401).json({ 
      message: expired ? 'Token süresi doldu' : 'Geçersiz token' 
    });
  }
  
  req.user = data;
  
  // Bir sonraki middleware'e geç
  next();
};

// Admin rolünü kontrol etme middleware'i
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Kimlik doğrulama gerekli' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }
  
  next();
};

module.exports = {
  authenticate,
  isAdmin
};