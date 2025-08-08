-- RitZone Database Schema Setup with Sample Data
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================
-- USERS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- ===============================
-- CATEGORIES TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- HERO BANNERS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- PRODUCTS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand VARCHAR(255),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_deal BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- CARTS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- CART ITEMS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- ORDERS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal_amount DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  shipping_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  billing_address JSONB,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- ORDER ITEMS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(500) NOT NULL,
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- INDEXES FOR PERFORMANCE
-- ===============================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_deal ON products(is_deal);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active, sort_order);

-- ===============================
-- INSERT SAMPLE CATEGORIES
-- ===============================
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
('Electronics', 'electronics', 'Discover the latest in technology and gadgets', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=300&fit=crop&crop=center', 1),
('Fashion', 'fashion', 'Trendy clothing and accessories for every style', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=300&fit=crop&crop=center', 2),
('Books', 'books', 'Bestsellers, classics, and new releases', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=300&fit=crop&crop=center', 3),
('Home & Garden', 'home', 'Everything for your home and garden', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=300&fit=crop&crop=center', 4),
('Sports & Outdoors', 'sports', 'Gear for fitness, sports, and outdoor adventures', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=300&fit=crop&crop=center', 5),
('Grocery', 'grocery', 'Fresh food and pantry essentials', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=300&fit=crop&crop=center', 6),
('Appliances', 'appliances', 'Kitchen and home appliances', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=300&fit=crop&crop=center', 7),
('Beauty & Personal Care', 'beauty', 'Skincare, makeup, and personal care products', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=300&fit=crop&crop=center', 8),
('Solar', 'solar', 'Solar panels, batteries, and renewable energy solutions', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=300&fit=crop&crop=center', 9),
('Pharmacy', 'pharmacy', 'Health, wellness, and pharmaceutical products', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=300&fit=crop&crop=center', 10)
ON CONFLICT (slug) DO NOTHING;

-- ===============================
-- INSERT HERO BANNERS
-- ===============================
INSERT INTO hero_banners (title, subtitle, image_url, button_text, button_link, sort_order) VALUES
('Fashion & Lifestyle', 'Discover trendy styles and accessories for every occasion', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/category/fashion', 1),
('Premium Shopping Experience', 'Quality products delivered straight to your door', 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/', 2),
('Shop with Confidence', 'Explore our vast selection in our modern retail space', 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/', 3),
('Weekend Shopping Spree', 'Get amazing deals on all your favorite brands', 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/deals', 4),
('MEGA SALE EVENT', 'Up to 70% off on electronics, fashion, and more!', 'https://images.unsplash.com/photo-1532795986-dbef1643a596?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/deals', 5),
('Black Friday Deals', 'Massive discounts across all categories - Limited time only', 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/deals', 6),
('Special Offers', 'Exclusive deals and promotional prices just for you', 'https://images.pexels.com/photos/5868722/pexels-photo-5868722.jpeg?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/deals', 7),
('Shop Online Anytime', 'Convenient online shopping with fast delivery options', 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1200&h=400&fit=crop&crop=center', 'Shop Now', '/', 8)
ON CONFLICT DO NOTHING;