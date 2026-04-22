const router = require('express').Router();
const db = require('../config/db');
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM boards WHERE is_active=1 ORDER BY board_name');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
