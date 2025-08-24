const pool = require('../config/db');
const fs = require('fs');


exports.getAttendance = async (req, res) => {
    const user_id = req.user.id;
    const sort = req.query.sort;
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
        query += ' ORDER BY date DESC, time DESC';
        const result = await pool.query(query, params);
        res.json({ code: 200, message: 'Attendance data retrieved successfully', data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};


exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { status, address, type, date, time, leave_type, notes } = req.body;
        let result;

        if (status == 1) {
            const imagePath = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

            // const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;
            result = await pool.query(
                `INSERT INTO attendance (user_id, status, image, address, type, date, time)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, imagePath, address, type, date, time]
            );
        } else if (status == 0) {
            result = await pool.query(
                `INSERT INTO attendance (user_id, status, leave_type, notes, date)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
                [user_id, status, leave_type, notes || '', date]
            );
        } else {
            return res.status(400).json({ code: 400, message: 'Invalid status' });
        }

        res.json({ code: 200, message: 'Attendance recorded', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};