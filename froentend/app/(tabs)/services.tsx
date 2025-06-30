import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Zap, Scissors, Car, ShoppingCart, Hammer, Wrench, Paintbrush as Paintbrush2, Shirt, Utensils, Truck, Shield, Wifi, Star, Clock, MapPin, Phone, X, Calendar, User, CreditCard, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';

const serviceCategories = [
  { id: 'all', name: 'All Services', icon: Wrench, color: Colors.dark.primary },
  { id: 'home', name: 'Home Repair', icon: Hammer, color: Colors.dark.secondary },
  { id: 'beauty', name: 'Beauty & Care', icon: Scissors, color: Colors.dark.accent },
  { id: 'auto', name: 'Auto Services', icon: Car, color: Colors.dark.success },
  { id: 'delivery', name: 'Delivery', icon: Truck, color: Colors.dark.warning },
];

const featuredServices = [
  {
    id: '1',
    name: 'Electrician',
    category: 'home',
    icon: Zap,
    description: 'Electrical repairs, wiring, and installations',
    price: '₹300/hour',
    rating: 4.8,
    reviews: 245,
    availability: 'Available Now',
    provider: 'PowerFix Solutions',
    image: 'https://images.pexels.com/photos/8985441/pexels-photo-8985441.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Emergency Service', 'Licensed', '24/7'],
    color: Colors.dark.warning,
    phone: '+91 98765 43210',
    minBookingHours: 2,
  },
  {
    id: '2',
    name: 'Beautician',
    category: 'beauty',
    icon: Scissors,
    description: 'Hair styling, makeup, and beauty treatments',
    price: '₹800/session',
    rating: 4.9,
    reviews: 189,
    availability: 'Book Appointment',
    provider: 'Glamour Studio',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Certified', 'Home Service', 'Premium'],
    color: Colors.dark.accent,
    phone: '+91 98765 43211',
    minBookingHours: 1,
  },
  {
    id: '3',
    name: 'Car Washing',
    category: 'auto',
    icon: Car,
    description: 'Professional car cleaning and detailing',
    price: '₹500/wash',
    rating: 4.7,
    reviews: 156,
    availability: 'Same Day',
    provider: 'Shine Auto Care',
    image: 'https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Eco-Friendly', 'Doorstep', 'Insured'],
    color: Colors.dark.info,
    phone: '+91 98765 43212',
    minBookingHours: 1,
  },
  {
    id: '4',
    name: 'Grocery Delivery',
    category: 'delivery',
    icon: ShoppingCart,
    description: 'Fresh groceries delivered to your doorstep',
    price: '₹50 delivery',
    rating: 4.6,
    reviews: 892,
    availability: '30 min delivery',
    provider: 'FreshMart Express',
    image: 'https://images.pexels.com/photos/4199098/pexels-photo-4199098.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Fresh', 'Fast Delivery', 'Quality'],
    color: Colors.dark.success,
    phone: '+91 98765 43213',
    minBookingHours: 1,
  },
  {
    id: '5',
    name: 'Carpenter',
    category: 'home',
    icon: Hammer,
    description: 'Furniture repair, custom woodwork, and installations',
    price: '₹400/hour',
    rating: 4.8,
    reviews: 134,
    availability: 'Next Day',
    provider: 'WoodCraft Masters',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Experienced', 'Custom Work', 'Warranty'],
    color: Colors.dark.secondary,
    phone: '+91 98765 43214',
    minBookingHours: 2,
  },
  {
    id: '6',
    name: 'House Painter',
    category: 'home',
    icon: Paintbrush2,
    description: 'Interior and exterior painting services',
    price: '₹25/sq ft',
    rating: 4.7,
    reviews: 98,
    availability: 'Free Estimate',
    provider: 'ColorPro Painters',
    image: 'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Premium Paint', 'Clean Work', 'Guaranteed'],
    color: Colors.dark.primary,
    phone: '+91 98765 43215',
    minBookingHours: 4,
  },
  {
    id: '7',
    name: 'Laundry Service',
    category: 'delivery',
    icon: Shirt,
    description: 'Pickup, wash, dry, and delivery service',
    price: '₹8/piece',
    rating: 4.5,
    reviews: 267,
    availability: '24 hour service',
    provider: 'CleanPress Co.',
    image: 'https://images.pexels.com/photos/6197119/pexels-photo-6197119.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Pickup & Drop', 'Eco-Wash', 'Express'],
    color: Colors.dark.info,
    phone: '+91 98765 43216',
    minBookingHours: 1,
  },
  {
    id: '8',
    name: 'Food Delivery',
    category: 'delivery',
    icon: Utensils,
    description: 'Hot meals from your favorite restaurants',
    price: '₹30 delivery',
    rating: 4.4,
    reviews: 1245,
    availability: 'Live Tracking',
    provider: 'QuickBite',
    image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=400',
    tags: ['Hot & Fresh', 'Multiple Cuisines', 'Fast'],
    color: Colors.dark.error,
    phone: '+91 98765 43217',
    minBookingHours: 1,
  },
];

