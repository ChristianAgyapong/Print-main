-- Complete Supabase Database Setup for Print App
-- Run this entire script in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  address_country TEXT,
  company TEXT,
  job_title TEXT,
  date_of_birth DATE,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- Add comments
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON COLUMN profiles.id IS 'User ID from auth.users';
COMMENT ON COLUMN profiles.full_name IS 'User full name';
COMMENT ON COLUMN profiles.bio IS 'User biography';

-- =====================================================
-- 2. CREATE PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- =====================================================
-- 3. CREATE ORDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- 4. CREATE ORDER_ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 5. CREATE UPLOADS TABLE (Saved Designs)
-- =====================================================

CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- =====================================================
-- 6. CREATE ADDRESSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- ORDER_ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- UPLOADS POLICIES
DROP POLICY IF EXISTS "Users can view own uploads" ON uploads;
CREATE POLICY "Users can view own uploads" ON uploads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own uploads" ON uploads;
CREATE POLICY "Users can insert own uploads" ON uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own uploads" ON uploads;
CREATE POLICY "Users can delete own uploads" ON uploads
  FOR DELETE USING (auth.uid() = user_id);

-- ADDRESSES POLICIES
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS POLICIES (Public read access)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

-- =====================================================
-- 8. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. FUNCTION TO CREATE PROFILE ON USER SIGNUP
-- =====================================================

-- Function to create profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 10. INSERT SAMPLE PRODUCTS
-- =====================================================

INSERT INTO products (title, description, price, category, stock_quantity) VALUES
  ('Premium Business Cards', 'High-quality business cards with premium finish. 500 cards per pack.', 45.00, 'Stationery', 100),
  ('A-Frame Signs', 'Durable outdoor A-frame signs perfect for storefronts and events.', 95.00, 'Large Format', 50),
  ('Custom Flyers', 'Eye-catching flyers for promotions and events. 1000 flyers included.', 75.00, 'Commercial', 200),
  ('Acrylic Prints', 'Beautiful acrylic photo prints with vibrant colors and durability.', 55.00, 'Digital', 75),
  ('Fabric Banners', 'Custom fabric banners with full-color printing. Various sizes available.', 180.00, 'Large Format', 30),
  ('Annual Reports', 'Professional annual report printing with binding options.', 150.00, 'Commercial', 40),
  ('Vinyl Stickers', 'Weather-resistant vinyl stickers. Pack of 100 custom stickers.', 35.00, 'Packaging', 150),
  ('Brochures', 'Tri-fold brochures with glossy or matte finish. 500 brochures included.', 85.00, 'Commercial', 100),
  ('Posters', 'Large format posters in various sizes. Premium paper quality.', 65.00, 'Large Format', 120),
  ('Letterheads', 'Professional letterheads for business correspondence. 1000 sheets.', 55.00, 'Stationery', 80),
  ('T-Shirt Printing', 'Custom t-shirt printing with your design. High-quality fabric.', 120.00, 'Digital', 60),
  ('Custom Labels', 'Adhesive labels for products and packaging. Roll of 500 labels.', 40.00, 'Packaging', 90)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. VERIFY SETUP
-- =====================================================

-- Check if all tables exist
SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('profiles', 'products', 'orders', 'order_items', 'uploads', 'addresses') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'products', 'orders', 'order_items', 'uploads', 'addresses')
ORDER BY tablename;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'products', 'orders', 'order_items', 'uploads', 'addresses')
ORDER BY tablename;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Show all profile columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

SELECT '✅ Database setup complete!' as message;
