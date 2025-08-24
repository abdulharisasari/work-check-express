const pool = require('../config/db');
const fs = require('fs');
const fs = require('fs');
const path = require('path');

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
                // Cek apakah kolom image sudah Base64 atau path file
                if (row.image.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(row.image)) {
                    // Sudah Base64, langsung dikembalikan
                    return row;
                } else {
                    // Jika masih path, baca file dan konversi ke Base64
                    const filePath = path.join(__dirname, '..', 'uploads', path.basename(row.image));
                    if (fs.existsSync(filePath)) {
                        const fileData = fs.readFileSync(filePath);
                        const base64 = fileData.toString('base64');
                        return { ...row, image: `data:image/jpeg;base64,${base64}` };
                    }
                }
            }
            return row;
        });

        res.json({ code: 200, message: 'Attendance data retrieved successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};


exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { status, address, type, date, time, leave_type, notes, imageBase64 } = req.body; // tambahkan imageBase64
        let result;

        if (status == 1) {
            // Jika ada Base64, simpan langsung sebagai string di DB
            const imageData = imageBase64 || null;

            result = await pool.query(
                `INSERT INTO attendance (user_id, status, image, address, type, date, time)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, imageData, address, type, date, time]
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
