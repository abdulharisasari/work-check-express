-- Data dummy untuk tabel users
INSERT INTO public.users (name, email, password, username)
VALUES
('Admin', 'admin@workcheck.com', '$2b$10$dummyhashpassword', 'admin'),
('Budi', 'budi@workcheck.com', '$2b$10$dummyhashpassword', 'budi'),
('Siti', 'siti@workcheck.com', '$2b$10$dummyhashpassword', 'siti');

-- Data dummy untuk tabel stores
INSERT INTO public.stores (nama_toko, kode_toko, alamat, image)
VALUES
('Toko Mandiri', 'MD001', 'Jl. Sudirman No. 1', 'toko1.jpg'),
('Toko Sejahtera', 'SJ002', 'Jl. Thamrin No. 2', 'toko2.jpg');


-- Data dummy untuk tabel products
INSERT INTO public.products (nama_produk, barcode, image, store_id, volume_value, unit)
VALUES
('Air Mineral', 'BR001', 'airmineral.jpg', 1, 600, 'ml'),
('Teh Botol', 'BR002', 'tehbotol.jpg', 1, 350, 'ml'),
('Kopi Instan', 'BR003', 'kopi.jpg', 2, 20, 'gr');

-- Data dummy untuk tabel store_products
INSERT INTO public.store_products (store_id, product_id, available, promo_price, normal_price)
VALUES
(1, 1, 100, 3500, 4000),
(1, 2, 50, 5000, 5500),
(2, 3, 200, 1500, 2000);

-- Data dummy untuk tabel attendance
INSERT INTO public.attendance (user_id, status, image, address, type, leave_type, notes, date, "time", time_checkin, time_checkout)
VALUES
(1, 1, '1756010192640.jpg', 'Jl. Sudirman No. 1', 'checkin', '', 'Masuk pagi', '2025-08-25', '08:00:00', '08:00', '17:00'),
(2, 1, '1756010332716_465.jpg', 'Jl. Thamrin No. 2', 'checkin', '', 'Masuk siang', '2025-08-25', '13:00:00', '13:00', '21:00');

-- Data dummy untuk tabel attendance_today
INSERT INTO public.attendance_today (user_id, date, time_checkin, time_checkout)
VALUES
(1, '2025-08-25', '08:00', '17:00'),
(2, '2025-08-25', '13:00', '21:00');