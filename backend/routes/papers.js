const router = require('express').Router();
const db = require('../config/db');
const protect = require('../middleware/auth');

// POST /api/papers/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const {
      subject_id, exam_type_id, difficulty_id,
      paper_title, class_name, division, school_name, board_name,
      total_marks, duration_min, instructions, language,
      sections
    } = req.body;

    if (!subject_id || !exam_type_id || !difficulty_id || !paper_title || !sections || !sections.length)
      return res.status(400).json({ message: 'Required fields missing.' });

    const [paperResult] = await db.query(
      `INSERT INTO question_papers
       (teacher_id,subject_id,exam_type_id,difficulty_id,paper_title,class_name,
        division,school_name,board_name,total_marks,duration_min,instructions,language,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'published')`,
      [req.teacher.teacher_id, subject_id, exam_type_id, difficulty_id,
       paper_title, class_name, division||null, school_name||null, board_name||'',
       total_marks||80, duration_min||180, instructions||null, language||'English']
    );
    const paper_id = paperResult.insertId;

    let orderNum = 1;
    const markSchemeData = [];

    for (const sec of sections) {
      const { section_id, num_questions, marks_per_q } = sec;
      const numQ = parseInt(num_questions) || 5;
      const mPerQ = parseFloat(marks_per_q) || 1;

      const [qs] = await db.query(
        `SELECT q.question_id FROM question_bank q
         JOIN chapters ch ON ch.chapter_id = q.chapter_id
         WHERE ch.subject_id=? AND q.section_id=? AND q.difficulty_id=? AND q.is_active=1
         ORDER BY RAND() LIMIT ?`,
        [subject_id, section_id, difficulty_id, numQ]
      );

      for (const q of qs) {
        await db.query(
          `INSERT INTO paper_questions (paper_id,question_id,section_id,question_order,marks_assigned)
           VALUES (?,?,?,?,?)`,
          [paper_id, q.question_id, section_id, orderNum++, mPerQ]
        );
      }

      if (qs.length > 0) {
        await db.query(
          `INSERT INTO mark_schemes (paper_id,section_id,num_questions,marks_per_q,section_total)
           VALUES (?,?,?,?,?)`,
          [paper_id, section_id, qs.length, mPerQ, qs.length * mPerQ]
        );
        markSchemeData.push({ section_id, num_questions: qs.length, marks_per_q: mPerQ, section_total: qs.length * mPerQ });
      }
    }

    // Fetch full paper
    const [[paper]] = await db.query('SELECT * FROM question_papers WHERE paper_id=?', [paper_id]);
    const [questions] = await db.query(
      `SELECT pq.*,q.question_text,q.option_a,q.option_b,q.option_c,q.option_d,
              q.answer_text,q.question_image,ps.section_name,ps.question_type,ps.section_code
       FROM paper_questions pq
       JOIN question_bank q ON q.question_id=pq.question_id
       JOIN paper_sections ps ON ps.section_id=pq.section_id
       WHERE pq.paper_id=? ORDER BY pq.question_order`,
      [paper_id]
    );
    const [markScheme] = await db.query(
      `SELECT ms.*,ps.section_name,ps.section_code FROM mark_schemes ms
       JOIN paper_sections ps ON ps.section_id=ms.section_id
       WHERE ms.paper_id=?`,
      [paper_id]
    );

    res.status(201).json({ paper, questions, markScheme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/papers — all papers by this teacher
router.get('/', protect, async (req, res) => {
  try {
    const [papers] = await db.query(
      `SELECT qp.*,s.subject_name,et.exam_name,d.level_name as difficulty
       FROM question_papers qp
       LEFT JOIN subjects s ON s.subject_id=qp.subject_id
       LEFT JOIN exam_types et ON et.exam_type_id=qp.exam_type_id
       LEFT JOIN difficulty_levels d ON d.difficulty_id=qp.difficulty_id
       WHERE qp.teacher_id=? ORDER BY qp.created_at DESC`,
      [req.teacher.teacher_id]
    );
    res.json(papers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/papers/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const [[paper]] = await db.query(
      `SELECT qp.*,s.subject_name,et.exam_name,d.level_name as difficulty
       FROM question_papers qp
       LEFT JOIN subjects s ON s.subject_id=qp.subject_id
       LEFT JOIN exam_types et ON et.exam_type_id=qp.exam_type_id
       LEFT JOIN difficulty_levels d ON d.difficulty_id=qp.difficulty_id
       WHERE qp.paper_id=? AND qp.teacher_id=?`,
      [req.params.id, req.teacher.teacher_id]
    );
    if (!paper) return res.status(404).json({ message: 'Paper not found.' });

    const [questions] = await db.query(
      `SELECT pq.*,q.question_text,q.option_a,q.option_b,q.option_c,q.option_d,
              q.answer_text,q.question_image,ps.section_name,ps.question_type,ps.section_code
       FROM paper_questions pq
       JOIN question_bank q ON q.question_id=pq.question_id
       JOIN paper_sections ps ON ps.section_id=pq.section_id
       WHERE pq.paper_id=? ORDER BY pq.question_order`,
      [req.params.id]
    );
    const [markScheme] = await db.query(
      `SELECT ms.*,ps.section_name,ps.section_code FROM mark_schemes ms
       JOIN paper_sections ps ON ps.section_id=ms.section_id
       WHERE ms.paper_id=?`,
      [req.params.id]
    );

    res.json({ paper, questions, markScheme });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/papers/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const [[paper]] = await db.query(
      'SELECT paper_id FROM question_papers WHERE paper_id=? AND teacher_id=?',
      [req.params.id, req.teacher.teacher_id]
    );
    if (!paper) return res.status(404).json({ message: 'Paper not found.' });
    await db.query('DELETE FROM paper_questions WHERE paper_id=?', [req.params.id]);
    await db.query('DELETE FROM mark_schemes WHERE paper_id=?', [req.params.id]);
    await db.query('DELETE FROM question_papers WHERE paper_id=?', [req.params.id]);
    res.json({ message: 'Paper deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
