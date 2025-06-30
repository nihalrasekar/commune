import { supabase } from './supabase';
import type {
  UserProfile,
  Apartment,
  Property,
  Payment,
  PaymentCategory,
  Service,
  ServiceBooking,
  CommunityPost,
  VisitorEntry,
  MaintenanceRequest,
  ChargingStation,
  ChargingSession,
  DatabaseResult,
  DatabaseListResult,
  QueryOptions
} from './database-types';

// User Profile Queries
export const getUserProfileWithApartment = async (userId: string): Promise<DatabaseResult<UserProfile>> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      apartment:apartments(*)
    `)
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<DatabaseResult<UserProfile>> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Apartment Queries
export const getApartmentDetails = async (apartmentId: string): Promise<DatabaseResult<Apartment>> => {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', apartmentId)
    .single();
  
  return { data, error };
};

export const getApartmentResidents = async (apartmentId: string, options?: QueryOptions): Promise<DatabaseListResult<UserProfile>> => {
  let query = supabase
    .from('user_profiles')
    .select('*')
    .eq('apartment_id', apartmentId)
    .eq('is_active', true);
  
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }
  
  const { data, error, count } = await query;
  return { data, error, count: count || 0 };
};

// Property Queries
export const getPropertiesByApartment = async (apartmentId: string): Promise<DatabaseListResult<Property>> => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      apartment:apartments(*),
      owner:user_profiles!properties_owner_id_fkey(*),
      tenant:user_profiles!properties_tenant_id_fkey(*)
    `)
    .eq('apartment_id', apartmentId);
  
  return { data, error };
};

