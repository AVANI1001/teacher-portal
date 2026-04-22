const router = require('express').Router();
const db = require('../config/db');
router.get('/', async (req, res) => {
  try {
    const { board_id } = req.query;
    if (!board_id) return res.status(400).json({ message: 'board_id required' });
    const [rows] = await db.query(
      'SELECT * FROM classes WHERE board_id=? AND is_active=1 ORDER BY class_number',
      [board_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
