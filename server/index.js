const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your_secret_key_here';

app.use(cors());
app.use(bodyParser.json());

// Initialize database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      dob TEXT,
      sex TEXT,
      mobile TEXT,
      address TEXT,
      pincode TEXT,
      user_type TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      content TEXT,
      is_completed BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  }
});

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// User registration
app.post('/register', async (req, res) => {
  const { 
    username, 
    password, 
    name, 
    dob, 
    sex, 
    mobile, 
    address, 
    pincode, 
    user_type 
  } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run(
    'INSERT INTO users (username, password, name, dob, sex, mobile, address, pincode, user_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [username, hashedPassword, name || null, dob || null, sex || null, mobile || null, address || null, pincode || null, user_type || null], 
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ 
      id: user.id, 
      username: user.username,
      name: user.name,
      user_type: user.user_type
    }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Get user profile
app.get('/profile', authenticateJWT, (req, res) => {
  db.get(
    'SELECT id, username, name, dob, sex, mobile, address, pincode, user_type FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Update user profile
app.put('/profile', authenticateJWT, (req, res) => {
  const { name, dob, sex, mobile, address, pincode, user_type } = req.body;
  
  db.run(
    'UPDATE users SET name = ?, dob = ?, sex = ?, mobile = ?, address = ?, pincode = ?, user_type = ? WHERE id = ?',
    [name, dob, sex, mobile, address, pincode, user_type, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Notes CRUD operations (same as before)
app.get('/notes', authenticateJWT, (req, res) => {
  db.all('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, notes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(notes);
  });
});

app.post('/notes', authenticateJWT, (req, res) => {
  const { title, content } = req.body;
  db.run('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)', 
    [req.user.id, title, content], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      db.get('SELECT * FROM notes WHERE id = ?', [this.lastID], (err, note) => {
        res.status(201).json(note);
      });
    }
  );
});

app.put('/notes/:id', authenticateJWT, (req, res) => {
  const { title, content, is_completed } = req.body;
  db.run('UPDATE notes SET title = ?, content = ?, is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', 
    [title, content, is_completed, req.params.id, req.user.id], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      db.get('SELECT * FROM notes WHERE id = ?', [req.params.id], (err, note) => {
        res.json(note);
      });
    }
  );
});

app.delete('/notes/:id', authenticateJWT, (req, res) => {
  db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.sendStatus(204);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});