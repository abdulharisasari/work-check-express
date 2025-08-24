const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// POST attendance
exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { status, address, date, leave_type, notes, image } = req.body;

        let result;
        let imagePath = null;
        let fileBuffer = null;

        // Tentukan type otomatis sesuai status
        let autoType = null;
        if (status === 1) autoType = 'check-in';
        else if (status === 2) autoType = 'check-out';

        // Tentukan waktu saat POST
        const currentTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS
        let timeCheckIn = null;
        let timeCheckOut = null;
        let leaveTime = null;

        if (status === 1) timeCheckIn = currentTime;
        else if (status === 2) timeCheckOut = currentTime;
        else if (status === 0) leaveTime = currentTime;

        // Folder uploads
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        // File upload via multipart/form-data
        if (req.file) {
            const filename = `${Date.now()}_${req.file.originalname}`;
            const filepath = path.join(uploadsDir, filename);
            fs.renameSync(req.file.path, filepath);
            imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            fileBuffer = fs.readFileSync(filepath);
        }
        // Base64 image
        else if (image) {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, buffer);
            imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            fileBuffer = buffer;
        }

        // Simpan ke database
        if (status === 1 || status === 2) {
            result = await pool.query(
                `INSERT INTO attendance 
                (user_id, status, image, address, type, date, time_checkin, time_checkout, time)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                [user_id, status, imagePath, address, autoType, date, timeCheckIn, timeCheckOut, currentTime]
            );
        } else if (status === 0) {
            // Leave request tetap kirim time & address
            result = await pool.query(
                `INSERT INTO attendance 
                (user_id, status, leave_type, notes, date, time, address)
                VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, leave_type || '', notes || '', date, leaveTime, address || '']
            );
        } else {
            return res.status(400).json({ code: 400, message: 'Invalid status' });
        }

        const statusText = status === 0 ? 'Leave' : status === 1 ? 'Check-in' : 'Check-out';
        console.log('Attendance recorded. Status:', statusText, 'Type:', autoType);

        res.json({ code: 200, message: 'Attendance recorded', data: result.rows[0] });

    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};

// GET all attendance
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

        const data = result.rows.map(row => ({
            ...row,
            time_checkin: row.time_checkin || null,
            time_checkout: row.time_checkout || null,
            time: row.time || null,
            image: row.image && !row.image.startsWith('http') ? `${req.protocol}://${req.get('host')}/uploads/${row.image}` : row.image
        }));

        res.json({ code: 200, message: 'Attendance data retrieved successfully', data });

    } catch (err) {
        console.error(err);
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
             FROM attendance
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
