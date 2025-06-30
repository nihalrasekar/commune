import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Chrome as Home, TrendingUp, Calendar, Users, Plus, Settings, UserCheck, FileText, Shield, Camera, Scan, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, X, FlipHorizontal, QrCode, Upload, Download, CreditCard as Edit, Signature, Clock, IndianRupee, Scale, Building, Phone, Mail, MapPin, User, CreditCard, Star, Award } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Colors } from '@/constants/Colors';

const mockProperties = [
  {
    id: '1',
    title: 'Skyline Apartments 3BHK',
    location: 'Powai, Mumbai',
    status: 'rented',
    rent: 45000,
    tenant: 'Rahul Sharma',
    tenantScore: 85,
    lastPayment: '2024-01-15',
    nextDue: '2024-02-15',
  },
  {
    id: '2',
    title: 'Garden View 2BHK',
    location: 'Bandra West, Mumbai',
    status: 'vacant',
    rent: 35000,
    tenant: null,
    tenantScore: null,
    lastPayment: null,
    nextDue: null,
  },
];

const tenantTools = [
  {
    id: '1',
    name: 'Tenant Onboarding',
    description: 'Complete tenant registration and documentation',
    icon: UserCheck,
    color: Colors.dark.primary,
    features: ['Digital Agreement', 'Document Upload', 'Background Check', 'Reference Verification'],
  },
  {
    id: '2',
    name: 'Person KYC',
    description: 'Identity verification with Aadhaar QR code scanning',
    icon: QrCode,
    color: Colors.dark.secondary,
    features: ['Aadhaar QR Scan', 'XML Data Extraction', 'Document Validation', 'Fraud Detection'],
  },
  {
    id: '3',
    name: 'Credit Check',
    description: 'Comprehensive credit and background verification',
    icon: Shield,
    color: Colors.dark.success,
    features: ['Credit Score', 'Employment Verification', 'Previous Rental History', 'Legal Background'],
  },
  {
    id: '4',
    name: 'Document Manager',
    description: 'Secure document storage and management',
    icon: FileText,
    color: Colors.dark.accent,
    features: ['Digital Storage', 'Document Templates', 'E-Signatures', 'Compliance Tracking'],
  },
  {
    id: '5',
    name: 'Tenant Screening',
    description: 'AI-powered tenant evaluation and scoring',
    icon: Users,
    color: Colors.dark.info,
    features: ['AI Scoring', 'Risk Assessment', 'Behavioral Analysis', 'Recommendation Engine'],
  },
  {
    id: '6',
    name: 'Legal Compliance',
    description: 'E-stamp paper and legal documentation for India',
    icon: Scale,
    color: Colors.dark.warning,
    features: ['E-Stamp Paper', 'Digital Signatures', 'Legal Templates', 'Compliance Check'],
  },
];

// E-Stamp Paper Templates for India
const eStampTemplates = [
  {
    id: '1',
    name: 'Rental Agreement',
    stampValue: 500,
    duration: '11 months',
    description: 'Standard rental agreement with e-stamp paper',
    clauses: [
      'Monthly rent and security deposit terms',
      'Maintenance and utility responsibilities',
      'Notice period and termination clauses',
      'Property usage and subletting restrictions'
    ]
  },
  {
    id: '2',
    name: 'Leave & License Agreement',
    stampValue: 200,
    duration: '11 months',
    description: 'Leave and license agreement for Maharashtra',
    clauses: [
      'License fee and deposit terms',
      'Permitted use of premises',
      'Maintenance obligations',
      'Termination and renewal terms'
    ]
  },
  {
    id: '3',
    name: 'Lease Deed',
    stampValue: 1000,
    duration: '3 years',
    description: 'Long-term lease agreement with registration',
    clauses: [
      'Lease period and renewal options',
      'Rent escalation clauses',
      'Transfer and assignment rights',
      'Registration requirements'
    ]
  }
];

