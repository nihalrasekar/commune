import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, Shield, Lock, Eye, EyeOff, CircleCheck as CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { resetPasswordWithOTP, verifyOTP, updatePassword } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Snackbar } from '@/components/ui/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Colors } from '@/constants/Colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { snackbar, showError, showSuccess, showInfo, hideSnackbar } = useSnackbar();

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
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

  const validatePasswords = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendResetOTP = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await resetPasswordWithOTP(email.trim());
      
      if (error) {
        if (error.code === 'user_not_found') {
          showError('No account found with this email address.');
        } else if (error.message.includes('Email rate limit exceeded')) {
          showError('Too many reset requests. Please wait a moment before trying again.');
        } else {
          showError(error.message || 'Failed to send reset code. Please try again.');
        }
        return;
      }
      
      showSuccess('Reset code sent to your email! Please check your inbox.');
      setStep('otp');
    } catch (error) {
      console.error('Send reset OTP error:', error);
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
      const { data, error } = await verifyOTP(email.trim(), otp.trim(), 'recovery');
      
      if (error) {
        if (error.message.includes('Invalid token')) {
          showError('Invalid reset code. Please check and try again.');
        } else if (error.message.includes('Token has expired')) {
          showError('Reset code has expired. Please request a new one.');
        } else {
          showError(error.message || 'Code verification failed. Please try again.');
        }
        return;
      }
      
      if (data.user) {
        showSuccess('Code verified! Please set your new password.');
        setStep('password');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await updatePassword(newPassword);
      
      if (error) {
        showError(error.message || 'Failed to update password. Please try again.');
        return;
      }
      
      showSuccess('Password updated successfully!');
      setStep('success');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.replace('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Update password error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await resetPasswordWithOTP(email.trim());
      
      if (error) {
        showError('Failed to resend reset code. Please try again.');
        return;
      }
      
      showInfo('New reset code sent to your email!');
    } catch (error) {
      showError('Failed to resend reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setErrors({});
  };

  const handleBackToOTP = () => {
    setStep('otp');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Reset Password';
      case 'otp': return 'Enter Reset Code';
      case 'password': return 'Set New Password';
      case 'success': return 'Password Updated';
      default: return 'Reset Password';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'email': return 'Enter your email to receive a reset code';
      case 'otp': return `We sent a 6-digit code to ${email}`;
      case 'password': return 'Create a new secure password';
      case 'success': return 'Your password has been successfully updated';
      default: return '';
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
              onPress={() => {
                if (step === 'otp') {
                  handleBackToEmail();
                } else if (step === 'password') {
                  handleBackToOTP();
                } else {
                  router.back();
                }
              }}
            >
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{getStepTitle()}</Text>
              <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            {step === 'email' && (
              <>
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

                <Button
                  title={loading ? "Sending Reset Code..." : "Send Reset Code"}
                  onPress={handleSendResetOTP}
                  disabled={loading}
                  style={styles.actionButton}
                />
              </>
            )}

            {step === 'otp' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Enter 6-Digit Reset Code</Text>
                  <View style={[styles.inputContainer, errors.otp && styles.inputError]}>
                    <Shield size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="000000"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={otp}
                      onChangeText={(text) => {
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

                <Button
                  title={loading ? "Verifying..." : "Verify Code"}
                  onPress={handleVerifyOTP}
                  disabled={loading}
                  style={styles.actionButton}
                />

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive the code? </Text>
                  <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 'password' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                    <Lock size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
                      }}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeButton}
                      disabled={loading}
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} color={Colors.dark.textMuted} />
                      ) : (
                        <Eye size={20} color={Colors.dark.textMuted} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.newPassword && <Text style={styles.fieldError}>{errors.newPassword}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                    <Lock size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }}
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

                <Button
                  title={loading ? "Updating Password..." : "Update Password"}
                  onPress={handleUpdatePassword}
                  disabled={loading}
                  style={styles.actionButton}
                />
              </>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <CheckCircle size={64} color={Colors.dark.success} />
                </View>
                <Text style={styles.successTitle}>Password Updated!</Text>
                <Text style={styles.successMessage}>
                  Your password has been successfully updated. You can now sign in with your new password.
                </Text>
                <Button
                  title="Go to Sign In"
                  onPress={() => router.replace('/auth/login')}
                  style={styles.actionButton}
                />
              </View>
            )}

            {step !== 'success' && (
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity 
                  onPress={() => router.replace('/auth/login')}
                  disabled={loading}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingTop: 32,
    paddingBottom: 32,
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
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