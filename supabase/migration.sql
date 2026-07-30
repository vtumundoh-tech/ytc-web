-- Migration: Midtrans -> GoQRIS
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor jika tabel sudah ada
-- (untuk project baru, cukup jalankan schema.sql saja)

-- Rename kolom midtrans_order_id -> ref_id
alter table orders rename column midtrans_order_id to ref_id;

-- Rename kolom midtrans_transaction_id -> goqris_trx_id
alter table orders rename column midtrans_transaction_id to goqris_trx_id;

-- Hapus index lama (optional, hanya rename untuk konsistensi)
-- Index on status tetap valid, index on created_at tetap valid

-- Update constraint unique (nama kolom berubah, constraint ikut berubah otomatis)
