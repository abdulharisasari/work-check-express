const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db'); // koneksi PostgreSQL

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        if (user.rows.length === 0)
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
