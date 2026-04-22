const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'teacher_portal',
  port: process.env.DB_PORT || 3307, 
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4'
});

pool.getConnection((err, conn) => {
  if (err) { console.error('❌ DB connection failed:', err.message); }
  else { console.log('✅ MySQL connected'); conn.release(); }
});

module.exports = pool.promise();
