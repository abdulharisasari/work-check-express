
BEGIN;


CREATE TABLE IF NOT EXISTS public.attendance
(
    id serial NOT NULL,
    user_id integer,
    status integer NOT NULL,
    image text COLLATE pg_catalog."default",
    address text COLLATE pg_catalog."default",
    type character varying(20) COLLATE pg_catalog."default",
    leave_type character varying(50) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    date character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "time" character varying(8) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    time_checkin time without time zone,
    time_checkout time without time zone,
    CONSTRAINT attendance_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.attendance_today
(
    id serial NOT NULL,
    user_id integer NOT NULL,
    date date NOT NULL,
    time_checkin time without time zone,
    time_checkout time without time zone,
    CONSTRAINT attendance_today_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.products
(
    id serial NOT NULL,
    nama_produk character varying(100) COLLATE pg_catalog."default" NOT NULL,
    barcode character varying(50) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    image text COLLATE pg_catalog."default",
    store_id integer,
    volume_value integer,
    unit character varying(20) COLLATE pg_catalog."default" DEFAULT 'ml'::character varying,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_barcode_key UNIQUE (barcode),
    CONSTRAINT products_barcode_unique UNIQUE (barcode)
);

CREATE TABLE IF NOT EXISTS public.store_products
(
    id serial NOT NULL,
    store_id integer,
    product_id integer,
    available integer DEFAULT 0,
    promo_price numeric(12, 2),
    created_at timestamp without time zone DEFAULT now(),
    normal_price numeric,
    CONSTRAINT store_products_pkey PRIMARY KEY (id),
    CONSTRAINT store_products_store_id_product_id_key UNIQUE (store_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.stores
(
    id serial NOT NULL,
    nama_toko character varying(100) COLLATE pg_catalog."default" NOT NULL,
    kode_toko character varying(20) COLLATE pg_catalog."default" NOT NULL,
    alamat text COLLATE pg_catalog."default" NOT NULL,
    image text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    promo_available integer DEFAULT 0,
    CONSTRAINT stores_pkey PRIMARY KEY (id),
    CONSTRAINT stores_kode_toko_key UNIQUE (kode_toko)
);

CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    username character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);

ALTER TABLE IF EXISTS public.attendance
    ADD CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.products
    ADD CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id)
    REFERENCES public.stores (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.store_products
    ADD CONSTRAINT store_products_product_id_fkey FOREIGN KEY (product_id)
    REFERENCES public.products (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.store_products
    ADD CONSTRAINT store_products_store_id_fkey FOREIGN KEY (store_id)
    REFERENCES public.stores (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

END;