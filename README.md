# AI Teacher Question Paper Portal

## Project Structure
```
project/
├── backend/          ← Node.js + Express API
│   ├── server.js
│   ├── .env
│   ├── config/db.js
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js
│       ├── boards.js
│       ├── classes.js
│       ├── subjects.js
│       ├── chapters.js
│       ├── topics.js
│       ├── questions.js
│       ├── papers.js
│       ├── master.js
│       ├── settings.js
│       └── dashboard.js
└── frontend/         ← React.js
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── config.js
        ├── api/index.js
        ├── context/AuthContext.js
        ├── styles/global.css
        ├── components/Layout.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── GeneratePaper.js
            ├── MyPapers.js
            ├── ViewPaper.js
            ├── QuestionBank.js
            └── Profile.js
```

## Setup Instructions

### Step 1 — Database (XAMPP)
1. Start XAMPP → Start Apache + MySQL
2. Open http://localhost/phpmyadmin
3. Create database: `teacher_portal`
4. Import `teacher_portal.sql` (from previous download)

### Step 2 — Backend
```bash
cd backend
npm install
# Edit .env if needed (DB_PASS if you set a MySQL password)
node server.js
# Runs on http://localhost:5000
```

### Step 3 — Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Step 4 — Open Browser
Go to http://localhost:3000
Register a teacher account → Login → Generate Papers!

## Features
- Teacher Registration & Login (JWT auth)
- Generate question papers for all boards & subjects
- MCQ, Short Answer, Long Answer, Case Study, Fill Blanks, True/False, Match Column, Diagram sections
- Pre-loaded question bank (CBSE Class 10 Maths, Science, SST, English)
- Add your own questions to the question bank
- Print-ready paper with mark distribution table
- Toggle answer key view
- My Papers — view, print, delete all past papers
- Profile management & password change
- Dashboard with stats and recent papers
