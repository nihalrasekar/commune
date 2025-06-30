import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, CreditCard, FileText, Shield, Bell, Moon, CircleHelp as HelpCircle, LogOut, Star, TrendingUp, Award, ChevronRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Snackbar } from '@/components/ui/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

const creditScoreBreakdown = [
  { category: 'Payment History', score: 92, color: Colors.dark.success },
  { category: 'Property Maintenance', score: 85, color: Colors.dark.primary },
  { category: 'Tenant Relations', score: 90, color: Colors.dark.secondary },
  { category: 'Community Engagement', score: 82, color: Colors.dark.accent },
];

const achievements = [
  { id: '1', title: 'Reliable Owner', description: 'On-time rent collection', icon: Star, color: Colors.dark.success },
  { id: '2', title: 'Property Maintainer', description: 'Regular maintenance', icon: Award, color: Colors.dark.primary },
  { id: '3', title: 'Community Leader', description: 'Active participation', icon: TrendingUp, color: Colors.dark.secondary },
];

export default function ProfileScreen() {
  const { userProfile, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  
  const { snackbar, showError, showSuccess, showWarning, hideSnackbar } = useSnackbar();

  const menuItems = [
    { id: '1', title: 'Personal Information', icon: User, color: Colors.dark.primary },
    { id: '2', title: 'Payment & Billing', icon: CreditCard, color: Colors.dark.secondary },
    { id: '3', title: 'Documents', icon: FileText, color: Colors.dark.accent },
    { id: '4', title: 'Privacy & Security', icon: Shield, color: Colors.dark.success },
    { id: '5', title: 'Help & Support', icon: HelpCircle, color: Colors.dark.warning },
  ];

  const handleSignOut = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await signOut();
              showSuccess('Signed out successfully');
            } catch (error) {
              console.error('Error signing out:', error);
              showError('Failed to sign out. Please try again.');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.full_name ? getInitials(userProfile.full_name) : 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userProfile?.full_name || 'User'}</Text>
              <Text style={styles.userType}>{userProfile?.user_type || 'Tenant'}</Text>
              <Text style={styles.userEmail}>{userProfile?.email || 'user@example.com'}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Credit Score Section */}
          <Card style={styles.creditScoreCard} elevated>
            <View style={styles.creditScoreHeader}>
              <Text style={styles.creditScoreTitle}>Credit Score</Text>
              <Text style={styles.creditScoreSubtitle}>Based on your behavior</Text>
            </View>
            
            <View style={styles.creditScoreContent}>
              <CircularProgress
                progress={userProfile?.credit_score || 75}
                size={120}
                strokeWidth={8}
                color={Colors.dark.success}
                title="Credit Score"
              />
              
              <View style={styles.creditScoreDetails}>
                <Text style={styles.creditScoreValue}>{userProfile?.credit_score || 75}/100</Text>
                <Text style={styles.creditScoreRating}>
                  {(userProfile?.credit_score || 75) >= 80 ? 'Excellent' : 
                   (userProfile?.credit_score || 75) >= 60 ? 'Good' : 'Fair'}
                </Text>
                <Text style={styles.creditScoreTrend}>↗ +5 points this month</Text>
              </View>
            </View>
            
            <View style={styles.creditBreakdown}>
              <Text style={styles.breakdownTitle}>Score Breakdown</Text>
              {creditScoreBreakdown.map((item, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <Text style={styles.breakdownCategory}>{item.category}</Text>
                  <View style={styles.breakdownProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${item.score}%`, backgroundColor: item.color }
                        ]} 
                      />
                    </View>
                    <Text style={styles.breakdownScore}>{item.score}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>1</Text>
                <Text style={styles.statLabel}>Properties</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>₹25K</Text>
                <Text style={styles.statLabel}>Monthly Rent</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>
                  {userProfile?.created_at ? 
                    Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 
                    12
                  }
                </Text>
                <Text style={styles.statLabel}>Months Active</Text>
              </Card>
            </View>
          </View>

          {/* User Details */}
          <Card style={styles.userDetailsCard} elevated>
            <Text style={styles.userDetailsTitle}>Property Information</Text>
            <View style={styles.userDetailsList}>
              <View style={styles.userDetailItem}>
                <Text style={styles.userDetailLabel}>Apartment:</Text>
                <Text style={styles.userDetailValue}>Skyline Apartments</Text>
              </View>
              <View style={styles.userDetailItem}>
                <Text style={styles.userDetailLabel}>Flat Number:</Text>
                <Text style={styles.userDetailValue}>{userProfile?.flat_number || 'A-301'}</Text>
              </View>
              <View style={styles.userDetailItem}>
                <Text style={styles.userDetailLabel}>Property Type:</Text>
                <Text style={styles.userDetailValue}>
                  {userProfile?.user_type === 'tenant' ? 'Tenant' :
                   userProfile?.user_type === 'owner' ? 'Owner' : 'Tenant'}
                </Text>
              </View>
              <View style={styles.userDetailItem}>
                <Text style={styles.userDetailLabel}>Mobile:</Text>
                <Text style={styles.userDetailValue}>{userProfile?.mobile || '+91 98765 43210'}</Text>
              </View>
              <View style={styles.userDetailItem}>
                <Text style={styles.userDetailLabel}>Member Since:</Text>
                <Text style={styles.userDetailValue}>
                  {userProfile?.created_at ? formatJoinDate(userProfile.created_at) : 'January 2023'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Achievements */}
          <Card style={styles.achievementsCard} elevated>
            <Text style={styles.achievementsTitle}>Achievements</Text>
            <View style={styles.achievementsList}>
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                      <IconComponent size={20} color={achievement.color} />
                    </View>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Settings */}
          <Card style={styles.settingsCard} elevated>
            <Text style={styles.settingsTitle}>Settings</Text>
            
            {/* Toggle Settings */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Moon size={20} color={Colors.dark.textSecondary} />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor={darkMode ? Colors.dark.text : Colors.dark.textMuted}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color={Colors.dark.textSecondary} />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.dark.border, true: Colors.dark.primary }}
                thumbColor={notifications ? Colors.dark.text : Colors.dark.textMuted}
              />
            </View>
          </Card>

          {/* Menu Items */}
          <Card style={styles.menuCard} elevated>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity key={item.id} style={styles.menuItem}>
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                      <IconComponent size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuText}>{item.title}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.dark.textMuted} />
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Logout Button */}
          <Card style={styles.logoutCard}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleSignOut}
              disabled={signingOut}
            >
              <LogOut size={20} color={Colors.dark.error} />
              <Text style={styles.logoutText}>
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={hideSnackbar}
        duration={snackbar.duration}
        action={snackbar.action}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  userType: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 12,
    color: Colors.dark.text + '60',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  creditScoreCard: {
    padding: 20,
    marginBottom: 20,
  },
  creditScoreHeader: {
    marginBottom: 20,
  },
  creditScoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  creditScoreSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  creditScoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  creditScoreDetails: {
    flex: 1,
  },
  creditScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  creditScoreRating: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.success,
    marginBottom: 4,
  },
  creditScoreTrend: {
    fontSize: 12,
    color: Colors.dark.success,
  },
  creditBreakdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownCategory: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  breakdownProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.dark.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    minWidth: 24,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  userDetailsCard: {
    padding: 20,
    marginBottom: 20,
  },
  userDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  userDetailsList: {
    gap: 12,
  },
  userDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userDetailLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  userDetailValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  achievementsCard: {
    padding: 20,
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  settingsCard: {
    padding: 20,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  menuCard: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  logoutCard: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: Colors.dark.error,
    fontWeight: '500',
  },
});