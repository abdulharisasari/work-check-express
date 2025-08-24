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
        const data = result.rows.map(row => {
            if (row.image) {
                return { ...row, image: `${req.protocol}://${req.get('host')}/uploads/${row.image.split('/').pop()}` };
            }
            return row;
        });

        res.json({ code: 200, message: 'Attendance data retrieved successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};


const fs = require('fs');
const path = require('path');

exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { status, address, type, date, time, leave_type, notes, localImagePath } = req.body;
        let result;
        let imagePath = null;

        if (status == 1) {
            // Jika ada file upload via form
            if (req.file) {
                imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            } 
            // Jika ada path lokal yang dikirim di request body
            else if (localImagePath) {
                // Pastikan file ada
                const fullPath = path.resolve(localImagePath);
                if (!fs.existsSync(fullPath)) {
                    return res.status(400).json({ code: 400, message: 'File not found' });
                }
                // Bisa simpan path relatif atau upload ke server agar bisa diakses via URL
                imagePath = fullPath;
            }

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
