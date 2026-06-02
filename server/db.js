const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users ( 
    user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    full_name VARCHAR(100) NOT NULL, 
    email VARCHAR(150) UNIQUE NOT NULL, 
    username VARCHAR(50) UNIQUE NOT NULL, 
    password_hash TEXT NOT NULL, 
    dob DATE, 
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')), 
    weight_kg DECIMAL(5,2), 
    height_cm DECIMAL(5,2), 
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    last_login TIMESTAMP, 
    is_active BOOLEAN DEFAULT TRUE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  );

  CREATE TABLE IF NOT EXISTS water_tracking_meta ( 
    meta_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, 
    tracking_mode VARCHAR(20) NOT NULL CHECK (tracking_mode IN ('liters', 'ml', 'glasses', 'gulps', 'drink_count')), 
    daily_goal REAL, 
    preferred_ui VARCHAR(30) DEFAULT 'default', 
    reminders_enabled BOOLEAN DEFAULT 0, 
    reminder_interval_minutes INTEGER, 
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata', 
    custom_glass_ml INTEGER, 
    is_active BOOLEAN DEFAULT 1, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
  );

  CREATE TABLE IF NOT EXISTS water_logs ( 
    water_log_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, 
    tracking_mode VARCHAR(20) NOT NULL CHECK (tracking_mode IN ('liters', 'ml', 'glasses', 'gulps', 'drink_count')), 
    quantity REAL NOT NULL, 
    note TEXT, 
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    tracking_date DATE DEFAULT (DATE('now')) 
  );
`;

db.serialize(() => {
  db.exec(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    } else {
      console.log('Database tables ready.');
    }
  });
});

module.exports = db;
