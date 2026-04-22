const router = require('express').Router();
const db = require('../config/db');
const protect = require('../middleware/auth');
router.get('/', protect, async (req, res) => {
  try {
    const { chapter_id } = req.query;
    if (!chapter_id) return res.status(400).json({ message: 'chapter_id required' });
    const [rows] = await db.query(
      'SELECT * FROM topics WHERE chapter_id=? AND is_active=1 ORDER BY topic_number',
      [chapter_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
