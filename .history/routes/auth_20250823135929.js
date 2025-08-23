const express = require('express');
const bodyParser = require('body-parser'); // opsional
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
require('dotenv').config();

const app = express();

// Middleware JSON parsing
app.use(express.json());           // <--- wajib
// app.use(bodyParser.json());     // opsional, sama fungsinya

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/report', reportRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
