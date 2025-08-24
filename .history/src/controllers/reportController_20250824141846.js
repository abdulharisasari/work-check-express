const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// GET semua attendance
exports.getAttendance = async (req, res) => {
    const user_id = req.user.id;
    const sort = req.query.sort;

    try {
        let query = 'SELECT * FROM attendance WHERE user_id = $1';
        let params = [user_id];

        if (sort === 'izin') {
            query += ' AND status = $2';
            params.push(0);
        } else if (sort === 'present') {
            query += ' AND status = $2';
            params.push(1);
        }

        query += ' ORDER BY date DESC, time DESC';

        const result = await pool.query(query, params);

        const data = result.rows.map(row => {
            if (row.image && !row.image.startsWith('http')) {
                row.image = `${req.protocol}://${req.get('host')}/uploads/${row.image}`;
            }
            return {
                ...row,
                time_checkin: row.time_checkin || null,
                time_checkout: row.time_checkout || null,
                time: row.time || null,
            };
        });

        res.json({ code: 200, message: 'Attendance data retrieved successfully', data });
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};

// GET today check-in & check-out
exports.getTodayCheckinCheckout = async (req, res) => {
    const user_id = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    try {
        const result = await pool.query(
            `SELECT date, time_checkin, time_checkout 
             FROM attendance_today 
             WHERE user_id = $1 AND date = $2`,
            [user_id, today]
        );

        const data = result.rows[0] || { date: today, time_checkin: null, time_checkout: null };

        res.json({ code: 200, message: 'Today check-in & check-out retrieved', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};

// POST attendance
exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { status, address, date, time, leave_type, notes, image } = req.body;

        let result;
        let imagePath = null;
        let fileBuffer = null;

        // Tentukan type otomatis
        let autoType = status === 1 ? 'check-in' : status === 2 ? 'check-out' : null;

        let timeCheckIn = null;
        let timeCheckOut = null;
        let leaveTime = null;
        if (status === 1) timeCheckIn = time;
        else if (status === 2) timeCheckOut = time;
        else if (status === 0) leaveTime = time || null;

        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        // Handle file upload
        if (req.file) {
            const filename = `${Date.now()}_${req.file.originalname}`;
            const filepath = path.join(uploadsDir, filename);
            fs.renameSync(req.file.path, filepath);
            imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            fileBuffer = fs.readFileSync(filepath);
        } else if (image) {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, buffer);
            imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            fileBuffer = buffer;
        }

        // Insert ke attendance
        if (status === 1 || status === 2) {
            result = await pool.query(
                `INSERT INTO attendance 
                 (user_id, status, image, address, type, date, time_checkin, time_checkout)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
                [user_id, status, imagePath, address, autoType, date, timeCheckIn, timeCheckOut]
            );

            // Update atau insert ke attendance_today
            const todayRes = await pool.query(
                `SELECT * FROM attendance_today WHERE user_id = $1 AND date = $2`,
                [user_id, date]
            );

            if (todayRes.rows.length > 0) {
                await pool.query(
                    `UPDATE attendance_today 
                     SET time_checkin = COALESCE($1, time_checkin),
                         time_checkout = COALESCE($2, time_checkout)
                     WHERE user_id = $3 AND date = $4`,
                    [timeCheckIn, timeCheckOut, user_id, date]
                );
            } else {
                await pool.query(
                    `INSERT INTO attendance_today (user_id, date, time_checkin, time_checkout)
                     VALUES ($1,$2,$3,$4)`,
                    [user_id, date, timeCheckIn, timeCheckOut]
                );
            }

        } else if (status === 0) {
            result = await pool.query(
                `INSERT INTO attendance 
                 (user_id, status, leave_type, notes, date, time, address)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, leave_type || '', notes || '', date, leaveTime, address || '']
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