export const getUserProperty = async (userId: string): Promise<DatabaseResult<Property>> => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      apartment:apartments(*)
    `)
    .or(`owner_id.eq.${userId},tenant_id.eq.${userId}`)
    .single();
  
  return { data, error };
};

// Payment Queries
export const getUserPayments = async (userId: string, options?: QueryOptions): Promise<DatabaseListResult<Payment>> => {
  let query = supabase
    .from('payments')
    .select(`
      *,
      category:payment_categories(*)
    `)
    .eq('user_id', userId);
  
  if (options?.filters?.status) {
    query = query.eq('status', options.filters.status);
  }
  
  if (options?.limit) query = query.limit(options.limit);
  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const createPayment = async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<Payment>> => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select(`
      *,
      category:payment_categories(*)
    `)
    .single();
  
  return { data, error };
};

export const updatePaymentStatus = async (paymentId: string, status: Payment['status'], transactionId?: string): Promise<DatabaseResult<Payment>> => {
  const updates: Partial<Payment> = { status };
  if (status === 'paid') {
    updates.paid_date = new Date().toISOString();
    if (transactionId) updates.transaction_id = transactionId;
  }
  
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();
  
  return { data, error };
};

// Service Queries
export const getServices = async (categoryId?: string): Promise<DatabaseListResult<Service>> => {
  let query = supabase
    .from('services')
    .select(`
      *,
      category:service_categories(*)
    `)
    .eq('is_active', true);
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query.order('rating', { ascending: false });
  return { data, error };
};

export const createServiceBooking = async (booking: Omit<ServiceBooking, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<ServiceBooking>> => {
  const { data, error } = await supabase
    .from('service_bookings')
    .insert([booking])
    .select(`
      *,
      service:services(*),
      user:user_profiles(*)
    `)
    .single();
  
  return { data, error };
};

export const getUserServiceBookings = async (userId: string): Promise<DatabaseListResult<ServiceBooking>> => {
  const { data, error } = await supabase
    .from('service_bookings')
    .select(`
      *,
      service:services(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Community Queries
export const getCommunityPosts = async (apartmentId: string, categoryId?: string): Promise<DatabaseListResult<CommunityPost>> => {
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      author:user_profiles(*),
      category:community_post_categories(*)
    `)
    .eq('apartment_id', apartmentId)
    .eq('status', 'active');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createCommunityPost = async (post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>): Promise<DatabaseResult<CommunityPost>> => {
  const { data, error } = await supabase
    .from('community_posts')
    .insert([post])
    .select(`
      *,
      author:user_profiles(*),
      category:community_post_categories(*)
    `)
    .single();
  
  return { data, error };
};

// Visitor Entry Queries
export const getUserVisitorEntries = async (userId: string): Promise<DatabaseListResult<VisitorEntry>> => {
  const { data, error } = await supabase
    .from('visitor_entries')
    .select('*')
    .eq('host_user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createVisitorEntry = async (entry: Omit<VisitorEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<VisitorEntry>> => {
  const { data, error } = await supabase
    .from('visitor_entries')
    .insert([entry])
    .select()
    .single();
  
  return { data, error };
};

export const updateVisitorEntryStatus = async (entryId: string, status: VisitorEntry['status'], approvedBy?: string): Promise<DatabaseResult<VisitorEntry>> => {
  const updates: Partial<VisitorEntry> = { status };
  if (approvedBy) updates.approved_by = approvedBy;
  
  const { data, error } = await supabase
    .from('visitor_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  
  return { data, error };
};

// Maintenance Request Queries
export const getUserMaintenanceRequests = async (userId: string): Promise<DatabaseListResult<MaintenanceRequest>> => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      category:maintenance_categories(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createMaintenanceRequest = async (request: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<MaintenanceRequest>> => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert([request])
    .select(`
      *,
      category:maintenance_categories(*)
    `)
    .single();
  
  return { data, error };
};

// Charging Station Queries
export const getChargingStations = async (apartmentId: string): Promise<DatabaseListResult<ChargingStation>> => {
  const { data, error } = await supabase
    .from('charging_stations')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('station_number');
  
  return { data, error };
};

export const getChargingStationByQR = async (qrData: string): Promise<DatabaseResult<ChargingStation>> => {
  const { data, error } = await supabase
    .from('charging_stations')
    .select('*')
    .eq('qr_code_data', qrData)
    .single();
  
  return { data, error };
};

export const createChargingSession = async (session: Omit<ChargingSession, 'id' | 'created_at' | 'updated_at' | 'duration_minutes' | 'total_cost'>): Promise<DatabaseResult<ChargingSession>> => {
  const { data, error } = await supabase
    .from('charging_sessions')
    .insert([session])
    .select(`
      *,
      station:charging_stations(*)
    `)
    .single();
  
  return { data, error };
};

export const endChargingSession = async (sessionId: string, endTime: string, totalCost: number): Promise<DatabaseResult<ChargingSession>> => {
  const { data, error } = await supabase
    .from('charging_sessions')
    .update({
      end_time: endTime,
      total_cost: totalCost,
      session_status: 'completed'
    })
    .eq('id', sessionId)
    .select()
    .single();
  
  return { data, error };
};

export const getUserChargingSessions = async (userId: string): Promise<DatabaseListResult<ChargingSession>> => {
  const { data, error } = await supabase
    .from('charging_sessions')
    .select(`
      *,
      station:charging_stations(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Reference Data Queries
export const getPaymentCategories = async (): Promise<DatabaseListResult<PaymentCategory>> => {
  const { data, error } = await supabase
    .from('payment_categories')
    .select('*')
    .order('name');
  
  return { data, error };
};

export const getServiceCategories = async (): Promise<DatabaseListResult<any>> => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  return { data, error };
};

export const getCommunityPostCategories = async (): Promise<DatabaseListResult<any>> => {
  const { data, error } = await supabase
    .from('community_post_categories')
    .select('*')
    .order('name');
  
  return { data, error };
};

export const getMaintenanceCategories = async (): Promise<DatabaseListResult<any>> => {
  const { data, error } = await supabase
    .from('maintenance_categories')
    .select('*')
    .order('priority_level', { ascending: false });
  
  return { data, error };
};