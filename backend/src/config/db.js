const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3001,  
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arac_rezervasyonn',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ✅ KRİTİK: Tarihleri STRING olarak al, Date object değil
  dateStrings: true,
  // ✅ KRİTİK: MySQL'i UTC timezone'da çalıştır
  timezone: '+00:00'
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL veritabanına bağlantı başarılı');
    
    // Timezone kontrolü
    const [rows] = await connection.query('SELECT @@session.time_zone as tz, NOW() as current_time');
    console.log('📅 MySQL Timezone:', rows[0].tz);
    console.log('🕐 MySQL Server Time:', rows[0].current_time);
    
    connection.release();
  } catch (error) {
    console.error('❌ MySQL bağlantı hatası:', error);
  }
};

testConnection();
module.exports = pool;