const router = require('express').Router();
const db = require('../config/db');
const protect = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const tid = req.teacher.teacher_id;
    const [[totalPapers]] = await db.query('SELECT COUNT(*) as count FROM question_papers WHERE teacher_id=?', [tid]);
    const [[thisMonth]] = await db.query(
      'SELECT COUNT(*) as count FROM question_papers WHERE teacher_id=? AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())',
      [tid]
    );
    const [[myQuestions]] = await db.query('SELECT COUNT(*) as count FROM question_bank WHERE teacher_id=? AND is_active=1', [tid]);
    const [recent] = await db.query(
      `SELECT qp.*,s.subject_name,et.exam_name FROM question_papers qp
       LEFT JOIN subjects s ON s.subject_id=qp.subject_id
       LEFT JOIN exam_types et ON et.exam_type_id=qp.exam_type_id
       WHERE qp.teacher_id=? ORDER BY qp.created_at DESC LIMIT 5`,
      [tid]
    );
    res.json({
      totalPapers: totalPapers.count,
      thisMonth: thisMonth.count,
      myQuestions: myQuestions.count,
      recentPapers: recent
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
