
const express = require('express');
const router = express.Router();
const authMiddleware = require('./middleware/authMiddleware');
const pool = require('./db');


router.post('/:id/promos', authMiddleware, async (req, res) => {
    const storeId = parseInt(req.params.id, 10);
    const { nama_produk, harga_normal, harga_promo, image } = req.body;

    if (isNaN(storeId)) {
        return res.status(400).json({ code: 400, message: 'Invalid store ID' });
    }
    if (!nama_produk || !harga_normal || !harga_promo) {
        return res.status(400).json({ code: 400, message: 'Nama produk, harga normal, dan harga promo wajib diisi' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO store_promos (store_id, nama_produk, harga_normal, harga_promo, image)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [storeId, nama_produk, harga_normal, harga_promo, image || null]
        );
        res.json({
            code: 200,
            message: 'Promo berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});


router.get('/:id/promos', authMiddleware, async (req, res) => {
    const storeId = parseInt(req.params.id, 10);

    if (isNaN(storeId)) {
        return res.status(400).json({ code: 400, message: 'Invalid store ID' });
    }
    try {
        const result = await pool.query(
            `SELECT * FROM store_promos WHERE store_id = $1 ORDER BY created_at DESC`,
            [storeId]
        );
        res.json({
            code: 200,
            message: 'Daftar promo berhasil diambil',
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});

module.exports = router;
