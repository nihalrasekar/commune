<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState, Suspense, useEffect, useRef } from 'react';
>>>>>>> c083026 (new commit)
import { 
  View, 
  Text, 
  StyleSheet, 
<<<<<<< HEAD
  TouchableOpacity, 
  TextInput,
  ScrollView, 
  Animated, 
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
=======
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
>>>>>>> c083026 (new commit)
import { 
  MapPin, 
  Heart,
  Star,
  Bed,
  Bath,
  Square,
  Phone,
  Wind,
  Search,
  X,
  Map,
  List,
  MessageCircle,
  Bot,
  Send,
  ArrowLeft,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { socketClient } from '@/lib/socket';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  aqi?: number;
  ownerContact?: string;
  type: 'rent' | 'buy';
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export default function SearchScreen() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAreas, setFilteredAreas] = useState<string[]>([]);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  
  // Voice AI Agent States
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI real estate assistant. I can help you find the perfect property based on your lifestyle, budget, and preferences. What kind of home are you looking for?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [filters, setFilters] = useState({
    city: 'bangalore',
    area: 'any',
    type: 'rent' as 'rent' | 'buy',
    bedrooms: 'any',
    budget: 'any',
  });

  // Animation for voice button
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize session when voice agent is opened
  useEffect(() => {
    if (showVoiceAgent) {
      initializeSocketConnection();
    }
  }, [showVoiceAgent]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && showVoiceAgent) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (showVoiceAgent) {
        endConversation();
      }
    };
  }, []);

  // Enhanced properties data with area and city separation
  const [properties] = useState<Property[]>([
    {
      id: '1',
      title: 'Luxury 2BHK in Koramangala',
      price: 35000,
      location: 'Koramangala, Bangalore',
      area: 'Koramangala',
      city: 'bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      images: ['https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 2,
      bathrooms: 2,
      areaSize: 1200,
      aqi: 85,
      ownerContact: '+91 98765 43210',
      type: 'rent',
    },
    {
      id: '2',
      title: 'Modern 3BHK Villa',
      price: 4500000,
      location: 'Whitefield, Bangalore',
      area: 'Whitefield',
      city: 'bangalore',
      latitude: 12.9698,
      longitude: 77.7500,
      images: ['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 3,
      bathrooms: 3,
      areaSize: 1800,
      aqi: 78,
      ownerContact: '+91 98765 43211',
      type: 'buy',
    },
    {
      id: '3',
      title: 'Cozy 1BHK Apartment',
      price: 18000,
      location: 'Indiranagar, Bangalore',
      area: 'Indiranagar',
      city: 'bangalore',
      latitude: 12.9719,
      longitude: 77.6412,
      images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 1,
      bathrooms: 1,
      areaSize: 650,
      aqi: 92,
      ownerContact: '+91 98765 43212',
      type: 'rent',
    },
    {
      id: '4',
      title: 'Spacious 4BHK Penthouse',
      price: 85000,
      location: 'UB City, Bangalore',
      area: 'UB City',
      city: 'bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
      images: ['https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 4,
      bathrooms: 4,
      areaSize: 2500,
      aqi: 88,
      ownerContact: '+91 98765 43213',
      type: 'rent',
    },
    {
      id: '5',
      title: 'Budget 1BHK Studio',
      price: 12000,
      location: 'Electronic City, Bangalore',
      area: 'Electronic City',
      city: 'bangalore',
      latitude: 12.8456,
      longitude: 77.6603,
      images: ['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 1,
      bathrooms: 1,
      areaSize: 450,
      aqi: 95,
      ownerContact: '+91 98765 43214',
      type: 'rent',
    },
    {
      id: '6',
      title: 'Premium 3BHK Apartment',
      price: 6500000,
      location: 'Jayanagar, Bangalore',
      area: 'Jayanagar',
      city: 'bangalore',
      latitude: 12.9279,
      longitude: 77.5937,
      images: ['https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 3,
      bathrooms: 3,
      areaSize: 1650,
      aqi: 82,
      ownerContact: '+91 98765 43215',
      type: 'buy',
    },
    // Mumbai properties
    {
      id: '7',
      title: 'Sea View 2BHK in Bandra',
      price: 55000,
      location: 'Bandra West, Mumbai',
      area: 'Bandra West',
      city: 'mumbai',
      latitude: 19.0596,
      longitude: 72.8295,
      images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 2,
      bathrooms: 2,
      areaSize: 1100,
      aqi: 105,
      ownerContact: '+91 98765 43216',
      type: 'rent',
    },
    {
      id: '8',
      title: 'Luxury 3BHK in Powai',
      price: 8500000,
      location: 'Powai, Mumbai',
      area: 'Powai',
      city: 'mumbai',
      latitude: 19.1176,
      longitude: 72.9060,
      images: ['https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 3,
      bathrooms: 3,
      areaSize: 1600,
      aqi: 98,
      ownerContact: '+91 98765 43217',
      type: 'buy',
    },
    // Delhi properties
    {
      id: '9',
      title: 'Modern 2BHK in Connaught Place',
      price: 45000,
      location: 'Connaught Place, Delhi',
      area: 'Connaught Place',
      city: 'delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      images: ['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 2,
      bathrooms: 2,
      areaSize: 1000,
      aqi: 120,
      ownerContact: '+91 98765 43218',
      type: 'rent',
    },
    {
      id: '10',
      title: 'Spacious 4BHK in Gurgaon',
      price: 7200000,
      location: 'Sector 54, Gurgaon',
      area: 'Sector 54',
      city: 'delhi',
      latitude: 28.4420,
      longitude: 77.0736,
      images: ['https://images.pexels.com/photos/2121120/pexels-photo-2121120.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 4,
      bathrooms: 4,
      areaSize: 2200,
      aqi: 115,
      ownerContact: '+91 98765 43219',
      type: 'buy',
    },
  ]);

  // Area data for each city
  const cityAreas = {
    bangalore: [
      'Koramangala', 'Whitefield', 'Indiranagar', 'UB City', 'Electronic City', 
      'Jayanagar', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Sarjapur Road',
      'Hebbal', 'Yeshwanthpur', 'Rajajinagar', 'Malleshwaram', 'Basavanagudi'
    ],
    mumbai: [
      'Bandra West', 'Powai', 'Andheri East', 'Andheri West', 'Juhu', 
      'Worli', 'Lower Parel', 'Malad', 'Goregaon', 'Borivali',
      'Thane', 'Navi Mumbai', 'Kandivali', 'Santacruz', 'Khar'
    ],
    delhi: [
      'Connaught Place', 'Sector 54', 'Karol Bagh', 'Lajpat Nagar', 'Dwarka',
      'Rohini', 'Janakpuri', 'Vasant Kunj', 'Saket', 'Greater Kailash',
      'Nehru Place', 'Laxmi Nagar', 'Pitampura', 'Rajouri Garden', 'Noida'
    ],
    pune: [
      'Koregaon Park', 'Baner', 'Wakad', 'Hinjewadi', 'Kothrud',
      'Viman Nagar', 'Aundh', 'Magarpatta', 'Hadapsar', 'Pimpri',
      'Chinchwad', 'Katraj', 'Warje', 'Bavdhan', 'Undri'
    ]
  };

  const cityOptions = [
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'pune', label: 'Pune' },
  ];

  const typeOptions = [
    { value: 'rent', label: 'Rent' },
    { value: 'buy', label: 'Buy' },
  ];

  const bedroomOptions = [
    { value: 'any', label: 'Any' },
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4+ BHK' },
  ];

  const budgetOptions = [
    { value: 'any', label: 'Any Budget' },
    { value: '0-20000', label: '₹0 - ₹20,000' },
    { value: '20000-40000', label: '₹20,000 - ₹40,000' },
    { value: '40000-60000', label: '₹40,000 - ₹60,000' },
    { value: '60000+', label: '₹60,000+' },
  ];

  // Get area options based on selected city
  const getAreaOptions = () => {
    const areas = cityAreas[filters.city as keyof typeof cityAreas] || [];
    return [
      { value: 'any', label: 'Any Area' },
      ...areas.map(area => ({ value: area.toLowerCase().replace(/\s+/g, '-'), label: area }))
    ];
  };

  // Initialize socket connection
  const initializeSocketConnection = async () => {
    try {
      setIsProcessing(true);
      
      // Set up message listener
      socketClient.addMessageListener(handleAgentResponse);
      socketClient.addConnectedListener(handleConnectionStatus);
      socketClient.addTypingListener(handleTypingIndicator);
      
      // Connect to the Socket.IO server
      const connected = await socketClient.connect();
      
      if (connected) {
        console.log('Socket.IO connected successfully');
      } else {
        console.error('Failed to connect to Socket.IO server');
        addMessage(false, "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.");
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      setIsProcessing(false);
      addMessage(false, "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.");
    }
  };

  // End conversation when closing the voice agent
  const endConversation = () => {
    // Clean up socket connection
    socketClient.removeMessageListener(handleAgentResponse);
    socketClient.removeConnectedListener(handleConnectionStatus);
    socketClient.removeTypingListener(handleTypingIndicator);
    socketClient.endSession();
  };

  const handleConnectionStatus = (status: boolean) => {
    setIsConnected(status);
  };

  const handleTypingIndicator = (isTyping: boolean) => {
    setIsTyping(isTyping);
  };

  const handleAgentResponse = (message: string) => {
    addMessage(false, message);
  };

  const addMessage = (isUser: boolean, text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, newMessage]);
  };

  // Handle search query changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.length > 0) {
      // Filter areas based on search query across all cities
      const allAreas: string[] = [];
      Object.values(cityAreas).forEach(areas => {
        allAreas.push(...areas);
      });
      
      const filtered = allAreas.filter(area => 
        area.toLowerCase().includes(text.toLowerCase())
      );
      
      setFilteredAreas(filtered);
      setShowAreaSuggestions(true);
    } else {
      setShowAreaSuggestions(false);
      setFilteredAreas([]);
    }
  };

  // Handle area suggestion selection
  const handleAreaSuggestionSelect = (area: string) => {
    // Find which city this area belongs to
    let selectedCity = filters.city;
    Object.entries(cityAreas).forEach(([city, areas]) => {
      if (areas.includes(area)) {
        selectedCity = city;
      }
    });
    
    setFilters({
      ...filters,
      city: selectedCity,
      area: area.toLowerCase().replace(/\s+/g, '-')
    });
    
    setSearchQuery(`${area}, ${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}`);
    setShowAreaSuggestions(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setShowAreaSuggestions(false);
    setFilteredAreas([]);
  };

  // Navigate to map page with search parameters
  const handleSearch = () => {
    console.log('🔍 Search initiated with filters:', filters);
    console.log('📍 Search query:', searchQuery);
    
    // Navigate to map page with search parameters
    const searchParams = new URLSearchParams({
      city: filters.city,
      area: filters.area,
      type: filters.type,
      bedrooms: filters.bedrooms,
      budget: filters.budget,
    });
    
    console.log('🗺️ Navigating to map with params:', searchParams.toString());
    
    router.push(`/map?${searchParams.toString()}`);
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const handleUserMessage = async (message: string) => {
    if (isProcessing || !message.trim() || !isConnected) return;
    
    addMessage(true, message);
    setInputMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    setIsProcessing(true);
    
    try {
      // Send message to Socket.IO server
      socketClient.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      addMessage(false, "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return theme.colors.success;
    if (aqi <= 100) return theme.colors.warning;
    return theme.colors.error;
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    return 'Poor';
  };

  // Voice AI Agent Modal
  const VoiceAgentModal = () => {
    return (
      <Modal
        visible={showVoiceAgent}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          endConversation();
          setShowVoiceAgent(false);
        }}
      >
        <SafeAreaView style={styles.voiceModalContainer}>
          {/* Header */}
          <View style={styles.voiceModalHeader}>
            <TouchableOpacity 
              onPress={() => {
                endConversation();
                setShowVoiceAgent(false);
              }}
              style={styles.voiceBackButton}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={styles.voiceHeaderContent}>
              <View style={styles.agentAvatar}>
                <Bot size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.agentName}>AI Real Estate Assistant</Text>
                <Text style={styles.agentStatus}>
                  {isProcessing ? 'Processing...' : 
                   isTyping ? 'Typing...' : 
                   isConnected ? 'Online' : 'Connecting...'}
                </Text>
              </View>
            </View>
          </View>

          {/* Chat Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.aiMessage
                ]}
              >
                {!message.isUser && (
                  <View style={styles.aiAvatar}>
                    <Bot size={16} color={theme.colors.primary} />
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.aiText
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    message.isUser ? styles.userTime : styles.aiTime
                  ]}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
            
            {isTyping && (
              <View style={[styles.messageContainer, styles.aiMessage]}>
                <View style={styles.aiAvatar}>
                  <Bot size={16} color={theme.colors.primary} />
                </View>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Ask me about properties..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                maxLength={500}
                editable={!isProcessing && isConnected}
              />
              
              <View style={styles.inputActions}>
                {inputMessage.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleUserMessage(inputMessage)}
                    disabled={isProcessing || !isConnected}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color={theme.colors.text} />
                    ) : (
                      <Send size={18} color={theme.colors.text} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Quick Suggestions */}
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                "Show me 2BHK apartments",
                "What's my budget range?",
                "Best areas in Bangalore",
                "Properties near IT parks"
              ].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleUserMessage(suggestion)}
                  disabled={isProcessing || !isConnected}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const FilterDropdown = ({ 
    label, 
    value, 
    options, 
    onSelect 
  }: { 
    label: string; 
    value: string; 
    options: { value: string; label: string }[]; 
    onSelect: (value: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>{label}</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={styles.filterButtonText}>
            {options.find(opt => opt.value === value)?.label || 'Select'}
          </Text>
        </TouchableOpacity>
        
        {isOpen && (
          <View style={styles.filterDropdown}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.filterOption}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  value === option.value && styles.filterOptionTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const PropertyModal = () => {
    if (!selectedProperty) return null;

    return (
      <Modal
        visible={showPropertyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPropertyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Property Details</Text>
            <TouchableOpacity onPress={() => setShowPropertyModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Image source={{ uri: selectedProperty.images[0] }} style={styles.modalImage} />
            
            <View style={styles.modalDetails}>
              <Text style={styles.modalPropertyTitle}>{selectedProperty.title}</Text>
              <Text style={styles.modalPrice}>
                ₹{selectedProperty.price.toLocaleString()}
                {selectedProperty.type === 'rent' ? '/month' : ''}
              </Text>
              
              <View style={styles.modalLocationRow}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <Text style={styles.modalLocationText}>{selectedProperty.location}</Text>
              </View>
              
              <View style={styles.modalFeatures}>
                <View style={styles.modalFeature}>
                  <Bed size={20} color={theme.colors.primary} />
                  <Text style={styles.modalFeatureText}>{selectedProperty.bedrooms} Bedrooms</Text>
                </View>
                <View style={styles.modalFeature}>
                  <Bath size={20} color={theme.colors.primary} />
                  <Text style={styles.modalFeatureText}>{selectedProperty.bathrooms} Bathrooms</Text>
                </View>
                <View style={styles.modalFeature}>
                  <Square size={20} color={theme.colors.primary} />
                  <Text style={styles.modalFeatureText}>{selectedProperty.areaSize} sqft</Text>
                </View>
              </View>
              
              {selectedProperty.aqi && (
                <View style={styles.modalAqi}>
                  <Wind size={20} color={getAQIColor(selectedProperty.aqi)} />
                  <Text style={styles.modalAqiText}>
                    Air Quality Index: {selectedProperty.aqi} ({getAQILabel(selectedProperty.aqi)})
                  </Text>
                </View>
              )}
              
              {selectedProperty.ownerContact && (
                <View style={styles.contactSection}>
                  <Text style={styles.contactLabel}>Owner Contact</Text>
                  <TouchableOpacity style={styles.contactButton}>
                    <Phone size={20} color={theme.colors.text} />
                    <Text style={styles.contactText}>{selectedProperty.ownerContact}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Home</Text>
        <Text style={styles.headerSubtitle}>Search properties with smart filters</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search area, city (e.g., Koramangala, Bangalore)"
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="words"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Area Suggestions */}
        {showAreaSuggestions && filteredAreas.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
              {filteredAreas.slice(0, 8).map((area, index) => {
                // Find which city this area belongs to
                let cityName = '';
                Object.entries(cityAreas).forEach(([city, areas]) => {
                  if (areas.includes(area)) {
                    cityName = city.charAt(0).toUpperCase() + city.slice(1);
                  }
                });
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleAreaSuggestionSelect(area)}
                  >
                    <MapPin size={16} color={theme.colors.textMuted} />
                    <Text style={styles.suggestionText}>
                      {area}, {cityName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <FilterDropdown
            label="City"
            value={filters.city}
            options={cityOptions}
            onSelect={(value) => setFilters({ ...filters, city: value, area: 'any' })}
          />
          <FilterDropdown
            label="Area"
            value={filters.area}
            options={getAreaOptions()}
            onSelect={(value) => setFilters({ ...filters, area: value })}
          />
        </View>
        
        <View style={styles.filtersRow}>
          <FilterDropdown
            label="Type"
            value={filters.type}
            options={typeOptions}
            onSelect={(value) => setFilters({ ...filters, type: value as 'rent' | 'buy' })}
          />
          <FilterDropdown
            label="Bedrooms"
            value={filters.bedrooms}
            options={bedroomOptions}
            onSelect={(value) => setFilters({ ...filters, bedrooms: value })}
          />
        </View>
        
        <View style={styles.filtersRow}>
          <FilterDropdown
            label="Budget"
            value={filters.budget}
            options={budgetOptions}
            onSelect={(value) => setFilters({ ...filters, budget: value })}
          />
          <View style={styles.filterContainer}>
            <Button title="Search Properties" onPress={handleSearch} style={styles.searchButton} />
          </View>
        </View>
      </View>

      {/* Welcome Content */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>🏠 Welcome to Property Search</Text>
          <Text style={styles.welcomeText}>
            Use the search bar and filters above to find your perfect home.
          </Text>
          <Text style={styles.welcomeSubtext}>
            • Search by area or city{'\n'}
            • Apply filters for better results{'\n'}
            • View properties on interactive map{'\n'}
            • Contact owners directly
          </Text>
          
          <View style={styles.searchSteps}>
            <Text style={styles.searchStepsTitle}>How to Search:</Text>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Select your preferred city and area</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Choose property type (Rent/Buy)</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Set bedrooms and budget filters</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Click "Search Properties" to view map</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Floating AI Assistant Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowVoiceAgent(true)}
        activeOpacity={0.8}
      >
        <View style={styles.floatingButtonContent}>
          <Bot size={24} color={theme.colors.text} />
          <Text style={styles.floatingButtonText}>Ask AI Assistant</Text>
        </View>
      </TouchableOpacity>

      <PropertyModal />
      <VoiceAgentModal />
    </SafeAreaView>
  );
}

<<<<<<< HEAD
// This is a workaround for the Image component in React Native Web
const Image = ({ source, style }: { source: { uri: string }, style: any }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={style}>
        <img 
          src={source.uri} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: style.borderRadius || 0
          }} 
        />
      </View>
    );
  } else {
    // Use React Native's Image component for native platforms
    return <Animated.Image source={source} style={style} />;
  }
};

=======
>>>>>>> c083026 (new commit)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  
  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    position: 'relative',
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xs,
    maxHeight: 200,
<<<<<<< HEAD
    zIndex: 1000,
=======
    ...theme.shadows.lg,
>>>>>>> c083026 (new commit)
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  suggestionText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  
  filtersContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  filterContainer: {
    flex: 1,
    position: 'relative',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  filterButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xs,
    zIndex: 1000,
<<<<<<< HEAD
=======
    ...theme.shadows.md,
>>>>>>> c083026 (new commit)
  },
  filterOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterOptionText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  searchButton: {
    marginTop: 18, // Align with other filter buttons
  },
  
  // Welcome Screen Styles
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  welcomeContent: {
    alignItems: 'center',
    maxWidth: 350,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  searchSteps: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  
  // Floating AI Assistant Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // Voice Agent Modal Styles
  voiceModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  voiceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  voiceBackButton: {
    padding: theme.spacing.xs,
  },
  voiceHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  agentStatus: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    flex: 1,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: theme.colors.text,
  },
  aiText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  userTime: {
    color: theme.colors.text,
    textAlign: 'right',
  },
  aiTime: {
    color: theme.colors.textMuted,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textMuted,
  },
  inputArea: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  textInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: theme.spacing.xs,
  },
  inputActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    padding: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  suggestionChip: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalDetails: {
    padding: theme.spacing.md,
  },
  modalPropertyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  modalLocationText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  modalFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
<<<<<<< HEAD
    borderRadius: theme.spacing.md,
=======
    borderRadius: theme.borderRadius.md,
>>>>>>> c083026 (new commit)
  },
  modalFeature: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  modalFeatureText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  modalAqi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
<<<<<<< HEAD
    borderRadius: theme.spacing.md,
=======
    borderRadius: theme.borderRadius.md,
>>>>>>> c083026 (new commit)
  },
  modalAqiText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  contactSection: {
    marginTop: theme.spacing.md,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.md,
  },
  contactText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
});