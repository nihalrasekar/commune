import React, { useState } from 'react';
<<<<<<< HEAD
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
=======
import { View, Text, StyleSheet, TextInput, TouchableOpacity,Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
>>>>>>> c083026 (new commit)
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { signIn, getUserProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
<<<<<<< HEAD

=======
>>>>>>> c083026 (new commit)
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { snackbar, showError, showSuccess, hideSnackbar } = useSnackbar();
  const { saveAuthSession } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await signIn(email.trim(), password);
      
      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          showError('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          showError('Please check your email and confirm your account before signing in.');
        } else if (error.message.includes('Too many requests')) {
          showError('Too many login attempts. Please wait a moment and try again.');
        } else {
          showError(error.message || 'Login failed. Please try again.');
        }
        return;
      }
      
      if (data.user && data.session) {
        console.log('Login successful for user:', data.user.email);
        
        // Get user profile
        const { data: profile, error: profileError } = await getUserProfile(data.user.id);
        
        if (profileError || !profile) {
          console.error('Error fetching profile:', profileError);
          showError('Login successful but failed to load profile. Please try again.');
          return;
        }
        
        // Save authentication session to AsyncStorage
        console.log('Saving authentication session...');
        const sessionSaved = await saveAuthSession(data.session, profile);
        
        if (sessionSaved) {
          console.log('Authentication session saved successfully');
          showSuccess('Welcome back! Redirecting to app...');
          
          // Small delay to show success message, then navigation will be handled by AuthContext
          setTimeout(() => {
            console.log('Login process completed, AuthContext will handle navigation');
          }, 1000);
        } else {
          console.error('Failed to save authentication session');
          showError('Login successful but failed to save session. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
<<<<<<< HEAD
                <User size={32} color={Colors.dark.text} />
              </View>
              <Text style={styles.appName}>Property Super App</Text>
              <Text style={styles.tagline}>Your home, simplified</Text>
=======
                
               <Image source={require('@/assets/images/white.png')} style={{ width: 100, height: 100 }} />

              </View>
              <Text style={styles.appName}>Commune</Text>
              <Text style={styles.tagline}>Your lifestyle, your space</Text>
>>>>>>> c083026 (new commit)
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Mail size={20} color={Colors.dark.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Lock size={20} color={Colors.dark.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.dark.textMuted} />
                  ) : (
                    <Eye size={20} color={Colors.dark.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What you can do:</Text>
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <ArrowRight size={16} color={Colors.dark.primary} />
                <Text style={styles.featureText}>Pay rent and utilities</Text>
              </View>
              <View style={styles.feature}>
                <ArrowRight size={16} color={Colors.dark.primary} />
                <Text style={styles.featureText}>Connect with neighbors</Text>
              </View>
              <View style={styles.feature}>
                <ArrowRight size={16} color={Colors.dark.primary} />
                <Text style={styles.featureText}>Book community services</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.dark.text + '80',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  formHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  inputError: {
    borderColor: Colors.dark.error,
    backgroundColor: Colors.dark.error + '10',
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  fieldError: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  signupText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});