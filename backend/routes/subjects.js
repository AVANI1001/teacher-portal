const router = require('express').Router();
const db = require('../config/db');
router.get('/', async (req, res) => {
  try {
    const { board_id, class_id } = req.query;
    if (!board_id || !class_id) return res.status(400).json({ message: 'board_id and class_id required' });
    const [rows] = await db.query(
      'SELECT * FROM subjects WHERE board_id=? AND class_id=? AND is_active=1 ORDER BY subject_name',
      [board_id, class_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
