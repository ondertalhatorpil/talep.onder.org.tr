// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı bağlantısını içe aktar
const db = require('./config/db');

// Basit test endpoint'i
app.get('/', (req, res) => {
  res.send('Araç Rezervasyon Sistemi API çalışıyor');
});

// Route'ları içe aktar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/reservations', require('./routes/reservations'));

// Server'ı başlat
const PORT = process.env.PORT || 8060;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});