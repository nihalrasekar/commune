/*
  # Seed Data for Property Super App

  This file contains initial data to populate the normalized database
  with sample apartments, categories, and reference data.
*/

-- Insert sample apartment
INSERT INTO apartments (id, name, address, city, state, postal_code, total_units, amenities, contact_email, contact_phone, management_company) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Skyline Apartments',
  '123 Tech Park Road, Electronic City',
  'Bangalore',
  'Karnataka',
  '560100',
  120,
  '["Swimming Pool", "Gym", "Club House", "Parking", "Security", "Power Backup", "Water Supply", "Waste Management"]',
  'admin@skylineapartments.com',
  '+91 80 1234 5678',
  'Skyline Property Management'
);

-- Insert payment categories
INSERT INTO payment_categories (name, description, is_recurring, due_day) VALUES
('Rent', 'Monthly rent payment', true, 5),
('Electricity', 'Electricity bill payment', true, 8),
('Water', 'Water bill payment', true, 12),
('Maintenance', 'Monthly maintenance charges', true, 10),
('Internet', 'Internet service charges', true, 15),
('Gas', 'Gas connection charges', true, 20),
('Parking', 'Additional parking charges', true, 5),
('Security Deposit', 'One-time security deposit', false, null),
('Late Fee', 'Late payment penalty', false, null),
('Utility Deposit', 'Utility connection deposit', false, null);

-- Insert service categories
INSERT INTO service_categories (name, description, icon_name, color_code) VALUES
('Home Repair', 'Electrical, plumbing, and general repairs', 'Hammer', '#F59E0B'),
('Beauty & Care', 'Personal grooming and wellness services', 'Scissors', '#EC4899'),
('Auto Services', 'Vehicle maintenance and cleaning', 'Car', '#10B981'),
('Delivery', 'Food, grocery, and package delivery', 'Truck', '#3B82F6'),
('Cleaning', 'House cleaning and maintenance', 'Sparkles', '#8B5CF6'),
('Health & Fitness', 'Medical and fitness services', 'Heart', '#EF4444'),
('Education', 'Tutoring and skill development', 'BookOpen', '#06B6D4'),
('Pet Care', 'Pet grooming and veterinary services', 'PawPrint', '#84CC16');

-- Insert sample services
INSERT INTO services (category_id, name, description, provider_name, provider_phone, provider_email, price_type, base_price, min_booking_hours, rating, total_reviews, tags, is_emergency) VALUES
(
  (SELECT id FROM service_categories WHERE name = 'Home Repair'),
  'Electrician',
  'Electrical repairs, wiring, and installations',
  'PowerFix Solutions',
  '+91 98765 43210',
  'contact@powerfix.com',
  'hourly',
  300.00,
  2,
  4.8,
  245,
  '["Emergency Service", "Licensed", "24/7"]',
  true
),
(
  (SELECT id FROM service_categories WHERE name = 'Beauty & Care'),
  'Beautician',
  'Hair styling, makeup, and beauty treatments',
  'Glamour Studio',
  '+91 98765 43211',
  'booking@glamourstudio.com',
  'fixed',
  800.00,
  1,
  4.9,
  189,
  '["Certified", "Home Service", "Premium"]',
  false
),
(
  (SELECT id FROM service_categories WHERE name = 'Auto Services'),
  'Car Washing',
  'Professional car cleaning and detailing',
  'Shine Auto Care',
  '+91 98765 43212',
  'service@shineauto.com',
  'fixed',
  500.00,
  1,
  4.7,
  156,
  '["Eco-Friendly", "Doorstep", "Insured"]',
  false
);

-- Insert community post categories
INSERT INTO community_post_categories (name, description, color_code, icon_name) VALUES
('Announcement', 'Official announcements from management', '#EF4444', 'Megaphone'),
('General', 'General discussions and conversations', '#3B82F6', 'MessageCircle'),
('Marketplace', 'Buy, sell, and exchange items', '#10B981', 'ShoppingBag'),
('Events', 'Community events and gatherings', '#F59E0B', 'Calendar'),
('Lost & Found', 'Lost and found items', '#8B5CF6', 'Search'),
('Recommendations', 'Service and product recommendations', '#06B6D4', 'Star'),
('Complaints', 'Issues and complaints', '#EF4444', 'AlertTriangle'),
('Maintenance', 'Maintenance related discussions', '#84CC16', 'Wrench');

-- Insert utility types
INSERT INTO utility_types (name, unit_of_measurement, rate_per_unit, billing_cycle) VALUES
('Electricity', 'kWh', 6.50, 'monthly'),
('Water', 'Liters', 0.02, 'monthly'),
('Gas', 'Cubic Meters', 45.00, 'monthly'),
('Internet', 'GB', 2.00, 'monthly'),
('Waste Management', 'Per Unit', 150.00, 'monthly');

-- Insert maintenance categories
INSERT INTO maintenance_categories (name, description, priority_level, estimated_resolution_hours) VALUES
('Electrical', 'Electrical issues and repairs', 'high', 4),
('Plumbing', 'Water and drainage related issues', 'high', 6),
('Carpentry', 'Furniture and woodwork repairs', 'medium', 24),
('Painting', 'Wall painting and touch-ups', 'low', 48),
('Appliance Repair', 'Home appliance servicing', 'medium', 12),
('HVAC', 'Air conditioning and ventilation', 'high', 8),
('Security', 'Security system maintenance', 'high', 2),
('Cleaning', 'Deep cleaning and maintenance', 'low', 4),
('Pest Control', 'Pest and rodent control', 'medium', 6),
('Emergency', 'Emergency repairs and issues', 'emergency', 1);

-- Insert sample charging stations
INSERT INTO charging_stations (apartment_id, station_number, location, power_rating, connector_type, rate_per_hour, qr_code_data) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Charger-A1',
  'Basement Level 1 - Slot A1',
  '7.4 kW',
  'Type 2',
  150.00,
  'name:Skyline Apartments,no:Charger-A1'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Charger-A2',
  'Basement Level 1 - Slot A2',
  '7.4 kW',
  'Type 2',
  150.00,
  'name:Skyline Apartments,no:Charger-A2'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Charger-B1',
  'Basement Level 2 - Slot B1',
  '22 kW',
  'Type 2',
  250.00,
  'name:Skyline Apartments,no:Charger-B1'
);

-- Insert sample properties
INSERT INTO properties (apartment_id, unit_number, property_type, bhk, area_sqft, floor_number, rent_amount, security_deposit, maintenance_charge, status, furnishing_type, amenities) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'A-301',
  'flat',
  2,
  1200,
  3,
  25000.00,
  50000.00,
  1500.00,
  'rented',
  'semi_furnished',
  '["Balcony", "Parking", "Modular Kitchen", "Wardrobe"]'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'A-302',
  'flat',
  3,
  1500,
  3,
  35000.00,
  70000.00,
  2000.00,
  'available',
  'unfurnished',
  '["Balcony", "Parking", "Modular Kitchen"]'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'B-101',
  'flat',
  1,
  800,
  1,
  18000.00,
  36000.00,
  1200.00,
  'available',
  'fully_furnished',
  '["Parking", "Modular Kitchen", "Wardrobe", "AC"]'
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_post_comments_updated_at BEFORE UPDATE ON community_post_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitor_entries_updated_at BEFORE UPDATE ON visitor_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charging_stations_updated_at BEFORE UPDATE ON charging_stations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charging_sessions_updated_at BEFORE UPDATE ON charging_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();