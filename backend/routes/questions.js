const router = require('express').Router();
const db = require('../config/db');
const protect = require('../middleware/auth');

// GET /api/questions?chapter_id=1&section_id=1&difficulty_id=2
router.get('/', protect, async (req, res) => {
  try {
    const { chapter_id, section_id, difficulty_id, subject_id } = req.query;
    let query = `SELECT q.*, ps.section_name, ps.question_type, d.level_name,
                        ch.chapter_name, t.topic_name
                 FROM question_bank q
                 LEFT JOIN paper_sections ps ON ps.section_id = q.section_id
                 LEFT JOIN difficulty_levels d ON d.difficulty_id = q.difficulty_id
                 LEFT JOIN chapters ch ON ch.chapter_id = q.chapter_id
                 LEFT JOIN topics t ON t.topic_id = q.topic_id
                 WHERE q.is_active=1`;
    const params = [];
    if (chapter_id) { query += ' AND q.chapter_id=?'; params.push(chapter_id); }
    if (section_id)  { query += ' AND q.section_id=?';  params.push(section_id); }
    if (difficulty_id){ query += ' AND q.difficulty_id=?'; params.push(difficulty_id); }
    if (subject_id) {
      query += ' AND q.chapter_id IN (SELECT chapter_id FROM chapters WHERE subject_id=?)';
      params.push(subject_id);
    }
    query += ' ORDER BY q.chapter_id, q.question_id';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/questions/add  — teacher adds own question
router.post('/add', protect, async (req, res) => {
  try {
    const {
      chapter_id, topic_id, section_id, difficulty_id,
      question_text, option_a, option_b, option_c, option_d,
      correct_answer, answer_text, marks
    } = req.body;
    if (!chapter_id || !section_id || !difficulty_id || !question_text)
      return res.status(400).json({ message: 'Required fields missing.' });
    const [result] = await db.query(
      `INSERT INTO question_bank
       (chapter_id,topic_id,section_id,difficulty_id,question_text,
        option_a,option_b,option_c,option_d,correct_answer,answer_text,marks,added_by,teacher_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [chapter_id, topic_id||null, section_id, difficulty_id, question_text,
       option_a||null, option_b||null, option_c||null, option_d||null,
       correct_answer||null, answer_text||null, marks||1, 'teacher', req.teacher.teacher_id]
    );
    res.status(201).json({ message: 'Question added.', question_id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/questions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await db.query(
      'UPDATE question_bank SET is_active=0 WHERE question_id=? AND teacher_id=?',
      [req.params.id, req.teacher.teacher_id]
    );
    res.json({ message: 'Question removed.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
