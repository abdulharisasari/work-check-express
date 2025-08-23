-- Buat database (jalankan di psql, bukan di query tool pgAdmin)
CREATE DATABASE db_workcheck;

-- Setelah itu, connect ke database db_workcheck dan jalankan query berikut:

-- Tabel users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- Tabel attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status INTEGER NOT NULL, -- 1: hadir, 0: izin
    image TEXT,
    address TEXT,
    type VARCHAR(50),
    date DATE NOT NULL,
    time TIME,
    leave_type VARCHAR(50),
    notes TEXT
);

-- Tabel stores
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    nama_toko VARCHAR(100) NOT NULL,
    kode_toko VARCHAR(50) UNIQUE NOT NULL,
    alamat TEXT
);

-- Tabel products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    image TEXT
);

-- Relasi produk di toko (ketersediaan dan harga promo)
CREATE TABLE store_products (
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    available INTEGER DEFAULT 0,
    promo_price NUMERIC,
    PRIMARY KEY (store_id, product_id)
);

-- Tabel promo di toko
CREATE TABLE store_promos (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    nama_produk VARCHAR(100) NOT NULL,
    harga_normal NUMERIC NOT NULL,
    harga_promo NUMERIC NOT NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);