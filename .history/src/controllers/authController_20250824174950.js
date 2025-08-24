const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
    const { identifier, password } = req.body; // identifier = bisa email atau username
    if (!identifier || !password) {
        return res.status(400).json({ code: 400, message: 'Username/Email dan password wajib diisi' });
    }

    try {
        // Cari user berdasarkan email ATAU username
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [identifier]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ code: 404, message: 'User tidak ditemukan' });
        }

        const user = result.rows[0];

        // Cek password (⚠️ sebaiknya pakai bcrypt, tapi ini plain-text sesuai kodenya)
        if (user.password !== password) {
            return res.status(401).json({ code: 401, message: 'Password salah' });
        }

        // Generate JWT
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            code: 200,
            message: 'Login berhasil',
            username: user.username,
            email: user.email,
            accesstoken: `Bearer ${accessToken}`,
            refreshtoken: `Bearer ${refreshToken}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT id AS user_id, name, email FROM users WHERE id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }
        res.json({
            code: 200,
            message: 'Success Retrieve Profile Data',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};