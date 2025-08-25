-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- contoh: 'admin', 'karyawan'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Stores
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Attendance (Absensi)
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
    checkin TIMESTAMP NOT NULL,
    checkout TIMESTAMP,
    image VARCHAR(255), -- path ke file di folder uploads
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Products (opsional, jika ada produk di toko)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Promos
CREATE TABLE IF NOT EXISTS promos (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    image VARCHAR(255), -- path ke file di folder uploads
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_store_id ON attendance(store_id);
CREATE INDEX IF NOT EXISTS idx_promos_store_id ON promos(store_id);

-- Dummy admin user (optional, hapus jika tidak perlu)
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$hashpassworddummy', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ...tambahkan data dummy lain jika perlu...
