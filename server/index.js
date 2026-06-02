const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_key'; // In production, use environment variables

app.use(cors());
app.use(express.json());

// --- Authentication Endpoints ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, username, password, dob, gender, weight_kg, height_cm } = req.body;

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (full_name, email, username, password_hash, dob, gender, weight_kg, height_cm) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [full_name, email, username, password_hash, dob, gender, weight_kg, height_cm];

    db.run(query, values, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or email

  const query = `SELECT * FROM users WHERE username = ? OR email = ?`;
  db.get(query, [identifier, identifier], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Update last login
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);

    const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        username: user.username,
        email: user.email
      }
    });
  });
});

// --- User Endpoints ---

app.get('/api/users', (req, res) => {
  db.all('SELECT user_id, full_name, username, email, gender, weight_kg, height_cm, join_date FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

// --- Water Tracking Endpoints ---

// Get Water Meta (Settings)
app.get('/api/water/meta/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `SELECT * FROM water_tracking_meta WHERE user_id = ?`;
  db.get(query, [userId], (err, meta) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!meta) {
      // Return default meta if not found
      return res.json({
        user_id: userId,
        tracking_mode: 'ml',
        daily_goal: 2000,
        reminders_enabled: 0,
        reminder_interval_minutes: 60,
        timezone: 'Asia/Kolkata'
      });
    }
    res.json(meta);
  });
});

// Create or Update Water Meta
app.post('/api/water/meta', (req, res) => {
  const { user_id, tracking_mode, daily_goal, reminders_enabled, reminder_interval_minutes, timezone, custom_glass_ml } = req.body;
  
  const query = `
    INSERT INTO water_tracking_meta (user_id, tracking_mode, daily_goal, reminders_enabled, reminder_interval_minutes, timezone, custom_glass_ml, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      tracking_mode = excluded.tracking_mode,
      daily_goal = excluded.daily_goal,
      reminders_enabled = excluded.reminders_enabled,
      reminder_interval_minutes = excluded.reminder_interval_minutes,
      timezone = excluded.timezone,
      custom_glass_ml = excluded.custom_glass_ml,
      updated_at = CURRENT_TIMESTAMP
  `;
  const values = [user_id, tracking_mode, daily_goal, reminders_enabled, reminder_interval_minutes, timezone, custom_glass_ml];

  db.run(query, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Settings updated successfully' });
  });
});

// Get Today's Water Logs
app.get('/api/water/logs/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT 
      water_log_id, 
      user_id, 
      tracking_mode, 
      quantity, 
      note, 
      strftime('%Y-%m-%dT%H:%M:%SZ', logged_at) as logged_at,
      tracking_date
    FROM water_logs 
    WHERE user_id = ? AND tracking_date = DATE('now', 'localtime') 
    ORDER BY logged_at DESC
  `;
  db.all(query, [userId], (err, logs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logs });
  });
});

// Log Water Intake
app.post('/api/water/logs', (req, res) => {
  const { user_id, tracking_mode, quantity, note } = req.body;
  const query = `
    INSERT INTO water_logs (user_id, tracking_mode, quantity, note)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [user_id, tracking_mode, quantity, note], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Water intake logged', logId: this.lastID });
  });
});

// --- Database Schema Endpoints ---

app.get('/api/db/schema', (req, res) => {
  // Query to get all tables
  const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
  
  db.all(tablesQuery, [], async (err, tables) => {
    if (err) return res.status(500).json({ error: err.message });
    
    try {
      const schema = [];
      for (const table of tables) {
        // For each table, get its columns
        const columns = await new Promise((resolve, reject) => {
          db.all(`PRAGMA table_info(${table.name})`, [], (err, cols) => {
            if (err) reject(err);
            else resolve(cols);
          });
        });
        schema.push({
          table: table.name,
          columns: columns.map(c => ({
            name: c.name,
            type: c.type,
            notnull: c.notnull,
            pk: c.pk
          }))
        });
      }
      res.json({ schema });
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
