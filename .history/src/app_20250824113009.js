const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const storeRoutes = require('./routes/storeRoutes');
const promoRoutes = require('./routes/promoRoutes');

const app = express();
app.use(bodyParser.json());

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/v1/auth', authRoutes);
app.use('/v1/report', reportRoutes);
app.use('/v1/stores', storeRoutes);
app.use('/v1/stores', promoRoutes);

module.exports = app;