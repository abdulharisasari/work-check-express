CREATE DATABASE db_workcheck;

-- Setelah connect ke db_workcheck, jalankan query berikut:

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status INTEGER NOT NULL,
    image TEXT,
    address TEXT,
    type VARCHAR(50),
    date DATE NOT NULL,
    time TIME,
    leave_type VARCHAR(50),
    notes TEXT
);

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    nama_toko VARCHAR(100) NOT NULL,
    kode_toko VARCHAR(50) UNIQUE NOT NULL,
    alamat TEXT
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    image TEXT
);

CREATE TABLE store_products (
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    available INTEGER DEFAULT 0,
    promo_price NUMERIC,
    PRIMARY KEY (store_id, product_id)
);

CREATE TABLE store_promos (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    nama_produk VARCHAR(100) NOT NULL,
    harga_normal NUMERIC NOT NULL,
    harga_promo NUMERIC NOT NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);