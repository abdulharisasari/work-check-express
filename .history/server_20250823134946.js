const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/report', reportRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
