// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Kullanıcı girişi
router.post('/login', login);

// Mevcut kullanıcı bilgilerini al
router.get('/me', authenticate, getCurrentUser);

module.exports = router;