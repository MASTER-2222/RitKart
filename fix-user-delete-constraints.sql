-- Fix User Deletion Foreign Key Constraints
-- This script adds proper ON DELETE CASCADE constraints to allow user deletion

-- First, drop existing foreign key constraints
ALTER TABLE carts DROP CONSTRAINT IF EXISTS carts_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add new foreign key constraints with proper CASCADE behavior
-- For carts: When user is deleted, delete their carts
ALTER TABLE carts ADD CONSTRAINT carts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- For orders: When user is deleted, set user_id to NULL to preserve order history
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- For reviews: When user is deleted, delete their reviews
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Make user_id nullable in orders table to support ON DELETE SET NULL
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment for audit trail
COMMENT ON CONSTRAINT carts_user_id_fkey ON carts IS 'Cascade delete carts when user is deleted';
COMMENT ON CONSTRAINT orders_user_id_fkey ON orders IS 'Set user_id to NULL when user is deleted to preserve order history';
COMMENT ON CONSTRAINT reviews_user_id_fkey ON reviews IS 'Cascade delete reviews when user is deleted';