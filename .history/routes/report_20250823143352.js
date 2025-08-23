const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db');


router.get('/attendance', authMiddleware, async (req, res) => {
    const user_id = req.user.id; // opsional kalau mau filter per user
    const sort = req.query.sort; // opsional: "izin" atau "present"

    try {
        let query = 'SELECT * FROM attendance';
        let params = [];

        if (sort === 'izin') {
            query += ' WHERE status = $1';
            params.push(0);
        } else if (sort === 'present') {
            query += ' WHERE status = $1';
            params.push(1);
        }

        // contoh filter per user jika mau
        // query += params.length ? ' AND user_id = $2' : ' WHERE user_id = $1';
        // params.push(user_id);

        query += ' ORDER BY date DESC, time DESC';

        const result = await pool.query(query, params);

        res.json({
            code: 200,
            message: 'Attendance data retrieved successfully',
            data: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});



router.post('/attendance', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const user_id = req.user.id; // dari JWT

    try {
        let result;

        if (status === 1) {
            // Kehadiran
            const { image, address, type, date, time } = req.body;
            if (!date || !time) {
                return res.status(400).json({ code: 400, message: 'Date and time are required' });
            }

            result = await pool.query(
                `INSERT INTO attendance (user_id, status, image, address, type, date, time)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, image, address, type, date, time]
            );

        } else if (status === 0) {
            // Izin
            const { date, leave_type, notes } = req.body;
            if (!date || !leave_type) {
                return res.status(400).json({ code: 400, message: 'Date and leave type are required' });
            }

            result = await pool.query(
                `INSERT INTO attendance (user_id, status, leave_type, notes, date)
                 VALUES ($1,$2,$3,$4,$5) RETURNING *`,
                [user_id, status, leave_type, notes || '', date]
            );
        } else {
            return res.status(400).json({ code: 400, message: 'Invalid status value' });
        }

        res.json({
            code: 200,
            message: status === 1 ? 'Attendance recorded successfully' : 'Leave recorded successfully',
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});

module.exports = router;
