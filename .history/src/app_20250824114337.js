const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const storeRoutes = require('./routes/storeRoutes');
const promoRoutes = require('./routes/promoRoutes');

const app = express();
app.use(bodyParser.json());
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads'); // ../ jika controller di dalam folder
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const filename = `${Date.now()}.jpg`;
const filepath = path.join(uploadsDir, filename);
fs.writeFileSync(filepath, buffer); // buffer dari Base64 atau upload
const imagePath = `/uploads/${filename}`; // simpan ini di DB

app.use('/v1/auth', authRoutes);
app.use('/v1/report', reportRoutes);
app.use('/v1/stores', storeRoutes);
app.use('/v1/stores', promoRoutes);

module.exports = app;