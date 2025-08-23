const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/attendance', authMiddleware, reportController.getAttendance);
router.post('/attendance', authMiddleware, reportController.postAttendance);

module.exports = router;