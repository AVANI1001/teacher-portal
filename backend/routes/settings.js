const router = require('express').Router();
const db = require('../config/db');
const protect = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM paper_settings WHERE teacher_id=? ORDER BY created_at DESC', [req.teacher.teacher_id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/save', protect, async (req, res) => {
  try {
    const { setting_name, board_id, class_id, subject_id, sections_json, exam_type_id } = req.body;
    const [result] = await db.query(
      `INSERT INTO paper_settings (teacher_id,setting_name,board_id,class_id,subject_id,sections_json,exam_type_id)
       VALUES (?,?,?,?,?,?,?)`,
      [req.teacher.teacher_id, setting_name, board_id||null, class_id||null,
       subject_id||null, JSON.stringify(sections_json)||null, exam_type_id||null]
    );
    res.status(201).json({ message: 'Settings saved.', setting_id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await db.query('DELETE FROM paper_settings WHERE setting_id=? AND teacher_id=?', [req.params.id, req.teacher.teacher_id]);
    res.json({ message: 'Setting deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
