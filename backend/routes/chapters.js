const router = require('express').Router();
const db = require('../config/db');
const protect = require('../middleware/auth');
router.get('/', protect, async (req, res) => {
  try {
    const { subject_id } = req.query;
    if (!subject_id) return res.status(400).json({ message: 'subject_id required' });
    const [rows] = await db.query(
      'SELECT * FROM chapters WHERE subject_id=? AND is_active=1 ORDER BY chapter_number',
      [subject_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
