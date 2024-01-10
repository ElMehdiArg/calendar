const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('user.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the user database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL
    )`);
    // Create "calendar" table
    db.run(`CREATE TABLE IF NOT EXISTS calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_name TEXT NOT NULL,
      event_start DATETIME NOT NULL,
      event_end DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  }
});

module.exports = db;
