const router = require('express').Router();
const db = require('../config/db');

router.get('/exam-types', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM exam_types WHERE is_active=1');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/difficulty-levels', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM difficulty_levels');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/sections', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM paper_sections WHERE is_active=1 ORDER BY section_code');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/teacher-types', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM teacher_types WHERE is_active=1');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
