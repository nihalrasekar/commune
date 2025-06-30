import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variables for better security
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ikyqvrumpjkgdhoolzrp.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlreXF2cnVtcGprZ2Rob29senJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODM5NDksImV4cCI6MjA2Njc1OTk0OX0.PGoAVsZ2elGp0HaBaxTS8cQP4ztjIgJc37OPmfMci0o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Re-export types from the new database types file
export type {
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
  DatabaseListResult
} from './database-types';

// Primary authentication functions - Email/Password based
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  
  return { data, error };
};

export const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (existingUser) {
    return { 
      data: null, 
      error: { 
        message: 'An account with this email already exists. Please sign in instead.',
        code: 'user_already_exists'
      } 
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: userData,
    },
  });
  
  return { data, error };
};

// OTP-based signup functions (for email verification during signup)
export const signUpWithOTP = async (email: string, userData: Partial<UserProfile> & { password?: string }) => {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (existingUser) {
    return { 
      data: null, 
      error: { 
        message: 'An account with this email already exists. Please sign in instead.',
        code: 'user_already_exists'
      } 
    };
  }

  // Send OTP for signup verification
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase().trim(),
    options: {
      shouldCreateUser: true,
      data: userData,
    },
  });
  
  return { data, error };
};

export const verifySignupOTP = async (email: string, token: string, userData: Partial<UserProfile> & { password?: string }) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token,
    type: 'email',
  });

  if (error) {
    return { data: null, error };
  }

  // If verification successful and user is created, update user with password and create profile
  if (data.user && data.session) {
    try {
      // If password is provided, update the user's password
      if (userData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: userData.password
        });
        
        if (passwordError) {
          console.error('Error setting password:', passwordError);
          // Continue with profile creation even if password setting fails
        }
      }

      // Create user profile
      const profileData = {
        id: data.user.id,
        email: data.user.email || email.toLowerCase().trim(),
        apartment_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Default to Skyline Apartments
        ...userData,
      };

      // Remove password from profile data as it's not stored in user_profiles table
      const { password, ...profileDataWithoutPassword } = profileData;

      const { data: profile, error: profileError } = await createUserProfile(profileDataWithoutPassword);
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the signup if profile creation fails, it can be created later
      }

      return { data: { user: data.user, session: data.session, profile }, error: null };
    } catch (profileError) {
      console.error('Error in profile creation:', profileError);
      return { data: { user: data.user, session: data.session, profile: null }, error: null };
    }
  }

  return { data, error };
};

// Password reset functions (OTP-based for security)
export const resetPasswordWithOTP = async (email: string) => {
  // Check if user exists first
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (!existingUser) {
    return { 
      data: null, 
      error: { 
        message: 'No account found with this email address.',
        code: 'user_not_found'
      } 
    };
  }

  // Send OTP for password reset
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.toLowerCase().trim(),
    {
      redirectTo: undefined, // We'll handle verification via OTP
    }
  );
  
  return { data, error };
};

export const verifyOTP = async (email: string, token: string, type: 'email' | 'recovery' = 'email') => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token,
    type,
  });
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Profile management functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const createUserProfile = async (profile: Omit<UserProfile, 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single();
  return { data, error };
};