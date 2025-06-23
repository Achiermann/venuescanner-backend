// backend/config/db.js
import mysql from 'mysql2'; 

const pool = mysql.createPool({
  host: 'etubesuf.mysql.db.hostpoint.ch',
  user: 'etubesuf_achiap',
  password: 'C.nidoogleef2019!',
  database: 'etubesuf_venuescanner',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
