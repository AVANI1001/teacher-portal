const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/boards',     require('./routes/boards'));
app.use('/api/classes',    require('./routes/classes'));
app.use('/api/subjects',   require('./routes/subjects'));
app.use('/api/chapters',   require('./routes/chapters'));
app.use('/api/topics',     require('./routes/topics'));
app.use('/api/questions',  require('./routes/questions'));
app.use('/api/papers',     require('./routes/papers'));
app.use('/api/master',     require('./routes/master'));
app.use('/api/settings',   require('./routes/settings'));
app.use('/api/dashboard',  require('./routes/dashboard'));

app.get('/', (req, res) => res.json({ message: 'Teacher Portal API v1.0 running ✓' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🚀 Server running on http://localhost:${PORT}\n`));
