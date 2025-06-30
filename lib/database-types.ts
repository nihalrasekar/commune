// Updated TypeScript types for the normalized database schema

export interface Apartment {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  total_units: number;
  amenities: string[];
  contact_email?: string;
  contact_phone?: string;
  management_company?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  mobile: string;
  user_type: 'tenant' | 'owner' | 'admin' | 'manager';
  apartment_id?: string;
  flat_number: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  credit_score: number;
  avatar_url?: string;
  is_active: boolean;
  move_in_date?: string;
  lease_end_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  apartment?: Apartment;
}

export interface Property {
  id: string;
  apartment_id: string;
  unit_number: string;
  property_type: 'flat' | 'row_house' | 'standalone' | 'studio' | 'penthouse';
  bhk: number;
  area_sqft: number;
  floor_number?: number;
  rent_amount?: number;
  security_deposit?: number;
  maintenance_charge?: number;
  owner_id?: string;
  tenant_id?: string;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  furnishing_type?: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
  amenities: string[];
  images: string[];
  created_at: string;
  updated_at: string;
  // Relations
  apartment?: Apartment;
  owner?: UserProfile;
  tenant?: UserProfile;
}

export interface PaymentCategory {
  id: string;
  name: string;
  description?: string;
  is_recurring: boolean;
  due_day?: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  apartment_id: string;
  category_id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  payment_method?: 'upi' | 'card' | 'netbanking' | 'cash' | 'cheque';
  transaction_id?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  late_fee: number;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: UserProfile;
  apartment?: Apartment;
  category?: PaymentCategory;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  color_code?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  provider_name: string;
  provider_phone: string;
  provider_email?: string;
  price_type: 'fixed' | 'hourly' | 'per_unit';
  base_price: number;
  min_booking_hours: number;
  rating: number;
  total_reviews: number;
  availability_hours: Record<string, any>;
  service_area: string[];
  tags: string[];
  images: string[];
  is_active: boolean;
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  category?: ServiceCategory;
}

export interface ServiceBooking {
  id: string;
  user_id: string;
  service_id: string;
  apartment_id: string;
  booking_date: string;
  time_slot: string;
  duration_hours: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  service_address: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  provider_notes?: string;
  customer_rating?: number;
  customer_review?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: UserProfile;
  service?: Service;
  apartment?: Apartment;
}

export interface CommunityPostCategory {
  id: string;
  name: string;
  description?: string;
  color_code?: string;
  icon_name?: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  apartment_id: string;
  category_id: string;
  title: string;
  content: string;
  images: string[];
  is_pinned: boolean;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  // Relations
  author?: UserProfile;
  apartment?: Apartment;
  category?: CommunityPostCategory;
}

export interface CommunityPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CommunityPostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  author?: UserProfile;
  parent_comment?: CommunityPostComment;
}

export interface VisitorEntry {
  id: string;
  host_user_id: string;
  apartment_id: string;
  visitor_name: string;
  visitor_phone?: string;
  visitor_photo_url?: string;
  purpose: string;
  entry_time?: string;
  exit_time?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: string;
  security_notes?: string;
  vehicle_number?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  created_at: string;
  updated_at: string;
  // Relations
  host_user?: UserProfile;
  apartment?: Apartment;
  approver?: UserProfile;
}

export interface UtilityType {
  id: string;
  name: string;
  unit_of_measurement: string;
  rate_per_unit: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  created_at: string;
}

export interface UtilityUsage {
  id: string;
  user_id: string;
  apartment_id: string;
  utility_type_id: string;
  billing_period_start: string;
  billing_period_end: string;
  previous_reading: number;
  current_reading: number;
  units_consumed: number;
  rate_per_unit: number;
  total_amount: number;
  reading_date: string;
  meter_reader_id?: string;
  notes?: string;
  created_at: string;
  // Relations
  user?: UserProfile;
  apartment?: Apartment;
  utility_type?: UtilityType;
  meter_reader?: UserProfile;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  description?: string;
  priority_level: 'low' | 'medium' | 'high' | 'emergency';
  estimated_resolution_hours: number;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  user_id: string;
  apartment_id: string;
  category_id: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  estimated_cost?: number;
  actual_cost?: number;
  scheduled_date?: string;
  completed_date?: string;
  images: string[];
  admin_notes?: string;
  user_rating?: number;
  user_feedback?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: UserProfile;
  apartment?: Apartment;
  category?: MaintenanceCategory;
  assignee?: UserProfile;
}

export interface ChargingStation {
  id: string;
  apartment_id: string;
  station_number: string;
  location: string;
  power_rating: string;
  connector_type: string;
  rate_per_hour: number;
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
  qr_code_data: string;
  created_at: string;
  updated_at: string;
  // Relations
  apartment?: Apartment;
}

export interface ChargingSession {
  id: string;
  user_id: string;
  station_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  rate_per_hour: number;
  total_cost?: number;
  payment_method?: 'instant' | 'master_bill';
  payment_status: 'pending' | 'paid' | 'added_to_bill';
  session_status: 'active' | 'completed' | 'emergency_stopped';
  created_at: string;
  updated_at: string;
  // Relations
  user?: UserProfile;
  station?: ChargingStation;
}

// Database query result types
export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseListResult<T> {
  data: T[] | null;
  error: Error | null;
  count?: number;
}

// Query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, any>;
}