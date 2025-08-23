const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db');

// POST /v1/report/attendance
router.post('/attendance', authMiddleware, async (req, res) => {
    const { status, image, address, type, date, time } = req.body;
    const user_id = req.user.id; // from JWT

    if (!date || !time) {
        return res.status(400).json({ code: 400, message: 'Date and time are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO attendance (user_id, status, image, address, type, date, time)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [user_id, status, image, address, type, date, time]
        );

        res.json({
            code: 200,
            message: 'Attendance recorded successfully',
            data: {
                username: req.user.email,
                status: status === 1 ? 'Present' : 'Absent',
                type: type,
                date: date,
                time: time,
                address: address,
                image: image // Base64 string
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});

module.exports = router;
