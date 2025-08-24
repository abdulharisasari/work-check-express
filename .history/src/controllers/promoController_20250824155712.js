const pool = require('../config/db');
const fs = require('fs');
const path = require('path');


exports.addPromo = async (req, res) => {
    const storeId = parseInt(req.params.id, 10);
    const { nama_produk, harga_normal, harga_promo, image, barcode } = req.body;

    if (isNaN(storeId)) {
        return res.status(400).json({ code: 400, message: 'Invalid store ID' });
    }
    if (!nama_produk || !harga_normal || !harga_promo) {
        return res.status(400).json({ code: 400, message: 'Nama produk, harga normal, dan harga promo wajib diisi' });
    }

    try {
        let imagePath = null;

        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        // === handle file upload ===
        if (req.file) {
            const filename = `${Date.now()}_${req.file.originalname}`;
            const filepath = path.join(uploadsDir, filename);
            fs.renameSync(req.file.path, filepath);
            imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
        } else if (image) {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, buffer);
            imagePath = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
        }

        // === insert ke products (kalau belum ada) ===
        let productResult = await pool.query(
            `INSERT INTO products (nama_produk, barcode, image)
             VALUES ($1, $2, $3)
             ON CONFLICT (barcode) DO UPDATE 
               SET nama_produk = EXCLUDED.nama_produk, image = EXCLUDED.image
             RETURNING *`,
            [nama_produk, barcode || null, imagePath]
        );

        const product = productResult.rows[0];

        // === insert/update ke store_products ===
        const storeProdResult = await pool.query(
            `INSERT INTO store_products (store_id, product_id, available, promo_price)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (store_id, product_id)
             DO UPDATE SET available = $3, promo_price = $4
             RETURNING *`,
            [storeId, product.id, 1, harga_promo]
        );

        res.json({
            code: 200,
            message: 'Promo berhasil ditambahkan ke produk',
            data: {
                product: product,
                store_product: storeProdResult.rows[0]
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};

exports.getPromos = async (req, res) => {
    const storeId = parseInt(req.params.id, 10);
    if (isNaN(storeId)) {
        return res.status(400).json({ code: 400, message: 'Invalid store ID' });
    }
    try {
        const result = await pool.query(
            `SELECT * FROM store_promos WHERE store_id = $1 ORDER BY created_at DESC`,
            [storeId]
        );
        res.json({ code: 200, message: 'Daftar promo berhasil diambil', data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: 'Server error' });
    }
};