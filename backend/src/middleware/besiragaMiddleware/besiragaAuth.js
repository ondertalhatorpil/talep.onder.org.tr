// backend/middleware/besiragaAuth.js

// Basit şifre kontrolü middleware
const checkBesiragaPassword = (req, res, next) => {
  const { password } = req.body;
  const correctPassword = process.env.BESIRAGA_ADMIN_PASSWORD;

  if (!password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Şifre gereklidir' 
    });
  }

  if (password !== correctPassword) {
    return res.status(401).json({ 
      success: false, 
      message: 'Hatalı şifre' 
    });
  }

  // Şifre doğruysa devam et
  next();
};

module.exports = {
  checkBesiragaPassword
};