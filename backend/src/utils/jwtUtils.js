// backend/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// JWT gizli anahtarı
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar_buraya';

// JWT Token oluşturma
const generateToken = (userId, username, role) => {
  return jwt.sign(
    { id: userId, username, role },
    JWT_SECRET,
    { expiresIn: '1d' } // Token 1 gün geçerli
  );
};

// JWT Token doğrulama
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, expired: false, data: decoded };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      data: null
    };
  }
};

module.exports = {
  generateToken,
  verifyToken
};