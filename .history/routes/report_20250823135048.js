const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db');

// Protected endpoint example
router.post('/attendance', authMiddleware, async (req, res) => {
    const { user_id, date, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO attendance (user_id, date, status) VALUES ($1, $2, $3) RETURNING *',
            [user_id, date, status]
        );
        res.json({ message: 'Attendance recorded', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