const quickServices = [
  { id: '1', name: 'Emergency Plumber', icon: Wrench, color: Colors.dark.error },
  { id: '2', name: 'WiFi Repair', icon: Wifi, color: Colors.dark.info },
  { id: '3', name: 'Security Guard', icon: Shield, color: Colors.dark.success },
  { id: '4', name: 'Moving Service', icon: Truck, color: Colors.dark.warning },
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

export default function ServicesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof featuredServices[0] | null>(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const filteredServices = featuredServices.filter(service => 
    (selectedCategory === 'all' || service.category === selectedCategory) &&
    (searchQuery === '' || service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBookNow = (service: typeof featuredServices[0]) => {
    setSelectedService(service);
    setBookingModalVisible(true);
    setBookingStep(1);
    setBookingConfirmed(false);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleBookingConfirm = () => {
    setBookingConfirmed(true);
    setBookingStep(3);
    // Simulate booking process
    setTimeout(() => {
      setBookingModalVisible(false);
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setSpecialRequests('');
      setSelectedTime('');
    }, 3000);
  };

  const renderBookingModal = () => {
    if (!selectedService) return null;

    const IconComponent = selectedService.icon;

    return (
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setBookingModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {bookingStep === 1 ? 'Book Service' : 
               bookingStep === 2 ? 'Payment Details' : 'Booking Confirmed'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {bookingStep === 1 && (
              <>
                {/* Service Details */}
                <Card style={styles.serviceDetailsCard} elevated>
                  <View style={styles.serviceHeader}>
                    <View style={[styles.serviceIcon, { backgroundColor: selectedService.color + '20' }]}>
                      <IconComponent size={24} color={selectedService.color} />
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{selectedService.name}</Text>
                      <Text style={styles.serviceProvider}>{selectedService.provider}</Text>
                      <Text style={styles.servicePrice}>{selectedService.price}</Text>
                    </View>
                  </View>
                </Card>

                {/* Date Selection */}
                <Card style={styles.formCard}>
                  <Text style={styles.formLabel}>Select Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={selectedDate}
                    onChangeText={setSelectedDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.dark.textMuted}
                  />
                </Card>

                {/* Time Selection */}
                <Card style={styles.formCard}>
                  <Text style={styles.formLabel}>Select Time Slot</Text>
                  <View style={styles.timeSlots}>
                    {timeSlots.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlot,
                          selectedTime === time && styles.timeSlotSelected
                        ]}
                        onPress={() => setSelectedTime(time)}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          selectedTime === time && styles.timeSlotTextSelected
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>

                {/* Customer Details */}
                <Card style={styles.formCard}>
                  <Text style={styles.formLabel}>Customer Details</Text>
                  <View style={styles.formGroup}>
                    <View style={styles.inputContainer}>
                      <User size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.textInput}
                        value={customerName}
                        onChangeText={setCustomerName}
                        placeholder="Full Name"
                        placeholderTextColor={Colors.dark.textMuted}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Phone size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.textInput}
                        value={customerPhone}
                        onChangeText={setCustomerPhone}
                        placeholder="Phone Number"
                        placeholderTextColor={Colors.dark.textMuted}
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <MapPin size={20} color={Colors.dark.textMuted} />
                      <TextInput
                        style={styles.textInput}
                        value={customerAddress}
                        onChangeText={setCustomerAddress}
                        placeholder="Service Address"
                        placeholderTextColor={Colors.dark.textMuted}
                        multiline
                      />
                    </View>
                  </View>
                </Card>

                {/* Special Requests */}
                <Card style={styles.formCard}>
                  <Text style={styles.formLabel}>Special Requests (Optional)</Text>
                  <TextInput
                    style={styles.textArea}
                    value={specialRequests}
                    onChangeText={setSpecialRequests}
                    placeholder="Any specific requirements or instructions..."
                    placeholderTextColor={Colors.dark.textMuted}
                    multiline
                    numberOfLines={4}
                  />
                </Card>

                {/* Continue Button */}
                <Button
                  title="Continue to Payment"
                  onPress={() => setBookingStep(2)}
                  disabled={!selectedDate || !selectedTime || !customerName || !customerPhone || !customerAddress}
                  style={styles.continueButton}
                />
              </>
            )}

            {bookingStep === 2 && (
              <>
                {/* Booking Summary */}
                <Card style={styles.summaryCard} elevated>
                  <Text style={styles.summaryTitle}>Booking Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service:</Text>
                    <Text style={styles.summaryValue}>{selectedService.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Provider:</Text>
                    <Text style={styles.summaryValue}>{selectedService.provider}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date:</Text>
                    <Text style={styles.summaryValue}>{selectedDate}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time:</Text>
                    <Text style={styles.summaryValue}>{selectedTime}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Customer:</Text>
                    <Text style={styles.summaryValue}>{customerName}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>{selectedService.price}</Text>
                  </View>
                </Card>

                {/* Payment Method */}
                <Card style={styles.formCard}>
                  <Text style={styles.formLabel}>Payment Method</Text>
                  <View style={styles.paymentMethods}>
                    <TouchableOpacity style={styles.paymentMethod}>
                      <CreditCard size={20} color={Colors.dark.primary} />
                      <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.paymentMethod}>
                      <Phone size={20} color={Colors.dark.success} />
                      <Text style={styles.paymentMethodText}>UPI Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.paymentMethod}>
                      <Truck size={20} color={Colors.dark.warning} />
                      <Text style={styles.paymentMethodText}>Cash on Service</Text>
                    </TouchableOpacity>
                  </View>
                </Card>

                {/* Confirm Booking Button */}
                <Button
                  title="Confirm Booking"
                  onPress={handleBookingConfirm}
                  style={styles.confirmButton}
                />
              </>
            )}

            {bookingStep === 3 && (
              <View style={styles.confirmationContainer}>
                <View style={styles.successIcon}>
                  <CheckCircle size={64} color={Colors.dark.success} />
                </View>
                <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
                <Text style={styles.confirmationMessage}>
                  Your service has been booked successfully. The service provider will contact you shortly.
                </Text>
                
                <Card style={styles.bookingDetailsCard} elevated>
                  <Text style={styles.bookingId}>Booking ID: #BK{Date.now().toString().slice(-6)}</Text>
                  <View style={styles.confirmationDetails}>
                    <Text style={styles.confirmationDetail}>{selectedService.name}</Text>
                    <Text style={styles.confirmationDetail}>{selectedDate} at {selectedTime}</Text>
                    <Text style={styles.confirmationDetail}>Provider: {selectedService.provider}</Text>
                    <Text style={styles.confirmationDetail}>Contact: {selectedService.phone}</Text>
                  </View>
                </Card>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderServiceCard = (service: typeof featuredServices[0]) => {
    const IconComponent = service.icon;
    
    return (
      <Card key={service.id} style={styles.serviceCard} elevated>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceImageContainer}>
            <View style={[styles.serviceIconOverlay, { backgroundColor: service.color + '20' }]}>
              <IconComponent size={24} color={service.color} />
            </View>
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceProvider}>{service.provider}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color={Colors.dark.warning} fill={Colors.dark.warning} />
              <Text style={styles.rating}>{service.rating}</Text>
              <Text style={styles.reviews}>({service.reviews})</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{service.price}</Text>
            <View style={[styles.availabilityBadge, { backgroundColor: service.color + '20' }]}>
              <Text style={[styles.availabilityText, { color: service.color }]}>
                {service.availability}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.serviceDescription}>{service.description}</Text>

        <View style={styles.tagsContainer}>
          {service.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.serviceActions}>
          <TouchableOpacity style={styles.contactButton}>
            <Phone size={16} color={Colors.dark.primary} />
            <Text style={styles.contactText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton}>
            <MapPin size={16} color={Colors.dark.textMuted} />
            <Text style={styles.locationText}>Location</Text>
          </TouchableOpacity>
          <Button
            title="Book Now"
            onPress={() => handleBookNow(service)}
            size="small"
            style={styles.bookButton}
          />
        </View>
      </Card>
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
            <Text style={styles.headerTitle}>Home Services</Text>
            <Text style={styles.headerSubtitle}>Professional services at your doorstep</Text>
          </View>
          
        </View>
        
        {/* Search Bar */}
   
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Services */}
        <View style={styles.quickServicesSection}>
          <Text style={styles.sectionTitle}>Emergency Services</Text>
          <View style={styles.quickServicesGrid}>
            {quickServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <TouchableOpacity key={service.id} style={styles.quickServiceCard}>
                  <View style={[styles.quickServiceIcon, { backgroundColor: service.color + '20' }]}>
                    <IconComponent size={20} color={service.color} />
                  </View>
                  <Text style={styles.quickServiceName}>{service.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {serviceCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive,
                    selectedCategory === category.id && { borderColor: category.color }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <IconComponent 
                    size={16} 
                    color={selectedCategory === category.id ? category.color : Colors.dark.textMuted} 
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive,
                    selectedCategory === category.id && { color: category.color }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Service Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>500+</Text>
              <Text style={styles.statLabel}>Service Providers</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>4.8★</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Support Available</Text>
            </Card>
          </View>
        </View>

        {/* Featured Services */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Services' : 
               serviceCategories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredServices.length} services available
            </Text>
          </View>
          
          {filteredServices.map(renderServiceCard)}
        </View>

        {/* Promotional Banner */}
        <Card style={styles.promoCard} elevated>
          <LinearGradient
            colors={[Colors.dark.success + '20', Colors.dark.success + '10']}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>First Time User?</Text>
              <Text style={styles.promoText}>Get 20% off on your first service booking</Text>
              <Button
                title="Claim Offer"
                onPress={() => {}}
                size="small"
                style={styles.promoButton}
              />
            </View>
            <View style={styles.promoIcon}>
              <Star size={32} color={Colors.dark.success} />
            </View>
          </LinearGradient>
        </Card>
      </ScrollView>

      {/* Booking Modal */}
      {renderBookingModal()}
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    marginTop: 4,
  },
  filterButton: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickServicesSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  quickServicesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickServiceCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickServiceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickServiceName: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 2,
  },
  categoryChipText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  servicesSection: {
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
  serviceCard: {
    marginBottom: 16,
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  serviceImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.dark.border,
    position: 'relative',
    overflow: 'hidden',
  },
  serviceIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  serviceProvider: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  reviews: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: '500',
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  contactText: {
    fontSize: 13,
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: '500',
  },
  bookButton: {
    flex: 1,
  },
  promoCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  promoText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  promoButton: {
    alignSelf: 'flex-start',
  },
  promoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
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
  serviceDetailsCard: {
    marginBottom: 20,
    padding: 16,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    marginBottom: 20,
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  dateInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  timeSlotSelected: {
    backgroundColor: Colors.dark.primary + '20',
    borderColor: Colors.dark.primary,
  },
  timeSlotText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: Colors.dark.primary,
    fontWeight: '600',
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
  textArea: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  continueButton: {
    marginBottom: 20,
  },
  summaryCard: {
    marginBottom: 20,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
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
  paymentMethodText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  confirmButton: {
    marginBottom: 20,
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  confirmationMessage: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  bookingDetailsCard: {
    width: '100%',
    padding: 20,
  },
  bookingId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationDetails: {
    gap: 8,
  },
  confirmationDetail: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});