const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post(
    '/attendance',
    authMiddleware,
    upload.single('image'),  // <--- ini menangani file upload
    reportController.postAttendance
);

// GET attendance
router.get('/attendance',authMiddleware,reportController.getAttendance);
router.get('/attendance/today', authMiddleware, reportController.getTodayCheckinCheckout);

module.exports = router;