// QR Code XML Processing Functions
const parseAadhaarQRData = (qrData: string) => {
  try {
    // Remove XML declaration and extract the PrintLetterBarcodeData element
    const xmlMatch = qrData.match(/<PrintLetterBarcodeData[^>]*>/);
    if (!xmlMatch) {
      throw new Error('Invalid Aadhaar QR format');
    }

    const xmlElement = xmlMatch[0];
    
    // Extract attributes using regex
    const extractAttribute = (attrName: string) => {
      const regex = new RegExp(`${attrName}="([^"]*)"`, 'i');
      const match = xmlElement.match(regex);
      return match ? match[1] : '';
    };

    const info = {
      uid: extractAttribute('uid'),
      name: extractAttribute('name'),
      gender: extractAttribute('gender'),
      yearOfBirth: extractAttribute('yob'),
      careOf: extractAttribute('co'),
      locality: extractAttribute('loc'),
      vtc: extractAttribute('vtc'),
      postOffice: extractAttribute('po'),
      district: extractAttribute('dist'),
      state: extractAttribute('state'),
      pincode: extractAttribute('pc'),
      isValid: true,
      confidence: 100,
      fraudRisk: 'Low',
      extractedXML: qrData
    };

    // Format the data for display
    const formattedInfo = {
      name: info.name || 'Not available',
      aadhaarNumber: info.uid ? info.uid.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'Not available',
      dateOfBirth: info.yearOfBirth || 'Not available',
      gender: info.gender === 'M' ? 'Male' : info.gender === 'F' ? 'Female' : info.gender || 'Not available',
      address: buildAddress(info),
      fatherName: info.careOf || 'Not available',
      isValid: true,
      confidence: 100,
      fraudRisk: 'Low',
      rawData: info
    };

    return formattedInfo;
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return {
      name: 'Parse Error',
      aadhaarNumber: 'Invalid QR Code',
      dateOfBirth: 'N/A',
      gender: 'N/A',
      address: 'N/A',
      fatherName: 'N/A',
      isValid: false,
      confidence: 0,
      fraudRisk: 'High',
      error: error.message
    };
  }
};

const buildAddress = (info: any) => {
  const addressParts = [];
  
  if (info.locality) addressParts.push(info.locality);
  if (info.vtc) addressParts.push(info.vtc);
  if (info.postOffice) addressParts.push(info.postOffice);
  if (info.district) addressParts.push(info.district);
  if (info.state) addressParts.push(info.state);
  if (info.pincode) addressParts.push(info.pincode);
  
  return addressParts.length > 0 ? addressParts.join(', ') : 'Not available';
};

