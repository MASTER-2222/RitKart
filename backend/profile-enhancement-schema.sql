-- RitZone Profile Enhancement Database Schema
-- ==============================================
-- Tables for dynamic profile functionality: addresses, payment methods, wishlist

-- ==============================================
-- 📮 USER ADDRESSES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'home' CHECK (type IN ('home', 'office', 'other')),
    name VARCHAR(255) NOT NULL,
    street VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United States',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for fast queries
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- Create unique index to ensure only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_addresses_user_default 
ON user_addresses(user_id) WHERE is_default = true;

-- ==============================================
-- 💳 USER PAYMENT METHODS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'card' CHECK (type IN ('card', 'upi')),
    name VARCHAR(255) NOT NULL, -- e.g., "Visa ending in 4567", "Google Pay"
    details VARCHAR(255) NOT NULL, -- e.g., "**** **** **** 4567", "john.doe@paytm"
    last_four VARCHAR(4), -- Only for cards
    expiry_date VARCHAR(7), -- MM/YY format for cards
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for fast queries
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON user_payment_methods(user_id);

-- Create unique index to ensure only one default payment method per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_payment_methods_user_default 
ON user_payment_methods(user_id) WHERE is_default = true;

-- ==============================================
-- ❤️ USER WISHLIST TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS user_wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create composite index on user_id and product_id for fast queries and prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_wishlist_user_product 
ON user_wishlist(user_id, product_id);

-- Create index on product_id for analytics
CREATE INDEX IF NOT EXISTS idx_user_wishlist_product_id ON user_wishlist(product_id);

-- ==============================================
-- 🔄 UPDATE TRIGGERS FOR TIMESTAMPS
-- ==============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating updated_at column
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON user_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_payment_methods_updated_at ON user_payment_methods;
CREATE TRIGGER update_user_payment_methods_updated_at 
    BEFORE UPDATE ON user_payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 🔧 FUNCTIONS FOR DEFAULT MANAGEMENT
-- ==============================================

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Unset all other default addresses for this user
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Unset all other default payment methods for this user
        UPDATE user_payment_methods 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for default management
DROP TRIGGER IF EXISTS ensure_default_address ON user_addresses;
CREATE TRIGGER ensure_default_address
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

DROP TRIGGER IF EXISTS ensure_default_payment_method ON user_payment_methods;
CREATE TRIGGER ensure_default_payment_method
    BEFORE INSERT OR UPDATE ON user_payment_methods
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- ==============================================
-- 📊 SAMPLE DATA INSERTION (Optional for testing)
-- ==============================================

-- Note: This schema creates the tables and constraints.
-- Sample data can be added later via the API endpoints or manual insertion.

-- ==============================================
-- ✅ SCHEMA CREATION COMPLETED
-- ==============================================

-- This schema provides:
-- 1. user_addresses table with proper constraints and default management
-- 2. user_payment_methods table with type validation and default management
-- 3. user_wishlist table with duplicate prevention
-- 4. Proper indexes for performance
-- 5. Triggers for automatic timestamp updates
-- 6. Functions to ensure single default addresses/payment methods per user
-- 7. Foreign key relationships with CASCADE delete for data integrity