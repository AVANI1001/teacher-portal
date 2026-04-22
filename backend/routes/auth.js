const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const protect = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, type_id, board_id, school_name, city, state, phone } = req.body;
    if (!full_name || !email || !password || !type_id || !board_id)
      return res.status(400).json({ message: 'All required fields must be filled.' });

    const [[exists]] = await db.query('SELECT teacher_id FROM teachers WHERE email=?', [email]);
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      `INSERT INTO teachers (type_id,board_id,full_name,email,password_hash,school_name,city,state,phone)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [type_id, board_id, full_name, email, hash, school_name||null, city||null, state||null, phone||null]
    );

    const token = jwt.sign(
      { teacher_id: result.insertId, email, full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      teacher: { teacher_id: result.insertId, full_name, email, school_name, city }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [[teacher]] = await db.query('SELECT * FROM teachers WHERE email=? AND is_active=1', [email]);
    if (!teacher) return res.status(400).json({ message: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, teacher.password_hash);
    if (!match) return res.status(400).json({ message: 'Invalid email or password.' });

    await db.query('UPDATE teachers SET last_login=NOW() WHERE teacher_id=?', [teacher.teacher_id]);
    const token = jwt.sign(
      { teacher_id: teacher.teacher_id, email: teacher.email, full_name: teacher.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      teacher: {
        teacher_id: teacher.teacher_id,
        full_name: teacher.full_name,
        email: teacher.email,
        school_name: teacher.school_name,
        city: teacher.city,
        state: teacher.state,
        phone: teacher.phone,
        type_id: teacher.type_id,
        board_id: teacher.board_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const [[t]] = await db.query(
      `SELECT t.teacher_id,t.full_name,t.email,t.school_name,t.city,t.state,t.phone,
              t.type_id,t.board_id,t.created_at,
              tt.type_name, b.board_name
       FROM teachers t
       LEFT JOIN teacher_types tt ON tt.type_id=t.type_id
       LEFT JOIN boards b ON b.board_id=t.board_id
       WHERE t.teacher_id=?`,
      [req.teacher.teacher_id]
    );
    if (!t) return res.status(404).json({ message: 'Teacher not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { full_name, school_name, city, state, phone, type_id, board_id } = req.body;
    await db.query(
      `UPDATE teachers SET full_name=?,school_name=?,city=?,state=?,phone=?,type_id=?,board_id=?
       WHERE teacher_id=?`,
      [full_name, school_name, city, state, phone, type_id, board_id, req.teacher.teacher_id]
    );
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const [[t]] = await db.query('SELECT password_hash FROM teachers WHERE teacher_id=?', [req.teacher.teacher_id]);
    const match = await bcrypt.compare(current_password, t.password_hash);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE teachers SET password_hash=? WHERE teacher_id=?', [hash, req.teacher.teacher_id]);
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
