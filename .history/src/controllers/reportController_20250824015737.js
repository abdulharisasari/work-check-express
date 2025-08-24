const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// -------------------- GET ATTENDANCE --------------------
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
            if (row.image) {
                return {
                    ...row,
                    image: `${req.protocol}://${req.get('host')}/uploads/${row.image}`
                };
            }
            return row;
        });

        res.json({ code: 200, message: 'Attendance data retrieved successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};

// -------------------- POST ATTENDANCE --------------------
exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { status, address, type, date, time, leave_type, notes, imageBase64 } = req.body;
        let result;

        if (status == 1) {
            let imageFilename = null;

            if (imageBase64) {
                // convert base64 → file
                const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
                imageFilename = `${Date.now()}.png`;
                const uploadPath = path.join(__dirname, '..', 'uploads', imageFilename);

                fs.writeFileSync(uploadPath, base64Data, 'base64');
            }

            result = await pool.query(
                `INSERT INTO attendance (user_id, status, image, address, type, date, time)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, imageFilename, address, type, date, time]
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

        // ubah response jadi full URL kalau ada image
        const row = result.rows[0];
        if (row.image) {
            row.image = `${req.protocol}://${req.get('host')}/uploads/${row.image}`;
        }

        res.json({ code: 200, message: 'Attendance recorded', data: row });

    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};
