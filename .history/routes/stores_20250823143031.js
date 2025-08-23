const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db');

// GET /v1/stores?search=keyword
router.get('/', authMiddleware, async (req, res) => {
    const search = req.query.search || '';

    try {
        const result = await pool.query(
            `SELECT * FROM stores
             WHERE nama_toko ILIKE $1 OR kode_toko ILIKE $1
             ORDER BY nama_toko ASC`,
            [`%${search}%`]
        );

        res.json({
            code: 200,
            message: 'Stores retrieved successfully',
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});

module.exports = router;
