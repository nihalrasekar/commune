import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile, getUserProfile, createUserProfile } from '@/lib/supabase';
import { 
  saveAuthToken, 
  saveUserData, 
  getAuthToken, 
  getUserData, 
  clearAllAuthData, 
  isAuthenticated,
  StoredUserData 
} from '@/lib/auth-storage';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveAuthSession: (session: Session, profile: UserProfile) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  isLoggedIn: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  saveAuthSession: async () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Save authentication session to AsyncStorage
  const saveAuthSession = async (authSession: Session, profile: UserProfile): Promise<boolean> => {
    try {
      console.log('Saving auth session for user:', authSession.user.email);
      
      // Save the access token
      const tokenSaved = await saveAuthToken(authSession.access_token);
      
      // Save user data
      const userData: StoredUserData = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        user_type: profile.user_type,
        flat_number: profile.flat_number,
        apartment_id: profile.apartment_id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      };
      
      const userDataSaved = await saveUserData(userData);
      
      if (tokenSaved && userDataSaved) {
        console.log('Auth session saved successfully');
        return true;
      } else {
        console.error('Failed to save auth session');
        return false;
      }
    } catch (error) {
      console.error('Error saving auth session:', error);
      return false;
    }
  };

  // Load authentication from AsyncStorage
  const loadStoredAuth = async (): Promise<boolean> => {
    try {
      console.log('Loading stored authentication...');
      
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log('No valid stored authentication found');
        return false;
      }
      
      const userData = await getUserData();
      if (!userData) {
        console.log('No user data found');
        return false;
      }
      
      // Create a minimal profile from stored data
      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        mobile: '',
        user_type: userData.user_type as 'tenant' | 'owner',
        apartment_id: userData.apartment_id,
        flat_number: userData.flat_number,
        credit_score: 75,
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Create a minimal user object
      const userObj: User = {
        id: userData.id,
        email: userData.email,
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Create a minimal session object
      const sessionObj: Session = {
        access_token: await getAuthToken() || '',
        refresh_token: '',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: userObj,
      };
      
      console.log('Restored authentication for user:', userData.email);
      setSession(sessionObj);
      setUser(userObj);
      setUserProfile(profile);
      setIsLoggedIn(true);
      
      return true;
    } catch (error) {
      console.error('Error loading stored auth:', error);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing profile for user:', user.id);
      const { data: profile, error } = await getUserProfile(user.id);
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (!profile) {
        console.log('No profile found, creating default profile...');
        // Create a default profile if none exists
        const defaultProfile: Omit<UserProfile, 'created_at' | 'updated_at'> = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          mobile: user.user_metadata?.mobile || '',
          user_type: user.user_metadata?.user_type || 'tenant',
          apartment_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Default to Skyline Apartments
          flat_number: user.user_metadata?.flat_number || 'A-301',
          credit_score: 75,
          avatar_url: user.user_metadata?.avatar_url || null,
          is_active: true,
        };
        
        const { data: newProfile, error: createError } = await createUserProfile(defaultProfile);
        if (createError) {
          console.error('Error creating user profile:', createError);
          // Set a minimal profile to allow app to function
          setUserProfile({
            ...defaultProfile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          console.log('Profile created successfully:', newProfile);
          setUserProfile(newProfile);
        }
      } else {
        console.log('Profile loaded successfully:', profile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
      // Set a minimal profile to allow app to function
      if (user) {
        setUserProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          mobile: user.user_metadata?.mobile || '',
          user_type: user.user_metadata?.user_type || 'tenant',
          apartment_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          flat_number: user.user_metadata?.flat_number || 'A-301',
          credit_score: 75,
          avatar_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state first
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsLoggedIn(false);
      
      // Clear AsyncStorage
      await clearAllAuthData();
      
      // Then sign out from Supabase (optional, since we're using token-based auth)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Even if there's an error, we've cleared local state
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      // Clear local state even if there's an error
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // First, try to load stored authentication
        const storedAuthLoaded = await loadStoredAuth();
        
        if (storedAuthLoaded && mounted) {
          console.log('Using stored authentication');
          setLoading(false);
          return;
        }
        
        // If no stored auth, check Supabase session
        console.log('Checking Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting Supabase session:', error);
        }
        
        if (mounted) {
          console.log('Supabase session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoggedIn(!!session?.user);
          
          // If we have a Supabase session, refresh profile
          if (session?.user) {
            await refreshProfile();
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Supabase auth state changed:', event, session?.user?.email || 'No session');
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in via Supabase
          setSession(session);
          setUser(session.user);
          setIsLoggedIn(true);
          
          // Refresh profile and save to storage
          await refreshProfile();
          
          // Get the updated profile and save session
          const { data: profile } = await getUserProfile(session.user.id);
          if (profile) {
            await saveAuthSession(session, profile);
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setIsLoggedIn(false);
          await clearAllAuthData();
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    userProfile,
    loading,
    isLoggedIn,
    signOut: handleSignOut,
    refreshProfile,
    saveAuthSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}