<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Zap, Droplets, Wrench, Car, CreditCard, Users, Clock, MapPin, X, CircleCheck as CheckCircle, Camera, QrCode, Battery, Power, Timer, IndianRupee, Bot, Sparkles } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withRepeat } from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
=======

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Users, Clock, X, CircleCheck as CheckCircle, CreditCard, Bot, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSharedValue, useAnimatedStyle, withTiming, withSequence, withRepeat } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
>>>>>>> c083026 (new commit)
import { Snackbar } from '@/components/ui/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
<<<<<<< HEAD
=======
import { Camera, CameraView } from 'expo-camera';
type Bill = {
  id: string;
  name: string;
  icon: string;
  amount: number;
};

type ChargerDetails = {
  apartmentName: string;
  serialNo: string;
  hourlyRate: number;
  location: string;
  capacity: string;
};
>>>>>>> c083026 (new commit)

const todayEntries = [
  {
    id: '1',
    visitorName: 'Rajesh Kumar',
    purpose: 'Delivery - Amazon',
    time: '10:30 AM',
    status: 'approved',
    photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    visitorName: 'Meera Patel',
    purpose: 'House Help',
    time: '2:15 PM',
    status: 'approved',
    photo: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    visitorName: 'Amit Electrician',
    purpose: 'Maintenance Work',
    time: '4:45 PM',
    status: 'pending',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

<<<<<<< HEAD
const paymentMethods = [
  { id: 'upi', name: 'UPI Payment', icon: 'phone' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
  { id: 'netbanking', name: 'Net Banking', icon: 'globe' },
];

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [chargerModalVisible, setChargerModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Vehicle Charger States
  const [isCharging, setIsCharging] = useState(false);
  const [chargingData, setChargingData] = useState<{
    apartmentName: string;
    chargerNumber: string;
    startTime: Date;
    currentCost: number;
    duration: number;
  } | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<{
    apartmentName: string;
    chargerNumber: string;
  } | null>(null);
  
  // Charging session timer
  const chargingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice AI Agent animation using react-native-reanimated v3
  const pulseAnim = useSharedValue(1);

  const { snackbar, showError, showSuccess, showInfo, hideSnackbar } = useSnackbar();
=======
export default function HomeScreen() {
  const { userProfile } = useAuth();
  const [paymentModal, setPaymentModal] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [chargingModal, setChargingModal] = useState(false);
  const [scannerModal, setScannerModal] = useState(false);

  const [isCharging, setIsCharging] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [chargerDetails, setChargerDetails] = useState<ChargerDetails | null>(null);
  // Voice AI Agent animation using react-native-reanimated v3
  const pulseAnim = useSharedValue(1);

  const { snackbar, showError, showSuccess, showWarning, hideSnackbar } = useSnackbar();
>>>>>>> c083026 (new commit)

  // Animated style for the voice agent button
  const animatedVoiceAgentButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
    };
  });

  useEffect(() => {
    // Start pulse animation for AI button using react-native-reanimated v3
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
<<<<<<< HEAD
  }, []);

  // Charging session timer
  useEffect(() => {
    if (isCharging && chargingData) {
      // Clear any existing timer
      if (chargingTimerRef.current) {
        clearInterval(chargingTimerRef.current);
      }
      
      // Start a new timer that updates every 10 seconds
      chargingTimerRef.current = setInterval(() => {
        const now = new Date();
        const startTime = chargingData.startTime;
        const durationInMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        const hourlyRate = 150; // ₹150 per hour
        const cost = Math.round((durationInMinutes / 60) * hourlyRate);
        
        console.log(`Charging update: ${durationInMinutes} minutes, ₹${cost}`);
        
        setChargingData(prev => {
          if (prev) {
            return {
              ...prev,
              duration: durationInMinutes,
              currentCost: cost
            };
          }
          return prev;
        });
      }, 10000); // Update every 10 seconds
    }
    
    // Cleanup timer on unmount or when charging stops
    return () => {
      if (chargingTimerRef.current) {
        clearInterval(chargingTimerRef.current);
        chargingTimerRef.current = null;
      }
    };
  }, [isCharging, chargingData]);
=======

    // Request camera permissions
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
>>>>>>> c083026 (new commit)

  const handleSearchPress = () => {
    // Navigate to the search page
    router.push('/search');
  };

  const handleVoiceAgentPress = () => {
    router.push('/voice-agent');
  };
<<<<<<< HEAD

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      showError('Please select a payment method');
      return;
    }
    
    // Simulate payment processing
    console.log('Processing payment for:', selectedAction?.title);
    console.log('Payment method:', selectedPaymentMethod);
    console.log('Amount:', selectedAction?.amount);
    
    setIsProcessing(true);
    showInfo('Processing payment...');
    
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setPaymentStep(3);
      showSuccess('Payment processed successfully!');
      
      console.log('Payment successful');
      
      setTimeout(() => {
        setPaymentModalVisible(false);
        setSelectedAction(null);
        setSelectedPaymentMethod('');
        setPaymentStep(1);
        setPaymentSuccess(false);
      }, 3000);
    }, 2000);
  };

  // Enhanced QR Code parsing function
  const parseQRCode = (data: string) => {
    try {
      console.log('Raw QR data:', data);
      
      let cleanData = data.trim();
      if (cleanData.startsWith('"') && cleanData.endsWith('"')) {
        cleanData = cleanData.slice(1, -1);
      }
      
      // Try to parse as key-value pairs
      const parts = cleanData.split(',');
      let apartmentName = '';
      let chargerNumber = '';
      
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.startsWith('name:')) {
          apartmentName = trimmedPart.replace('name:', '').trim();
        } else if (trimmedPart.startsWith('no:')) {
          chargerNumber = trimmedPart.replace('no:', '').trim();
        }
      }
      
      console.log('Parsed QR data:', { apartmentName, chargerNumber });
      
      if (apartmentName && chargerNumber) {
        return { apartmentName, chargerNumber };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  };

  const handleQRCodeScanned = ({ data }: { data: string }) => {
    console.log('QR code scanned with data:', data);
    
    const parsed = parseQRCode(data);
    if (parsed) {
      console.log('QR code successfully parsed:', parsed);
      setScannedData(parsed);
      setShowQRScanner(false);
      
      // Start charging session
      const startTime = new Date();
      setChargingData({
        apartmentName: parsed.apartmentName,
        chargerNumber: parsed.chargerNumber,
        startTime: startTime,
        currentCost: 0,
        duration: 0,
      });
      setIsCharging(true);
      showSuccess(`Charging session started successfully for ${parsed.chargerNumber}!`);
      console.log('Charging session started:', {
        apartmentName: parsed.apartmentName,
        chargerNumber: parsed.chargerNumber,
        startTime: startTime,
      });
    } else {
      console.error('Invalid QR Code format');
      showError('Invalid QR Code. Please scan a valid charging QR code.');
    }
  };

  const handleDetachAndPay = (paymentType: 'instant' | 'master') => {
    if (!chargingData) return;

    console.log('Detach and pay initiated with payment type:', paymentType);
    console.log('Charging data:', chargingData);

    if (paymentType === 'instant') {
      setSelectedAction({
        id: 'charger-payment',
        title: 'Vehicle Charger Payment',
        subtitle: `${chargingData.chargerNumber} - ${chargingData.duration} mins`,
        icon: Zap,
        color: Colors.dark.warning,
        amount: `₹${chargingData.currentCost}`,
        type: 'charger-payment',
        overdue: false,
      });
      setChargerModalVisible(false);
      setPaymentModalVisible(true);
      setPaymentStep(1);
    } else {
      showSuccess(`₹${chargingData.currentCost} has been added to your monthly consolidated bill.`);
      setIsCharging(false);
      setChargingData(null);
      setChargerModalVisible(false);
    }
  };

  const showSnackbar = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration?: number,
    action?: { label: string; onPress: () => void }
  ) => {
    hideSnackbar();
    setTimeout(() => {
      if (type === 'info') {
        showInfo(message, duration);
      } else if (type === 'success') {
        showSuccess(message, duration);
      } else if (type === 'warning') {
        showWarning(message, duration, action);
      } else if (type === 'error') {
        showError(message, duration);
      }
    }, 100);
  };

  const showWarning = (
    message: string,
    duration?: number,
    action?: { label: string; onPress: () => void }
  ) => {
    hideSnackbar();
    setTimeout(() => {
      snackbar.visible = true;
      snackbar.message = message;
      snackbar.type = 'warning';
      snackbar.duration = duration;
      snackbar.action = action;
    }, 100);
  };

  const renderPaymentModal = () => {
    if (!selectedAction) return null;

    return (
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {paymentStep === 1 ? 'Payment Details' : 
               paymentStep === 2 ? 'Select Payment Method' : 'Payment Successful'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {paymentStep === 1 && (
              <>
                <Card style={styles.billCard} elevated>
                  <View style={styles.billHeader}>
                    <Text style={styles.billTitle}>{selectedAction.title}</Text>
                    <Text style={styles.billAmount}>{selectedAction.amount}</Text>
                  </View>
                  <View style={styles.billDetails}>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Due Date:</Text>
                      <Text style={styles.billValue}>{selectedAction.dueDate || 'Immediate'}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Late Fee:</Text>
                      <Text style={styles.billValue}>₹0</Text>
                    </View>
                    <View style={[styles.billRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total Amount:</Text>
                      <Text style={styles.totalAmount}>{selectedAction.amount}</Text>
                    </View>
                  </View>
                </Card>
                <Button
                  title="Continue to Payment"
                  onPress={() => setPaymentStep(2)}
                  style={styles.continueButton}
                />
              </>
            )}

            {paymentStep === 2 && (
              <>
                <Card style={styles.paymentMethodsCard} elevated>
                  <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethod,
                        selectedPaymentMethod === method.id && styles.paymentMethodSelected
                      ]}
                      onPress={() => setSelectedPaymentMethod(method.id)}
                    >
                      <View style={styles.paymentMethodContent}>
                        <Text style={styles.paymentMethodName}>{method.name}</Text>
                      </View>
                      <View style={[
                        styles.radioButton,
                        selectedPaymentMethod === method.id && styles.radioButtonSelected
                      ]} />
                    </TouchableOpacity>
                  ))}
                </Card>
                <Button
                  title={isProcessing ? "Processing..." : `Pay ${selectedAction.amount}`}
                  onPress={handlePayment}
                  style={styles.payButton}
                  disabled={isProcessing || !selectedPaymentMethod}
                />
              </>
            )}

            {paymentStep === 3 && (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <CheckCircle size={64} color={Colors.dark.success} />
                </View>
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successMessage}>
                  Your payment of {selectedAction.amount} has been processed successfully.
                </Text>
                
                <Card style={styles.receiptCard} elevated>
                  <Text style={styles.receiptTitle}>Transaction Receipt</Text>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Transaction ID:</Text>
                    <Text style={styles.receiptValue}>#TXN{Date.now().toString().slice(-8)}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Amount:</Text>
                    <Text style={styles.receiptValue}>{selectedAction.amount}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Date:</Text>
                    <Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text>
                  </View>
                </Card>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderChargerModal = () => {
    return (
      <Modal
        visible={chargerModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChargerModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setChargerModalVisible(false)}>
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Vehicle Charger</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {!isCharging ? (
              <View style={styles.scannerContainer}>
                <Card style={styles.scannerCard} elevated>
                  <View style={styles.scannerHeader}>
                    <QrCode size={32} color={Colors.dark.primary} />
                    <Text style={styles.scannerTitle}>Scan Charger QR Code</Text>
                    <Text style={styles.scannerSubtitle}>
                      Point your camera at the QR code on the charging station
                    </Text>
                  </View>

                  {showQRScanner ? (
                    <View style={styles.cameraContainer}>
                      {Platform.OS === 'web' ? (
                        <View style={styles.webCameraFallback}>
                          <Camera size={64} color={Colors.dark.textMuted} />
                          <Text style={styles.webCameraText}>Camera not available on web</Text>
                          <Button
                            title="Simulate Scan"
                            onPress={() => {
                              console.log('Simulating QR code scan');
                              const mockQRData = "name:Skyline Apartments,no:Charger-A1";
                              handleQRCodeScanned({ data: mockQRData });
                            }}
                            size="small"
                            style={styles.simulateButton}
                          />
                        </View>
                      ) : (
                        permission?.granted ? (
                          <CameraView
                            style={styles.camera}
                            facing="back"
                            onBarcodeScanned={handleQRCodeScanned}
                          >
                            <View style={styles.scannerOverlay}>
                              <View style={styles.scannerFrame}>
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                              </View>
                              <Text style={styles.scannerInstructions}>
                                Align QR code within the frame
                              </Text>
                            </View>
                          </CameraView>
                        ) : (
                          <View style={styles.permissionContainer}>
                            <Camera size={64} color={Colors.dark.textMuted} />
                            <Text style={styles.permissionText}>Camera permission required</Text>
                            <Button
                              title="Grant Permission"
                              onPress={requestPermission}
                              size="small"
                            />
                          </View>
                        )
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.startScanButton}
                      onPress={() => {
                        console.log('Starting QR scanner');
                        setShowQRScanner(true);
                      }}
                    >
                      <Camera size={24} color={Colors.dark.primary} />
                      <Text style={styles.startScanText}>Start Scanning</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              </View>
            ) : (
              <View style={styles.chargingContainer}>
                <Card style={styles.chargingCard} elevated>
                  <View style={styles.chargingHeader}>
                    <View style={styles.chargingIcon}>
                      <Battery size={32} color={Colors.dark.success} />
                    </View>
                    <Text style={styles.chargingTitle}>Currently Charging</Text>
                    <Text style={styles.chargingSubtitle}>Your vehicle is connected</Text>
                  </View>

                  <View style={styles.chargingDetails}>
                    <View style={styles.chargingRow}>
                      <MapPin size={16} color={Colors.dark.textMuted} />
                      <Text style={styles.chargingLabel}>Location:</Text>
                      <Text style={styles.chargingValue}>{chargingData?.apartmentName}</Text>
                    </View>
                    <View style={styles.chargingRow}>
                      <Zap size={16} color={Colors.dark.textMuted} />
                      <Text style={styles.chargingLabel}>Charger:</Text>
                      <Text style={styles.chargingValue}>{chargingData?.chargerNumber}</Text>
                    </View>
                    <View style={styles.chargingRow}>
                      <Timer size={16} color={Colors.dark.textMuted} />
                      <Text style={styles.chargingLabel}>Duration:</Text>
                      <Text style={styles.chargingValue}>{chargingData?.duration} minutes</Text>
                    </View>
                    <View style={styles.chargingRow}>
                      <IndianRupee size={16} color={Colors.dark.textMuted} />
                      <Text style={styles.chargingLabel}>Current Cost:</Text>
                      <Text style={[styles.chargingValue, styles.costValue]}>₹{chargingData?.currentCost}</Text>
                    </View>
                  </View>
                </Card>

                <Card style={styles.detachCard} elevated>
                  <Text style={styles.detachTitle}>Detach & Pay</Text>
                  <Text style={styles.detachSubtitle}>Choose your payment option</Text>
                  
                  <View style={styles.paymentOptions}>
                    <TouchableOpacity
                      style={styles.paymentOption}
                      onPress={() => handleDetachAndPay('instant')}
                    >
                      <CreditCard size={24} color={Colors.dark.primary} />
                      <Text style={styles.paymentOptionTitle}>Instant Pay</Text>
                      <Text style={styles.paymentOptionSubtitle}>Pay now via UPI/Card</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.paymentOption}
                      onPress={() => handleDetachAndPay('master')}
                    >
                      <Clock size={24} color={Colors.dark.secondary} />
                      <Text style={styles.paymentOptionTitle}>Add to Master Bill</Text>
                      <Text style={styles.paymentOptionSubtitle}>Monthly consolidated bill</Text>
                    </TouchableOpacity>
                  </View>
                </Card>

                <TouchableOpacity
                  style={styles.emergencyStop}
                  onPress={() => {
                    showWarning('This will stop charging and add the amount to outstanding bills.', 5000, {
                      label: 'Stop Charging',
                      onPress: () => {
                        console.log('Emergency stop initiated');
                        setIsCharging(false);
                        setChargingData(null);
                        setChargerModalVisible(false);
                        showSuccess('Charging stopped. Amount added to outstanding bills.');
                      }
                    });
                  }}
                >
                  <Text style={styles.emergencyStopText}>Emergency Stop (Outstanding Bill)</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

=======
  const billTypes = [
    { id: 'electricity', name: 'Electricity', icon: '⚡', amount: 1250 },
    { id: 'rent', name: 'Rent', icon: '🏠', amount: 15000 },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧', amount: 2500 },
    { id: 'water', name: 'Water', icon: '💧', amount: 800 },
    { id: 'gas', name: 'Gas', icon: '🔥', amount: 650 }
  ];

  const handleBillPayment = (bill: any) => {
    setSelectedBill(bill);
    setPaymentModal(true);
  };

  const handlePayCharging = () => {
    setScannerModal(true);
  };

  const handleBarCodeScanned = ({ data }: any) => {
    setScannerModal(false);

    // Parse QR code data (assuming JSON format)
    try {
      const qrData = JSON.parse(data);
      setChargerDetails({
        apartmentName: qrData.apartmentName,
        serialNo: qrData.serialNo,
        hourlyRate: qrData.hourlyRate || 50,
        location: qrData.location,
        capacity: qrData.capacity || '22kW'
      });
      setChargingModal(true);
    } catch (error) {
      Alert.alert('Invalid QR Code', 'Please scan a valid charger QR code');
    }
  };

  const startCharging = () => {
    setIsCharging(true);
    Alert.alert('Charging Started', 'Your vehicle is now charging');
  };

  const stopCharging = () => {
    Alert.alert(
      'Stop Charging',
      'How would you like to pay?',
      [
        {
          text: 'Pay Instantly',
          onPress: () => {
            setIsCharging(false);
            Alert.alert('Payment', 'Instant payment processed successfully');
          }
        },
        {
          text: 'Add to Main Bill',
          onPress: () => {
            setIsCharging(false);
            Alert.alert('Added to Bill', 'Charging cost added to your main bill');
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const processPayment = () => {
    Alert.alert('Payment Successful', `${selectedBill?.name} bill paid successfully`);
    setPaymentModal(false);
    setSelectedBill(null);
  };
>>>>>>> c083026 (new commit)
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitials}>
                {userProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'PS'}
              </Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userProfile?.full_name || 'User'}</Text>
              <Text style={styles.apartmentInfo}>
                Skyline Apartments • {userProfile?.flat_number || 'A-301'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Search size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
<<<<<<< HEAD

=======
      <View style={styles.containerquick}>
        {/* Quick Actions Row */}
        <Text style={styles.title}>Quick Actions</Text>

        {/* Bill Payment Buttons */}
       
          <View style={styles.billsRow}>
            {billTypes.map((bill) => (
              <TouchableOpacity
                key={bill.id}
                style={styles.billButton}
                onPress={() => handleBillPayment(bill)}
              >
                <Text style={styles.billIcon}>{bill.icon}</Text>
                <Text style={styles.billText}>{bill.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
    

        {/* Pay Charging Button */}
        <TouchableOpacity
          style={styles.chargingButton}
          onPress={handlePayCharging}
        >
          <Text style={styles.chargingIcon}>🔌</Text>
          <Text style={styles.chargingText}>Pay Charging</Text>
        </TouchableOpacity>

        {/* Payment Modal */}
        <Modal visible={paymentModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.paymentModal}>
              <Text style={styles.modalTitle}>Pay {selectedBill?.name} Bill</Text>
              <Text style={styles.amount}>₹{selectedBill?.amount}</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                value={selectedBill?.amount?.toString()}
                keyboardType="numeric"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setPaymentModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.payButton]}
                  onPress={processPayment}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* QR Scanner Modal */}
        <Modal visible={scannerModal} animationType="slide">
          <View style={styles.scannerContainer}>
            {hasPermission === null ? (
              <Text>Requesting camera permission...</Text>
            ) : hasPermission === false ? (
              <Text>No access to camera</Text>
            ) : (
              <CameraView
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <View style={styles.scannerOverlay}>
              <Text style={styles.scannerText}>Scan Charger QR Code</Text>
              <TouchableOpacity
                style={styles.closeScannerButton}
                onPress={() => setScannerModal(false)}
              >
                <Text style={styles.closeScannerText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Charging Modal */}
        <Modal visible={chargingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.chargingModal}>
              <Text style={styles.modalTitle}>Charger Details</Text>

              {chargerDetails && (
                <View style={styles.chargerInfo}>
                  <Text style={styles.detailText}>Apartment: {chargerDetails.apartmentName}</Text>
                  <Text style={styles.detailText}>Serial No: {chargerDetails.serialNo}</Text>
                  <Text style={styles.detailText}>Hourly Rate: ₹{chargerDetails.hourlyRate}</Text>
                  <Text style={styles.detailText}>Capacity: {chargerDetails.capacity}</Text>
                  <Text style={styles.detailText}>Location: {chargerDetails.location}</Text>
                </View>
              )}

              <View style={styles.chargingStatus}>
                <Text style={styles.statusText}>
                  Status: {isCharging ? 'Charging...' : 'Ready to Charge'}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                {!isCharging ? (
                  <>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => setChargingModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.startButton]}
                      onPress={startCharging}
                    >
                      <Text style={styles.startButtonText}>Start Charging</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.button, styles.stopButton]}
                    onPress={stopCharging}
                  >
                    <Text style={styles.stopButtonText}>Stop Charging</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
>>>>>>> c083026 (new commit)
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Entries */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Today's Entries</Text>
          <Card style={styles.entriesCard} elevated>
            {todayEntries.map((entry, index) => (
              <View key={entry.id} style={[styles.entryItem, index < todayEntries.length - 1 && styles.entryBorder]}>
                <View style={styles.entryPhoto}>
                  <Text style={styles.entryPhotoText}>
                    {entry.visitorName.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.visitorName}</Text>
                  <Text style={styles.entryPurpose}>{entry.purpose}</Text>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                </View>
                <View style={[
                  styles.entryStatus,
                  { backgroundColor: entry.status === 'approved' ? Colors.dark.success + '20' : Colors.dark.warning + '20' }
                ]}>
                  <Text style={[
                    styles.entryStatusText,
                    { color: entry.status === 'approved' ? Colors.dark.success : Colors.dark.warning }
                  ]}>
                    {entry.status}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard} elevated>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <CreditCard size={16} color={Colors.dark.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Rent Payment Successful</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <Text style={styles.activityAmount}>₹25,000</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Users size={16} color={Colors.dark.info} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Visitor Approved</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Voice AI Agent Floating Button */}
      <View style={styles.voiceAgentButtonContainer}>
        <Animated.View style={[
          styles.voiceAgentButton,
          animatedVoiceAgentButtonStyle
        ]}>
          <TouchableOpacity
            style={styles.voiceAgentTouchable}
            onPress={handleVoiceAgentPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.secondary]}
              style={styles.voiceAgentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Bot size={32} color={Colors.dark.text} />
<<<<<<< HEAD
              <Sparkles 
                size={16} 
                color={Colors.dark.text} 
=======
              <Sparkles
                size={16}
                color={Colors.dark.text}
>>>>>>> c083026 (new commit)
                style={styles.sparklesIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

<<<<<<< HEAD
      {/* Modals */}
      {renderPaymentModal()}
      {renderChargerModal()}

=======
>>>>>>> c083026 (new commit)
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.dark.text + '80',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  apartmentInfo: {
    fontSize: 12,
    color: Colors.dark.text + '60',
  },
  searchButton: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
<<<<<<< HEAD
  entriesSection: {
    marginTop: 20,
    marginBottom: 24,
  },
=======
>>>>>>> c083026 (new commit)
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
<<<<<<< HEAD
=======
  entriesSection: {
    marginTop: 20,
    marginBottom: 24,
  },
>>>>>>> c083026 (new commit)
  entriesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  entryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  entryPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryPhotoText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  entryPurpose: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  entryTime: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  entryStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  entryStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.success,
  },

  // Voice AI Agent Floating Button
  voiceAgentButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  voiceAgentButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceAgentTouchable: {
    width: '100%',
    height: '100%',
  },
  voiceAgentGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklesIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
<<<<<<< HEAD

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  placeholder: {
    width: 24,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Payment Modal Styles
  billCard: {
    marginBottom: 20,
    padding: 20,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  billAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  billDetails: {
    gap: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  billValue: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  continueButton: {
    marginBottom: 20,
  },
  paymentMethodsCard: {
    marginBottom: 20,
    padding: 20,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  paymentMethodSelected: {
    backgroundColor: Colors.dark.primary + '10',
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    color: Colors.dark.text,
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
  payButton: {
    marginBottom: 20,
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
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  receiptCard: {
    width: '100%',
    padding: 20,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },

  // Vehicle Charger Modal Styles
  scannerContainer: {
    flex: 1,
  },
  scannerCard: {
    marginBottom: 20,
    padding: 20,
  },
  scannerHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 12,
    marginBottom: 8,
  },
  scannerSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  cameraContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.dark.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannerInstructions: {
    color: Colors.dark.text,
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  webCameraFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  webCameraText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  simulateButton: {
    marginTop: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  startScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary + '20',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  startScanText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  chargingContainer: {
    flex: 1,
  },
  chargingCard: {
    marginBottom: 20,
    padding: 20,
  },
  chargingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chargingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chargingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  chargingSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  chargingDetails: {
    gap: 12,
  },
  chargingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chargingLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    minWidth: 80,
  },
  chargingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
    flex: 1,
  },
  costValue: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  detachCard: {
    marginBottom: 20,
    padding: 20,
  },
  detachTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  detachSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  emergencyStop: {
    backgroundColor: Colors.dark.error + '20',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.error,
  },
  emergencyStopText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.error,
=======
  containerquick: {
    padding: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 30,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  billsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  billButton: {
    backgroundColor: Colors.dark.primary + '20',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  billIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  billText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
  },
  chargingButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  chargingIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  chargingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  chargingModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
  },
  chargerInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  chargingStatus: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  payButton: {
    backgroundColor: '#4CAF50',
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#FF9800',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  closeScannerButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginTop: '150%',
  },
  closeScannerText: {
    color: '#fff',
    fontWeight: 'bold',
    
>>>>>>> c083026 (new commit)
  },
});