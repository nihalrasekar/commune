/*
  # Normalized Database Schema for Property Super App

  This schema creates a properly normalized database structure with:
  1. Separate tables for different entities
  2. Proper foreign key relationships
  3. Reduced data redundancy
  4. Better data integrity
  5. Scalable design for multi-apartment support

  ## Tables Created:
  1. apartments - Master apartment/building data
  2. user_profiles - User information with apartment reference
  3. properties - Individual property units
  4. payments - Payment transactions
  5. services - Available services
  6. service_bookings - Service booking records
  7. community_posts - Community forum posts
  8. visitor_entries - Visitor management
  9. utility_usage - Utility consumption tracking
  10. maintenance_requests - Maintenance and repair requests
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. APARTMENTS TABLE (Master building/complex data)
CREATE TABLE IF NOT EXISTS apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  total_units INTEGER NOT NULL DEFAULT 0,
  amenities JSONB DEFAULT '[]',
  contact_email TEXT,
  contact_phone TEXT,
  management_company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USER PROFILES TABLE (Normalized user data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('tenant', 'owner', 'admin', 'manager')),
  apartment_id UUID REFERENCES apartments(id),
  flat_number TEXT NOT NULL,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  credit_score INTEGER DEFAULT 75 CHECK (credit_score >= 0 AND credit_score <= 100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  move_in_date DATE,
  lease_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(apartment_id, flat_number)
);

-- 3. PROPERTIES TABLE (Individual property units)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  unit_number TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('flat', 'row_house', 'standalone', 'studio', 'penthouse')),
  bhk INTEGER NOT NULL CHECK (bhk > 0),
  area_sqft INTEGER NOT NULL CHECK (area_sqft > 0),
  floor_number INTEGER,
  rent_amount DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  maintenance_charge DECIMAL(10,2),
  owner_id UUID REFERENCES user_profiles(id),
  tenant_id UUID REFERENCES user_profiles(id),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'reserved')),
  furnishing_type TEXT CHECK (furnishing_type IN ('unfurnished', 'semi_furnished', 'fully_furnished')),
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(apartment_id, unit_number)
);

-- 4. PAYMENT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS payment_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PAYMENTS TABLE (All payment transactions)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  category_id UUID REFERENCES payment_categories(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT CHECK (payment_method IN ('upi', 'card', 'netbanking', 'cash', 'cheque')),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  late_fee DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SERVICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  color_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SERVICES TABLE (Available services)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES service_categories(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  provider_name TEXT NOT NULL,
  provider_phone TEXT NOT NULL,
  provider_email TEXT,
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'hourly', 'per_unit')),
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  min_booking_hours INTEGER DEFAULT 1,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  availability_hours JSONB DEFAULT '{}',
  service_area JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SERVICE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_address TEXT NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  provider_notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. COMMUNITY POST CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS community_post_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_code TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES user_profiles(id) NOT NULL,
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  category_id UUID REFERENCES community_post_categories(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  is_pinned BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. COMMUNITY POST LIKES TABLE
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 12. COMMUNITY POST COMMENTS TABLE
CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id) NOT NULL,
  parent_comment_id UUID REFERENCES community_post_comments(id),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. VISITOR ENTRIES TABLE
CREATE TABLE IF NOT EXISTS visitor_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_user_id UUID REFERENCES user_profiles(id) NOT NULL,
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  visitor_photo_url TEXT,
  purpose TEXT NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE,
  exit_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by UUID REFERENCES user_profiles(id),
  security_notes TEXT,
  vehicle_number TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. UTILITY TYPES TABLE
CREATE TABLE IF NOT EXISTS utility_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  unit_of_measurement TEXT NOT NULL,
  rate_per_unit DECIMAL(10,4) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. UTILITY USAGE TABLE
CREATE TABLE IF NOT EXISTS utility_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  utility_type_id UUID REFERENCES utility_types(id) NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  previous_reading DECIMAL(10,2) DEFAULT 0,
  current_reading DECIMAL(10,2) NOT NULL,
  units_consumed DECIMAL(10,2) GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  rate_per_unit DECIMAL(10,4) NOT NULL,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (units_consumed * rate_per_unit) STORED,
  reading_date DATE NOT NULL,
  meter_reader_id UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, utility_type_id, billing_period_start, billing_period_end)
);

-- 16. MAINTENANCE REQUEST CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS maintenance_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'emergency')),
  estimated_resolution_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. MAINTENANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  category_id UUID REFERENCES maintenance_categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES user_profiles(id),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  images JSONB DEFAULT '[]',
  admin_notes TEXT,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. VEHICLE CHARGING STATIONS TABLE
CREATE TABLE IF NOT EXISTS charging_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  station_number TEXT NOT NULL,
  location TEXT NOT NULL,
  power_rating TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  rate_per_hour DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'offline')),
  qr_code_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(apartment_id, station_number)
);

-- 19. VEHICLE CHARGING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS charging_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  station_id UUID REFERENCES charging_stations(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))/60) STORED,
  rate_per_hour DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2),
  payment_method TEXT CHECK (payment_method IN ('instant', 'master_bill')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'added_to_bill')),
  session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'emergency_stopped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_apartment_id ON user_profiles(apartment_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_properties_apartment_id ON properties(apartment_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_user_id ON service_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_booking_date ON service_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_apartment_id ON community_posts(apartment_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_visitor_entries_host_user_id ON visitor_entries(host_user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_entries_entry_time ON visitor_entries(entry_time);
CREATE INDEX IF NOT EXISTS idx_utility_usage_user_id ON utility_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_user_id ON maintenance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_user_id ON charging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_station_id ON charging_sessions(station_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_sessions ENABLE ROW LEVEL SECURITY;

-- ROW LEVEL SECURITY POLICIES

-- User Profiles: Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Apartments: Users can read apartments they belong to
CREATE POLICY "Users can read their apartment data" ON apartments
  FOR SELECT USING (
    id IN (
      SELECT apartment_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Properties: Users can read properties in their apartment
CREATE POLICY "Users can read properties in their apartment" ON properties
  FOR SELECT USING (
    apartment_id IN (
      SELECT apartment_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Payments: Users can read/insert their own payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Service Bookings: Users can manage their own bookings
CREATE POLICY "Users can manage own service bookings" ON service_bookings
  FOR ALL USING (user_id = auth.uid());

-- Community Posts: Users can read posts in their apartment
CREATE POLICY "Users can read community posts in their apartment" ON community_posts
  FOR SELECT USING (
    apartment_id IN (
      SELECT apartment_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create community posts" ON community_posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    apartment_id IN (
      SELECT apartment_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Visitor Entries: Users can manage their own visitor entries
CREATE POLICY "Users can manage own visitor entries" ON visitor_entries
  FOR ALL USING (host_user_id = auth.uid());

-- Utility Usage: Users can read their own utility usage
CREATE POLICY "Users can read own utility usage" ON utility_usage
  FOR SELECT USING (user_id = auth.uid());

-- Maintenance Requests: Users can manage their own requests
CREATE POLICY "Users can manage own maintenance requests" ON maintenance_requests
  FOR ALL USING (user_id = auth.uid());

-- Charging Sessions: Users can manage their own charging sessions
CREATE POLICY "Users can manage own charging sessions" ON charging_sessions
  FOR ALL USING (user_id = auth.uid());

-- Public read access for reference tables
CREATE POLICY "Public read access for payment categories" ON payment_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access for service categories" ON service_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access for services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Public read access for community post categories" ON community_post_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access for utility types" ON utility_types
  FOR SELECT USING (true);

CREATE POLICY "Public read access for maintenance categories" ON maintenance_categories
  FOR SELECT USING (true);

-- Charging stations: Users can read stations in their apartment
CREATE POLICY "Users can read charging stations in their apartment" ON charging_stations
  FOR SELECT USING (
    apartment_id IN (
      SELECT apartment_id FROM user_profiles WHERE id = auth.uid()
    )
  );