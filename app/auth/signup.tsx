import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, User, Phone, MapPin, Chrome as Home, ArrowLeft, Shield, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { signUpWithOTP, verifySignupOTP } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Colors } from '@/constants/Colors';

const userTypes = [
  { value: 'tenant', label: 'Tenant' },
  { value: 'owner', label: 'Owner' },
];

const propertyTypes = [
  { value: 'flat', label: 'Flat/Apartment' },
  { value: 'row_house', label: 'Row House' },
  { value: 'standalone', label: 'Standalone House' },
];

export default function SignUpScreen() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobile: '',
    userType: 'tenant',
    propertyType: 'flat',
    address: '',
    apartmentName: 'Skyline Apartments',
    flatNumber: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { snackbar, showError, showSuccess, showWarning, showInfo, hideSnackbar } = useSnackbar();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.flatNumber.trim()) {
      newErrors.flatNumber = 'Flat number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors: Record<string, string> = {};
    
    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const userData = {
        full_name: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        user_type: formData.userType as 'tenant' | 'owner',
        address: formData.address.trim(),
        flat_number: formData.flatNumber.trim(),
        password: formData.password, // Include password in user data
      };
      
      const { data, error } = await signUpWithOTP(formData.email.trim(), userData);
      
      if (error) {
        if (error.code === 'user_already_exists' || error.message.includes('already registered')) {
          showWarning('An account with this email already exists. Redirecting to sign in...', 3000);
          setTimeout(() => {
            router.replace('/auth/login');
          }, 2000);
        } else if (error.message.includes('Unable to validate email address')) {
          showError('Please enter a valid email address.');
        } else {
          showError(error.message || 'Account creation failed. Please try again.');
        }
        return;
      }
      
      showSuccess('Verification code sent to your email! Please check your inbox.');
      setStep('otp');
    } catch (error) {
      console.error('Sign up error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const userData = {
        full_name: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        user_type: formData.userType as 'tenant' | 'owner',
        address: formData.address.trim(),
        flat_number: formData.flatNumber.trim(),
        password: formData.password, // Include password for account creation
      };
      
      const { data, error } = await verifySignupOTP(formData.email.trim(), otp.trim(), userData);
      
      if (error) {
        if (error.message.includes('Invalid token') || error.message.includes('Token has expired')) {
          showError('Invalid or expired verification code. Please try again.');
        } else {
          showError(error.message || 'Verification failed. Please try again.');
        }
        return;
      }
      
      if (data?.user) {
        showSuccess('Account created successfully! Welcome to Property Super App!');
        // Navigation will be handled by the auth state change in AuthContext
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const userData = {
        full_name: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        user_type: formData.userType as 'tenant' | 'owner',
        address: formData.address.trim(),
        flat_number: formData.flatNumber.trim(),
        password: formData.password,
      };
      
      const { data, error } = await signUpWithOTP(formData.email.trim(), userData);
      
      if (error) {
        showError('Failed to resend verification code. Please try again.');
        return;
      }
      
      showInfo('New verification code sent to your email!');
    } catch (error) {
      showError('Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setOtp('');
    setErrors({});
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => step === 'otp' ? handleBackToForm() : router.back()}
            >
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                {step === 'form' ? 'Create Account' : 'Verify Email'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'form' 
                  ? 'Join our community today' 
                  : `Enter the 6-digit code sent to ${formData.email}`
                }
              </Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            {step === 'form' ? (
              <>
                {/* Personal Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                      <User size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.fullName}
                        onChangeText={(text) => updateFormData('fullName', text)}
                        autoCapitalize="words"
                        editable={!loading}
                      />
                    </View>
                    {errors.fullName && <Text style={styles.fieldError}>{errors.fullName}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                      <Mail size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.email}
                        onChangeText={(text) => updateFormData('email', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                    </View>
                    {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <View style={[styles.inputContainer, errors.mobile && styles.inputError]}>
                      <Phone size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your mobile number"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.mobile}
                        onChangeText={(text) => updateFormData('mobile', text)}
                        keyboardType="phone-pad"
                        editable={!loading}
                      />
                    </View>
                    {errors.mobile && <Text style={styles.fieldError}>{errors.mobile}</Text>}
                  </View>
                </View>

                {/* Security */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Security</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                      <Lock size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Create a password"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.password}
                        onChangeText={(text) => updateFormData('password', text)}
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

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                      <Lock size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.confirmPassword}
                        onChangeText={(text) => updateFormData('confirmPassword', text)}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} color={Colors.dark.textMuted} />
                        ) : (
                          <Eye size={20} color={Colors.dark.textMuted} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}
                  </View>
                </View>

                {/* Property Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Property Information</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>User Type</Text>
                    <View style={styles.radioGroup}>
                      {userTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={[
                            styles.radioOption,
                            formData.userType === type.value && styles.radioOptionSelected
                          ]}
                          onPress={() => updateFormData('userType', type.value)}
                          disabled={loading}
                        >
                          <View style={[
                            styles.radioButton,
                            formData.userType === type.value && styles.radioButtonSelected
                          ]} />
                          <Text style={styles.radioLabel}>{type.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Property Type</Text>
                    <View style={styles.radioGroup}>
                      {propertyTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={[
                            styles.radioOption,
                            formData.propertyType === type.value && styles.radioOptionSelected
                          ]}
                          onPress={() => updateFormData('propertyType', type.value)}
                          disabled={loading}
                        >
                          <View style={[
                            styles.radioButton,
                            formData.propertyType === type.value && styles.radioButtonSelected
                          ]} />
                          <Text style={styles.radioLabel}>{type.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Apartment Name</Text>
                    <View style={styles.inputContainer}>
                      <Home size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter apartment name"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.apartmentName}
                        onChangeText={(text) => updateFormData('apartmentName', text)}
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Flat Number</Text>
                    <View style={[styles.inputContainer, errors.flatNumber && styles.inputError]}>
                      <Home size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., A-301"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.flatNumber}
                        onChangeText={(text) => updateFormData('flatNumber', text)}
                        autoCapitalize="characters"
                        editable={!loading}
                      />
                    </View>
                    {errors.flatNumber && <Text style={styles.fieldError}>{errors.flatNumber}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address</Text>
                    <View style={[styles.inputContainer, errors.address && styles.inputError]}>
                      <MapPin size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your address"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={formData.address}
                        onChangeText={(text) => updateFormData('address', text)}
                        multiline
                        editable={!loading}
                      />
                    </View>
                    {errors.address && <Text style={styles.fieldError}>{errors.address}</Text>}
                  </View>
                </View>

                {/* Create Account Button */}
                <Button
                  title={loading ? "Sending Verification Code..." : "Create Account"}
                  onPress={handleSignUp}
                  disabled={loading}
                  style={styles.actionButton}
                />
              </>
            ) : (
              <>
                {/* OTP Verification */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Email Verification</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Enter 6-Digit Code</Text>
                    <View style={[styles.inputContainer, errors.otp && styles.inputError]}>
                      <Shield size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.input}
                        placeholder="000000"
                        placeholderTextColor={Colors.dark.textMuted}
                        value={otp}
                        onChangeText={(text) => {
                          // Only allow numbers and limit to 6 digits
                          const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                          setOtp(numericText);
                          if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined }));
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!loading}
                      />
                    </View>
                    {errors.otp && <Text style={styles.fieldError}>{errors.otp}</Text>}
                  </View>
                </View>

                {/* Verify Button */}
                <Button
                  title={loading ? "Verifying..." : "Verify & Complete Signup"}
                  onPress={handleVerifyOTP}
                  disabled={loading}
                  style={styles.actionButton}
                />

                {/* Resend OTP */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive the code? </Text>
                  <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
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
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.text + '80',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  radioOptionSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary + '10',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  radioButtonSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  actionButton: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  resendLink: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});