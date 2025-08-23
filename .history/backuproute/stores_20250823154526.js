const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../db');


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


router.get('/:id', authMiddleware, async (req, res) => {
    const storeId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM stores WHERE id = $1', [storeId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ code: 404, message: 'Store not found' });
        }
        res.json({
            code: 200,
            message: 'Store details retrieved successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});



router.get('/:id/products', authMiddleware, async (req, res) => {
    const storeId = parseInt(req.params.id, 10);
    const search = req.query.search || '';
    if (isNaN(storeId)) {
        return res.status(400).json({ code: 400, message: 'Invalid store ID' });
    }
    try {
        const result = await pool.query(`
            SELECT 
                p.id, 
                p.nama_produk, 
                p.barcode, 
                p.image,                           -- <<<< tambah image
                COALESCE(sp.available, 0) AS available,  -- 0/1
                sp.promo_price
            FROM products p
            LEFT JOIN store_products sp 
              ON sp.product_id = p.id AND sp.store_id = $1
            WHERE p.nama_produk ILIKE $2 OR p.barcode ILIKE $2
            ORDER BY p.nama_produk ASC
        `, [storeId, `%${search}%`]);

        res.json({
            code: 200,
            message: 'Products retrieved successfully',
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});



router.post('/:id/products/batch', authMiddleware, async (req, res) => {
    const storeId = parseInt(req.params.id, 10);
    const { products } = req.body;

    if (isNaN(storeId)) {
        return res.status(400).json({ code: 400, message: 'Invalid store ID' });
    }
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ code: 400, message: 'Products array is required' });
    }
    try {
        const results = [];
        for (const prod of products) {
            const productId = parseInt(prod.id, 10);
            const available = prod.available === 1 ? 1 : 0;
            const promoPrice = prod.promo_price ? parseFloat(prod.promo_price) : null;
            if (isNaN(productId)) {
                return res.status(400).json({ code: 400, message: `Invalid product ID: ${prod.id}` });
            }
            const result = await pool.query(
                `INSERT INTO store_products (store_id, product_id, available, promo_price)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (store_id, product_id)
                 DO UPDATE SET available = $3, promo_price = $4
                 RETURNING *`,
                [storeId, productId, available, promoPrice]
            );
            results.push(result.rows[0]);
        }

        res.json({
            code: 200,
            message: 'Products availability updated successfully',
            data: results
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
});



module.exports = router;
