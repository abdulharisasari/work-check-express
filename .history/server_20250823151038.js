const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');
const storeRoutes = require('./routes/stores');
const promoRoutes = require('./routes/promos');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/report', reportRoutes);
app.use('/v1/stores', storeRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
