const pool = require('../config/db');
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





exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        console.log('User ID:', user_id);

        const { status, address, type, date, time, leave_type, notes, localImagePath } = req.body;
        console.log('Request body:', req.body);

        let result;
        let imagePath = null;
        let fileBuffer = null;

        if (status == 1) {
            console.log('Status 1: Attendance with image');

            // Kalau ada file upload via form
            if (req.file) {
                console.log('File uploaded:', req.file);
                imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
                try {
                    fileBuffer = fs.readFileSync(req.file.path);
                } catch (err) {
                    console.error('Error reading uploaded file:', err);
                    return res.status(500).json({ code: 500, message: 'Error reading uploaded file' });
                }
            }
            // Kalau ada path lokal
            else if (localImagePath) {
                try {
                    const base64Data = localImagePath.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    const filename = `uploads/${Date.now()}.jpg`;
                    fs.writeFileSync(filename, buffer);
                    imagePath = filename;       // path file server
                    fileBuffer = buffer;        // buffer image
                    console.log('Image saved to', filename);
                } catch (err) {
                    console.error('Error saving base64 image:', err);
                    return res.status(500).json({ code: 500, message: 'Error saving image' });
                }
            }


            // Print preview image
            if (fileBuffer) {
                const base64Image = fileBuffer.toString('base64');
                console.log('Image Base64 Preview (100 chars):', base64Image.substring(0, 100), '...');
            }

            // Simpan ke database
            try {
                result = await pool.query(
                    `INSERT INTO attendance (user_id, status, image, address, type, date, time)
                     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                    [user_id, status, imagePath, address, type, date, time]
                );
            } catch (err) {
                console.error('Database insert error:', err);
                return res.status(500).json({ code: 500, message: 'Database error' });
            }

        } else if (status == 0) {
            console.log('Status 0: Leave request');
            try {
                result = await pool.query(
                    `INSERT INTO attendance (user_id, status, leave_type, notes, date)
                     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
                    [user_id, status, leave_type, notes || '', date]
                );
            } catch (err) {
                console.error('Database insert error for leave:', err);
                return res.status(500).json({ code: 500, message: 'Database error' });
            }

        } else {
            console.warn('Invalid status:', status);
            return res.status(400).json({ code: 400, message: 'Invalid status' });
        }

        console.log('Attendance recorded successfully:', result.rows[0]);
        res.json({ code: 200, message: 'Attendance recorded', data: result.rows[0] });

    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};
