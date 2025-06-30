import { useEffect } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Search, Chrome as Home, Users, Wrench, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { session, user, userProfile, loading, isLoggedIn } = useAuth();

  useEffect(() => {
    console.log('TabLayout - Auth state:', {
      hasSession: !!session,
      hasUser: !!user,
      hasProfile: !!userProfile,
      loading,
      isLoggedIn,
      userEmail: user?.email
    });
  }, [session, user, userProfile, loading, isLoggedIn]);

  // Show loading state while checking authentication
  if (loading) {
    console.log('TabLayout - Still loading auth state');
    return null; // You could show a loading spinner here
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    console.log('TabLayout - User not logged in, redirecting to login');
    return <Redirect href="/auth/login" />;
  }

  console.log('TabLayout - User authenticated, showing tabs');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.dark.surface,
          borderTopColor: Colors.dark.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.dark.tabActive,
        tabBarInactiveTintColor: Colors.dark.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Properties',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ size, color }) => (
            <Wrench size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}