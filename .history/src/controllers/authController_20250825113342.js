const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
    const { email, password } = req.body; 
    if (!email || !password) {
        return res.status(400).json({ code: 400, message: 'Email/Username dan password wajib diisi' });
    }
    try {
        
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [email]  
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }
        const user = result.rows[0];

        
        if (user.password !== password) {
            return res.status(401).json({ code: 401, message: 'Wrong password' });
        }

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
            message: 'Login successful',
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