export default function PropertiesScreen() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedTool, setSelectedTool] = useState<typeof tenantTools[0] | null>(null);
  const [toolModalVisible, setToolModalVisible] = useState(false);
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [onboardingModalVisible, setOnboardingModalVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof eStampTemplates[0] | null>(null);
  const cameraRef = useRef<CameraView>(null);
  
  // Onboarding form state
  const [tenantData, setTenantData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      occupation: '',
      monthlyIncome: '',
      emergencyContact: '',
    },
    addressInfo: {
      currentAddress: '',
      permanentAddress: '',
      previousAddress: '',
      duration: '',
    },
    documents: {
      aadhaar: null,
      pan: null,
      salarySlips: [],
      bankStatements: [],
      references: [],
    },
    agreement: {
      template: null,
      customClauses: '',
      stampValue: 0,
      digitalSignature: false,
    }
  });
  
  const totalRent = mockProperties.reduce((sum, property) => 
    property.status === 'rented' ? sum + property.rent : sum, 0
  );
  
  const occupancyRate = (mockProperties.filter(p => p.status === 'rented').length / mockProperties.length) * 100;

  const handleToolPress = (tool: typeof tenantTools[0]) => {
    setSelectedTool(tool);
    if (tool.id === '1') { // Tenant Onboarding
      setOnboardingModalVisible(true);
      setOnboardingStep(1);
    } else if (tool.id === '2') { // Person KYC
      setKycModalVisible(true);
    } else if (tool.id === '6') { // Legal Compliance
      setLegalModalVisible(true);
    } else {
      setToolModalVisible(true);
    }
  };

  const startQRScanning = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan Aadhaar QR codes.');
        return;
      }
    }
    setCameraVisible(true);
  };

  const handleQRCodeScanned = (data: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const extractedInfo = parseAadhaarQRData(data);
      setScanResult(extractedInfo);
      setCameraVisible(false);
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process the QR code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateQRScan = async () => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock Aadhaar QR XML data
    const mockQRData = `<?xml version="1.0" encoding="UTF-8"?> <PrintLetterBarcodeData uid="387671279825" name="Nihal Anilrao Rasekar" gender="M" yob="1997" co="S/O Anilrao Rasekar" loc="H-No34 Wadi Control Shivaji Nagar Behind Gulshan Petrol Pump" vtc="Nagpur (Urban)" po="Wadi" dist="Nagpur" state="Maharashtra" pc="440023"/>`;
    
    const extractedInfo = parseAadhaarQRData(mockQRData);
    setScanResult(extractedInfo);
    setCameraVisible(false);
    setIsProcessing(false);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Complete onboarding
      Alert.alert('Success', 'Tenant onboarding completed successfully!');
      setOnboardingModalVisible(false);
      setOnboardingStep(1);
    }
  };

  const handleTemplateSelect = (template: typeof eStampTemplates[0]) => {
    setSelectedTemplate(template);
    setTenantData(prev => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        template: template,
        stampValue: template.stampValue
      }
    }));
  };

  const generateEStampAgreement = () => {
    if (!selectedTemplate) return;
    
    Alert.alert(
      'E-Stamp Agreement Generated',
      `${selectedTemplate.name} with stamp value ₹${selectedTemplate.stampValue} has been generated. Digital signature is required to complete the process.`,
      [
        { text: 'Download PDF', onPress: () => {} },
        { text: 'Send for Signature', onPress: () => {} },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const renderCameraModal = () => {
    if (!permission) {
      return (
        <Modal visible={cameraVisible} animationType="slide">
          <View style={styles.cameraContainer}>
            <Text>Loading camera...</Text>
          </View>
        </Modal>
      );
    }

    if (!permission.granted) {
      return (
        <Modal visible={cameraVisible} animationType="slide">
          <SafeAreaView style={styles.cameraContainer}>
            <View style={styles.permissionContainer}>
              <QrCode size={64} color={Colors.dark.textMuted} />
              <Text style={styles.permissionTitle}>Camera Permission Required</Text>
              <Text style={styles.permissionText}>
                We need access to your camera to scan Aadhaar QR codes
              </Text>
              <Button
                title="Grant Permission"
                onPress={requestPermission}
                style={styles.permissionButton}
              />
              <Button
                title="Cancel"
                onPress={() => setCameraVisible(false)}
                variant="outline"
                style={styles.permissionButton}
              />
            </View>
          </SafeAreaView>
        </Modal>
      );
    }

    return (
      <Modal visible={cameraVisible} animationType="slide">
        <SafeAreaView style={styles.cameraContainer}>
          {Platform.OS === 'web' ? (
            // Web fallback UI
            <View style={styles.webCameraFallback}>
              <QrCode size={64} color={Colors.dark.primary} />
              <Text style={styles.webCameraTitle}>QR Scanner Simulation</Text>
              <Text style={styles.webCameraText}>
                On web, we'll simulate the Aadhaar QR code scanning process
              </Text>
              <Button
                title={isProcessing ? "Processing..." : "Simulate QR Scan"}
                onPress={simulateQRScan}
                disabled={isProcessing}
                style={styles.simulateButton}
              />
              <Button
                title="Cancel"
                onPress={() => setCameraVisible(false)}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          ) : (
            // Native camera view with QR scanning
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={({ data }) => handleQRCodeScanned(data)}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => setCameraVisible(false)}
                  >
                    <X size={24} color={Colors.dark.text} />
                  </TouchableOpacity>
                  <Text style={styles.cameraTitle}>Scan Aadhaar QR Code</Text>
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={toggleCameraFacing}
                  >
                    <FlipHorizontal size={24} color={Colors.dark.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.qrScanFrame}>
                  <View style={styles.qrCorner} />
                  <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
                  <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
                  <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
                  
                  <View style={styles.qrCodeIcon}>
                    <QrCode size={32} color={Colors.dark.primary} />
                  </View>
                </View>

                <View style={styles.cameraFooter}>
                  <Text style={styles.instructionText}>
                    Position the QR code within the smaller frame for better accuracy
                  </Text>
                  {isProcessing && (
                    <Text style={styles.processingText}>Processing QR code...</Text>
                  )}
                </View>
              </View>
            </CameraView>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  const renderOnboardingModal = () => {
    return (
      <Modal
        visible={onboardingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOnboardingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setOnboardingModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tenant Onboarding - Step {onboardingStep}/4</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map((step) => (
                <View key={step} style={styles.progressStep}>
                  <View style={[
                    styles.progressCircle,
                    onboardingStep >= step && styles.progressCircleActive
                  ]}>
                    <Text style={[
                      styles.progressText,
                      onboardingStep >= step && styles.progressTextActive
                    ]}>
                      {step}
                    </Text>
                  </View>
                  {step < 4 && (
                    <View style={[
                      styles.progressLine,
                      onboardingStep > step && styles.progressLineActive
                    ]} />
                  )}
                </View>
              ))}
            </View>

            {onboardingStep === 1 && (
              <Card style={styles.formCard}>
                <Text style={styles.stepTitle}>Personal Information</Text>
                <View style={styles.formGroup}>
                  <View style={styles.inputContainer}>
                    <User size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Full Name"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={tenantData.personalInfo.fullName}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: text }
                      }))}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Email Address"
                      placeholderTextColor={Colors.dark.textMuted}
                      keyboardType="email-address"
                      value={tenantData.personalInfo.email}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: text }
                      }))}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Phone size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Phone Number"
                      placeholderTextColor={Colors.dark.textMuted}
                      keyboardType="phone-pad"
                      value={tenantData.personalInfo.phone}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: text }
                      }))}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Calendar size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Date of Birth (DD/MM/YYYY)"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={tenantData.personalInfo.dateOfBirth}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, dateOfBirth: text }
                      }))}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Building size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Occupation"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={tenantData.personalInfo.occupation}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, occupation: text }
                      }))}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <IndianRupee size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Monthly Income"
                      placeholderTextColor={Colors.dark.textMuted}
                      keyboardType="numeric"
                      value={tenantData.personalInfo.monthlyIncome}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, monthlyIncome: text }
                      }))}
                    />
                  </View>
                </View>
              </Card>
            )}

            {onboardingStep === 2 && (
              <Card style={styles.formCard}>
                <Text style={styles.stepTitle}>Address Information</Text>
                <View style={styles.formGroup}>
                  <View style={styles.inputContainer}>
                    <MapPin size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Current Address"
                      placeholderTextColor={Colors.dark.textMuted}
                      multiline
                      value={tenantData.addressInfo.currentAddress}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        addressInfo: { ...prev.addressInfo, currentAddress: text }
                      }))}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <MapPin size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Permanent Address"
                      placeholderTextColor={Colors.dark.textMuted}
                      multiline
                      value={tenantData.addressInfo.permanentAddress}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        addressInfo: { ...prev.addressInfo, permanentAddress: text }
                      }))}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Clock size={20} color={Colors.dark.textMuted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Duration at Current Address"
                      placeholderTextColor={Colors.dark.textMuted}
                      value={tenantData.addressInfo.duration}
                      onChangeText={(text) => setTenantData(prev => ({
                        ...prev,
                        addressInfo: { ...prev.addressInfo, duration: text }
                      }))}
                    />
                  </View>
                </View>
              </Card>
            )}

            {onboardingStep === 3 && (
              <Card style={styles.formCard}>
                <Text style={styles.stepTitle}>Document Upload</Text>
                <View style={styles.documentSection}>
                  <TouchableOpacity style={styles.documentUpload}>
                    <Upload size={24} color={Colors.dark.primary} />
                    <Text style={styles.documentText}>Upload Aadhaar Card</Text>
                    <Text style={styles.documentSubtext}>Front and back images</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.documentUpload}>
                    <Upload size={24} color={Colors.dark.primary} />
                    <Text style={styles.documentText}>Upload PAN Card</Text>
                    <Text style={styles.documentSubtext}>Clear image required</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.documentUpload}>
                    <Upload size={24} color={Colors.dark.primary} />
                    <Text style={styles.documentText}>Salary Slips</Text>
                    <Text style={styles.documentSubtext}>Last 3 months</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.documentUpload}>
                    <Upload size={24} color={Colors.dark.primary} />
                    <Text style={styles.documentText}>Bank Statements</Text>
                    <Text style={styles.documentSubtext}>Last 6 months</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            {onboardingStep === 4 && (
              <Card style={styles.formCard}>
                <Text style={styles.stepTitle}>Agreement & Verification</Text>
                <View style={styles.agreementSection}>
                  <View style={styles.agreementItem}>
                    <CheckCircle size={20} color={Colors.dark.success} />
                    <Text style={styles.agreementText}>Personal information verified</Text>
                  </View>
                  <View style={styles.agreementItem}>
                    <CheckCircle size={20} color={Colors.dark.success} />
                    <Text style={styles.agreementText}>Documents uploaded successfully</Text>
                  </View>
                  <View style={styles.agreementItem}>
                    <CheckCircle size={20} color={Colors.dark.success} />
                    <Text style={styles.agreementText}>Background verification completed</Text>
                  </View>
                  <View style={styles.agreementItem}>
                    <Clock size={20} color={Colors.dark.warning} />
                    <Text style={styles.agreementText}>Rental agreement pending</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.generateAgreementButton}
                  onPress={() => {
                    setOnboardingModalVisible(false);
                    setLegalModalVisible(true);
                  }}
                >
                  <Scale size={20} color={Colors.dark.text} />
                  <Text style={styles.generateAgreementText}>Generate Rental Agreement</Text>
                </TouchableOpacity>
              </Card>
            )}

            <Button
              title={onboardingStep === 4 ? "Complete Onboarding" : "Next Step"}
              onPress={handleOnboardingNext}
              style={styles.nextButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderLegalModal = () => {
    return (
      <Modal
        visible={legalModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setLegalModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Legal Compliance - E-Stamp Paper</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.legalInfoCard} elevated>
              <View style={styles.legalHeader}>
                <Scale size={32} color={Colors.dark.warning} />
                <Text style={styles.legalTitle}>Indian E-Stamp Paper System</Text>
                <Text style={styles.legalSubtitle}>
                  Digital stamp papers with legal validity as per Indian Stamp Act
                </Text>
              </View>
            </Card>

            <Card style={styles.templatesCard}>
              <Text style={styles.templatesTitle}>Select Agreement Template</Text>
              {eStampTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateItem,
                    selectedTemplate?.id === template.id && styles.templateItemSelected
                  ]}
                  onPress={() => handleTemplateSelect(template)}
                >
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <View style={styles.stampValueBadge}>
                      <IndianRupee size={12} color={Colors.dark.warning} />
                      <Text style={styles.stampValue}>{template.stampValue}</Text>
                    </View>
                  </View>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                  <Text style={styles.templateDuration}>Duration: {template.duration}</Text>
                  
                  <View style={styles.clausesContainer}>
                    <Text style={styles.clausesTitle}>Key Clauses:</Text>
                    {template.clauses.map((clause, index) => (
                      <Text key={index} style={styles.clauseItem}>• {clause}</Text>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>

            {selectedTemplate && (
              <Card style={styles.customizationCard}>
                <Text style={styles.customizationTitle}>Agreement Customization</Text>
                <TextInput
                  style={styles.customClausesInput}
                  placeholder="Add custom clauses or modifications..."
                  placeholderTextColor={Colors.dark.textMuted}
                  multiline
                  numberOfLines={6}
                  value={tenantData.agreement.customClauses}
                  onChangeText={(text) => setTenantData(prev => ({
                    ...prev,
                    agreement: { ...prev.agreement, customClauses: text }
                  }))}
                />
                
                <View style={styles.signatureSection}>
                  <Text style={styles.signatureTitle}>Digital Signature</Text>
                  <TouchableOpacity style={styles.signatureOption}>
                    <Signature size={20} color={Colors.dark.primary} />
                    <Text style={styles.signatureText}>Enable Digital Signature</Text>
                  </TouchableOpacity>
                  <Text style={styles.signatureNote}>
                    Digital signatures are legally valid under IT Act 2000
                  </Text>
                </View>
              </Card>
            )}

            {selectedTemplate && (
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Agreement Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Template:</Text>
                  <Text style={styles.summaryValue}>{selectedTemplate.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Stamp Value:</Text>
                  <Text style={styles.summaryValue}>₹{selectedTemplate.stampValue}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration:</Text>
                  <Text style={styles.summaryValue}>{selectedTemplate.duration}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Digital Signature:</Text>
                  <Text style={styles.summaryValue}>Required</Text>
                </View>
                
                <Button
                  title="Generate E-Stamp Agreement"
                  onPress={generateEStampAgreement}
                  style={styles.generateButton}
                />
              </Card>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderToolModal = () => {
    if (!selectedTool) return null;

    const IconComponent = selectedTool.icon;

    return (
      <Modal
        visible={toolModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setToolModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setToolModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedTool.name}</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.toolDetailsCard} elevated>
              <View style={styles.toolHeader}>
                <View style={[styles.toolIcon, { backgroundColor: selectedTool.color + '20' }]}>
                  <IconComponent size={32} color={selectedTool.color} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolName}>{selectedTool.name}</Text>
                  <Text style={styles.toolDescription}>{selectedTool.description}</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Key Features</Text>
              <View style={styles.featuresList}>
                {selectedTool.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.dark.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>Get Started</Text>
              <Text style={styles.actionDescription}>
                This tool will help you streamline your tenant management process and ensure compliance with all requirements.
              </Text>
              <Button
                title={`Start ${selectedTool.name}`}
                onPress={() => {
                  setToolModalVisible(false);
                  Alert.alert('Coming Soon', `${selectedTool.name} will be available in the next update!`);
                }}
                style={styles.startButton}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderKYCModal = () => {
    return (
      <Modal
        visible={kycModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setKycModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setKycModalVisible(false);
                setScanResult(null);
                setCameraVisible(false);
              }}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Person KYC - Aadhaar QR Verification</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {!scanResult ? (
              <>
                <Card style={styles.scanCard} elevated>
                  <View style={styles.scanHeader}>
                    <QrCode size={48} color={Colors.dark.secondary} />
                    <Text style={styles.scanTitle}>Scan Aadhaar QR Code</Text>
                    <Text style={styles.scanDescription}>
                      Use our QR scanner to extract authentic information from Aadhaar card QR code
                    </Text>
                  </View>
                  
                  <View style={styles.scanFeatures}>
                    <View style={styles.scanFeature}>
                      <CheckCircle size={16} color={Colors.dark.success} />
                      <Text style={styles.scanFeatureText}>Real-time QR code scanning</Text>
                    </View>
                    <View style={styles.scanFeature}>
                      <CheckCircle size={16} color={Colors.dark.success} />
                      <Text style={styles.scanFeatureText}>XML data extraction</Text>
                    </View>
                    <View style={styles.scanFeature}>
                      <CheckCircle size={16} color={Colors.dark.success} />
                      <Text style={styles.scanFeatureText}>Government verified data</Text>
                    </View>
                    <View style={styles.scanFeature}>
                      <CheckCircle size={16} color={Colors.dark.success} />
                      <Text style={styles.scanFeatureText}>Secure data processing</Text>
                    </View>
                  </View>

                  <Button
                    title="Start QR Code Scan"
                    onPress={startQRScanning}
                    style={styles.scanButton}
                  />
                </Card>

                <Card style={styles.instructionsCard}>
                  <Text style={styles.instructionsTitle}>Scanning Instructions</Text>
                  <View style={styles.instructionsList}>
                    <Text style={styles.instructionItem}>1. Ensure good lighting conditions</Text>
                    <Text style={styles.instructionItem}>2. Turn the Aadhaar card to the back side</Text>
                    <Text style={styles.instructionItem}>3. Locate the QR code at the bottom</Text>
                    <Text style={styles.instructionItem}>4. Keep the QR code within the smaller frame</Text>
                    <Text style={styles.instructionItem}>5. Hold the device steady during scan</Text>
                  </View>
                </Card>
              </>
            ) : (
              <>
                <Card style={styles.resultCard} elevated>
                  <View style={styles.resultHeader}>
                    <View style={[
                      styles.resultIcon,
                      { backgroundColor: scanResult.isValid ? Colors.dark.success + '20' : Colors.dark.error + '20' }
                    ]}>
                      {scanResult.isValid ? (
                        <CheckCircle size={32} color={Colors.dark.success} />
                      ) : (
                        <AlertTriangle size={32} color={Colors.dark.error} />
                      )}
                    </View>
                    <Text style={styles.resultTitle}>
                      {scanResult.isValid ? 'QR Code Verified Successfully' : 'QR Code Verification Failed'}
                    </Text>
                    <Text style={styles.resultSubtitle}>
                      Confidence: {scanResult.confidence}% | Risk: {scanResult.fraudRisk}
                    </Text>
                  </View>
                </Card>

                <Card style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>Extracted Information</Text>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Full Name</Text>
                      <Text style={styles.detailValue}>{scanResult.name}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Aadhaar Number</Text>
                      <Text style={styles.detailValue}>{scanResult.aadhaarNumber}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Year of Birth</Text>
                      <Text style={styles.detailValue}>{scanResult.dateOfBirth}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Gender</Text>
                      <Text style={styles.detailValue}>{scanResult.gender}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Care Of (Father/Husband)</Text>
                      <Text style={styles.detailValue}>{scanResult.fatherName}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailValue}>{scanResult.address}</Text>
                    </View>
                  </View>
                </Card>

                <Card style={styles.verificationCard}>
                  <Text style={styles.verificationTitle}>Verification Status</Text>
                  <View style={styles.verificationGrid}>
                    <View style={styles.verificationItem}>
                      <Text style={styles.verificationLabel}>QR Code Authenticity</Text>
                      <Text style={[
                        styles.verificationValue,
                        { color: scanResult.isValid ? Colors.dark.success : Colors.dark.error }
                      ]}>
                        {scanResult.isValid ? 'Verified' : 'Failed'}
                      </Text>
                    </View>
                    <View style={styles.verificationItem}>
                      <Text style={styles.verificationLabel}>Data Confidence</Text>
                      <Text style={styles.verificationValue}>{scanResult.confidence}%</Text>
                    </View>
                    <View style={styles.verificationItem}>
                      <Text style={styles.verificationLabel}>Fraud Risk</Text>
                      <Text style={[
                        styles.verificationValue,
                        { 
                          color: scanResult.fraudRisk === 'Low' ? Colors.dark.success : 
                                scanResult.fraudRisk === 'Medium' ? Colors.dark.warning : Colors.dark.error 
                        }
                      ]}>
                        {scanResult.fraudRisk}
                      </Text>
                    </View>
                  </View>
                </Card>

                <View style={styles.actionButtons}>
                  <Button
                    title="Scan Another"
                    onPress={() => setScanResult(null)}
                    variant="outline"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Save & Continue"
                    onPress={() => {
                      setKycModalVisible(false);
                      setScanResult(null);
                      Alert.alert('Success', 'KYC information has been saved successfully!');
                    }}
                    style={styles.actionButton}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Good morning!</Text>
            <Text style={styles.headerTitle}>Property Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard} elevated>
              <View style={styles.statContent}>
                <TrendingUp size={24} color={Colors.dark.success} />
                <Text style={styles.statValue}>₹{totalRent.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Monthly Revenue</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard} elevated>
              <View style={styles.statContent}>
                <Home size={24} color={Colors.dark.primary} />
                <Text style={styles.statValue}>{mockProperties.length}</Text>
                <Text style={styles.statLabel}>Total Properties</Text>
              </View>
            </Card>
          </View>
          
          <Card style={styles.occupancyCard} elevated>
            <View style={styles.occupancyContent}>
              <CircularProgress
                progress={occupancyRate}
                size={100}
                strokeWidth={8}
                color={Colors.dark.success}
                title="Occupancy"
                subtitle="Rate"
              />
              <View style={styles.occupancyDetails}>
                <Text style={styles.occupancyTitle}>Property Occupancy</Text>
                <Text style={styles.occupancySubtitle}>
                  {mockProperties.filter(p => p.status === 'rented').length} of {mockProperties.length} properties rented
                </Text>
                <Text style={styles.occupancyTrend}>↗ 5% increase from last month</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Tenant Management Tools */}
        <View style={styles.toolsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tenant Management Tools</Text>
            <Text style={styles.sectionSubtitle}>Streamline your tenant onboarding and verification</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.toolsScroll}
            contentContainerStyle={styles.toolsContainer}
          >
            {tenantTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <TouchableOpacity 
                  key={tool.id} 
                  style={styles.toolCard}
                  onPress={() => handleToolPress(tool)}
                >
                  <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '20' }]}>
                    <IconComponent size={24} color={tool.color} />
                  </View>
                  <Text style={styles.toolCardName}>{tool.name}</Text>
                  <Text style={styles.toolCardDescription}>{tool.description}</Text>
                  <View style={styles.toolCardFooter}>
                    <Text style={[styles.toolCardAction, { color: tool.color }]}>
                      Get Started →
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Navigation */}


        {/* Properties List */}
        <View style={styles.propertiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Properties</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={Colors.dark.primary} />
            </TouchableOpacity>
          </View>
          
          {mockProperties.map((property) => (
            <Card key={property.id} style={styles.propertyCard} elevated>
              <View style={styles.propertyHeader}>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>
                  <Text style={styles.propertyLocation}>{property.location}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: property.status === 'rented' ? Colors.dark.success + '20' : Colors.dark.warning + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: property.status === 'rented' ? Colors.dark.success : Colors.dark.warning }
                  ]}>
                    {property.status === 'rented' ? 'Rented' : 'Vacant'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.propertyDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monthly Rent</Text>
                  <Text style={styles.detailValue}>₹{property.rent.toLocaleString()}</Text>
                </View>
                
                {property.status === 'rented' && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tenant</Text>
                      <Text style={styles.detailValue}>{property.tenant}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tenant Score</Text>
                      <Text style={[
                        styles.detailValue,
                        { color: property.tenantScore >= 80 ? Colors.dark.success : Colors.dark.warning }
                      ]}>
                        {property.tenantScore}/100
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Next Due</Text>
                      <Text style={styles.detailValue}>{property.nextDue}</Text>
                    </View>
                  </>
                )}
              </View>
              
              <View style={styles.propertyActions}>
                <Button
                  title={property.status === 'rented' ? 'View Tenant' : 'Find Tenant'}
                  onPress={() => {}}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Manage"
                  onPress={() => {}}
                  size="small"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          ))}
        </View>

       
 
      </ScrollView>

      {/* Modals */}
      {renderToolModal()}
      {renderKYCModal()}
      {renderOnboardingModal()}
      {renderLegalModal()}
      {renderCameraModal()}
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
  headerGreeting: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  occupancyCard: {
    padding: 20,
  },
  occupancyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  occupancyDetails: {
    flex: 1,
  },
  occupancyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  occupancySubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  occupancyTrend: {
    fontSize: 12,
    color: Colors.dark.success,
    fontWeight: '500',
  },

  // Tenant Tools Section
  toolsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  toolsScroll: {
    paddingVertical: 4,
  },
  toolsContainer: {
    paddingRight: 20,
  },
  toolCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 6,
  },
  toolCardDescription: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  toolCardFooter: {
    marginTop: 'auto',
  },
  toolCardAction: {
    fontSize: 13,
    fontWeight: '600',
  },

  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.dark.text,
  },
  propertiesSection: {
    marginBottom: 24,
  },
  addButton: {
    padding: 8,
  },
  propertyCard: {
    marginBottom: 16,
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertyDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  propertyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  quickActionsCard: {
    marginBottom: 24,
    padding: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

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
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  toolDetailsCard: {
    marginBottom: 20,
    padding: 20,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toolIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  featuresCard: {
    marginBottom: 20,
    padding: 20,
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  actionCard: {
    marginBottom: 20,
    padding: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  startButton: {
    marginTop: 8,
  },

  // Onboarding Modal Styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  progressTextActive: {
    color: Colors.dark.text,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.dark.primary,
  },
  formCard: {
    marginBottom: 20,
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  formGroup: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  textInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  documentSection: {
    gap: 12,
  },
  documentUpload: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  documentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 8,
  },
  documentSubtext: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  agreementSection: {
    gap: 12,
    marginBottom: 20,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  agreementText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  generateAgreementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.warning + '20',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.warning,
  },
  generateAgreementText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  nextButton: {
    marginBottom: 20,
  },

  // Legal Modal Styles
  legalInfoCard: {
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
  },
  legalHeader: {
    alignItems: 'center',
  },
  legalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  legalSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  templatesCard: {
    marginBottom: 20,
    padding: 20,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  templateItem: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  templateItemSelected: {
    borderColor: Colors.dark.warning,
    backgroundColor: Colors.dark.warning + '10',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  stampValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  stampValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.warning,
  },
  templateDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  templateDuration: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginBottom: 12,
  },
  clausesContainer: {
    marginTop: 8,
  },
  clausesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  clauseItem: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  customizationCard: {
    marginBottom: 20,
    padding: 20,
  },
  customizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  customClausesInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  signatureSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  signatureOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  signatureText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  signatureNote: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  summaryCard: {
    marginBottom: 20,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  generateButton: {
    marginTop: 16,
  },

  // KYC Modal Styles
  scanCard: {
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
  },
  scanHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  scanDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanFeatures: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  scanFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanFeatureText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  scanButton: {
    width: '100%',
  },
  instructionsCard: {
    marginBottom: 20,
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  resultCard: {
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  detailsCard: {
    marginBottom: 20,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  verificationCard: {
    marginBottom: 20,
    padding: 20,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  verificationGrid: {
    gap: 16,
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  verificationLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  verificationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  // Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    width: '100%',
    marginBottom: 12,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  qrScanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 80, // Smaller frame for better adjustment
  },
  qrCorner: {
    position: 'absolute',
    width: 30, // Smaller corners
    height: 30,
    borderColor: Colors.dark.primary,
    borderWidth: 4,
    top: -15,
    left: -15,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  qrCornerTopRight: {
    top: -15,
    right: -15,
    left: 'auto',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 4,
  },
  qrCornerBottomLeft: {
    bottom: -15,
    top: 'auto',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 4,
  },
  qrCornerBottomRight: {
    bottom: -15,
    right: -15,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  qrCodeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12, // Smaller icon
  },
  cameraFooter: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  processingText: {
    fontSize: 14,
    color: Colors.dark.primary,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Web Camera Fallback
  webCameraFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webCameraTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  webCameraText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  simulateButton: {
    width: '100%',
    marginBottom: 12,
  },
  cancelButton: {
    width: '100%',
  },
});