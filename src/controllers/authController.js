const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ code: 401, message: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({
            code: 200,
            message: 'Login successful',
            username: user.name,
            token: token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};