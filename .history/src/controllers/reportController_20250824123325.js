const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

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

        // Pastikan image URL valid
        const data = result.rows.map(row => {
            if (row.image && !row.image.startsWith('http')) {
                // Jika image hanya nama file, bangun URL
                row.image = `${req.protocol}://${req.get('host')}/uploads/${row.image}`;
            }
            return row;
        });

        res.json({ code: 200, message: 'Attendance data retrieved successfully', data });
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};





exports.postAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        console.log('User ID:', user_id);

        const { status, address, date, time, leave_type, notes, image } = req.body;
        console.log('Request body:', req.body);

        let result;
        let imagePath = null;
        let fileBuffer = null;

        // Tentukan type otomatis sesuai status
        let autoType = null;
        if (status === 1) autoType = 'check-in';
        else if (status === 2) autoType = 'check-out';

        if (status === 1 || status === 2) {
            // Folder uploads
            const uploadsDir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

            // File upload via multipart/form-data
            if (req.file) {
                const filename = `${Date.now()}_${req.file.originalname}`;
                const filepath = path.join(uploadsDir, filename);
                fs.renameSync(req.file.path, filepath); // pindahkan file ke uploads
                imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
                fileBuffer = fs.readFileSync(filepath);
                console.log('File uploaded and moved to:', filepath);
            }
            // Base64 dari Flutter
            else if (image) {
                const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
                const filepath = path.join(uploadsDir, filename);
                fs.writeFileSync(filepath, buffer);
                imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
                fileBuffer = buffer;
                console.log('Base64 image saved to:', filepath);
            } else {
                console.warn('No image provided for status', status);
            }

            // Preview Base64 (opsional)
            if (fileBuffer) {
                const preview = fileBuffer.toString('base64').substring(0, 100);
                console.log('Image Base64 preview (100 chars):', preview, '...');
            }

            // Simpan ke database
            result = await pool.query(
                `INSERT INTO attendance (user_id, status, image, address, type, date, time)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, imagePath, address, autoType, date, time]
            );

        } else if (status === 0) {
            // Leave request
            result = await pool.query(
                `INSERT INTO attendance (user_id, status, leave_type, notes, date, time, address)
                VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [user_id, status, leave_type || '', notes || '', date, time || null, address || '']
            );

        } else {
            console.warn('Invalid status:', status);
            return res.status(400).json({ code: 400, message: 'Invalid status' });
        }

        // Print status dan type
        const statusText = status === 0 ? 'Leave' : status === 1 ? 'Check-in' : status === 2 ? 'Check-out' : 'Unknown';
        console.log('Attendance recorded successfully. Status:', statusText, 'Type:', autoType);

        res.json({ code: 200, message: 'Attendance recorded', data: result.rows[0] });

    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};