import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { 
  ArrowLeft,
  MapPin,
  X,
  Bed,
  Bath,
  Square,
  Phone,
  Wind,
  Star,
  ZoomIn,
  ZoomOut,
  Navigation,
  Hospital,
  Shield,
  GraduationCap,
  Building2,
  Trees,
  ShoppingBag,
  TrendingUp,
  IndianRupee,
  Calendar,
  Map as MapIcon,
  Bot,
  Sparkles
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';

// Lazy load the interactive map component for web
const InteractiveMap = Platform.OS === 'web' 
  ? React.lazy(() => import('@/components/web/InteractiveMap'))
  : null;

// Lazy load the Leaflet map component
const LeafletMap = Platform.OS === 'web'
  ? React.lazy(() => import('@/components/ui/LeafletMap'))
  : null;

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

interface AreaInfo {
  nearbyHospitals: string[];
  nearbySchools: string[];
  policeStations: string[];
  businessAreas: string[];
  parks: string[];
  shoppingCenters: string[];
  publicTransport: string[];
  propertyGrowth: {
    year: number;
    growthPercentage: number;
  }[];
  rentalYield: number;
  averageRent: number;
  connectivityScore: number;
}

export default function MapScreen() {
  const params = useLocalSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);
  const [useLeaflet, setUseLeaflet] = useState(true);

  // Parse search parameters with useMemo to prevent infinite re-renders
  const searchFilters = useMemo(() => ({
    city: (params.city as string) || 'bangalore',
    area: (params.area as string) || 'any',
    type: (params.type as string) || 'rent',
    bedrooms: (params.bedrooms as string) || 'any',
    budget: (params.budget as string) || 'any',
  }), [params.city, params.area, params.type, params.bedrooms, params.budget]);

  // Enhanced properties data with coordinates for each area
  const [properties] = useState<Property[]>([
    // Bangalore Properties
    {
      id: '1',
      title: 'Luxury 2BHK in Koramangala',
      price: 35000,
      location: 'Koramangala 5th Block, Bangalore',
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
      location: 'Whitefield Main Road, Bangalore',
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
      location: 'Indiranagar 100 Feet Road, Bangalore',
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
      location: 'UB City Mall Area, Bangalore',
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
      location: 'Electronic City Phase 1, Bangalore',
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
      location: 'Jayanagar 4th Block, Bangalore',
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
    {
      id: '7',
      title: 'HSR Layout 2BHK',
      price: 28000,
      location: 'HSR Layout Sector 1, Bangalore',
      area: 'HSR Layout',
      city: 'bangalore',
      latitude: 12.9082,
      longitude: 77.6476,
      images: ['https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 2,
      bathrooms: 2,
      areaSize: 1100,
      aqi: 87,
      ownerContact: '+91 98765 43216',
      type: 'rent',
    },
    {
      id: '8',
      title: 'BTM Layout Family Home',
      price: 3200000,
      location: 'BTM Layout 2nd Stage, Bangalore',
      area: 'BTM Layout',
      city: 'bangalore',
      latitude: 12.9165,
      longitude: 77.6101,
      images: ['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 3,
      bathrooms: 2,
      areaSize: 1400,
      aqi: 89,
      ownerContact: '+91 98765 43217',
      type: 'buy',
    },
    
    // Mumbai Properties
    {
      id: '9',
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
      ownerContact: '+91 98765 43218',
      type: 'rent',
    },
    {
      id: '10',
      title: 'Luxury 3BHK in Powai',
      price: 8500000,
      location: 'Powai Lake View, Mumbai',
      area: 'Powai',
      city: 'mumbai',
      latitude: 19.1176,
      longitude: 72.9060,
      images: ['https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 3,
      bathrooms: 3,
      areaSize: 1600,
      aqi: 98,
      ownerContact: '+91 98765 43219',
      type: 'buy',
    },
    {
      id: '11',
      title: 'Andheri East Office Space',
      price: 42000,
      location: 'Andheri East, Mumbai',
      area: 'Andheri East',
      city: 'mumbai',
      latitude: 19.1136,
      longitude: 72.8697,
      images: ['https://images.pexels.com/photos/2121120/pexels-photo-2121120.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 2,
      bathrooms: 2,
      areaSize: 950,
      aqi: 102,
      ownerContact: '+91 98765 43220',
      type: 'rent',
    },
    
    // Delhi Properties
    {
      id: '12',
      title: 'Modern 2BHK in Connaught Place',
      price: 45000,
      location: 'Connaught Place, New Delhi',
      area: 'Connaught Place',
      city: 'delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      images: ['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 2,
      bathrooms: 2,
      areaSize: 1000,
      aqi: 120,
      ownerContact: '+91 98765 43221',
      type: 'rent',
    },
    {
      id: '13',
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
      ownerContact: '+91 98765 43222',
      type: 'buy',
    },
    
    // Pune Properties
    {
      id: '14',
      title: 'Koregaon Park Premium Flat',
      price: 38000,
      location: 'Koregaon Park, Pune',
      area: 'Koregaon Park',
      city: 'pune',
      latitude: 18.5362,
      longitude: 73.8958,
      images: ['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 2,
      bathrooms: 2,
      areaSize: 1150,
      aqi: 78,
      ownerContact: '+91 98765 43223',
      type: 'rent',
    },
    {
      id: '15',
      title: 'Baner IT Hub Apartment',
      price: 4800000,
      location: 'Baner Road, Pune',
      area: 'Baner',
      city: 'pune',
      latitude: 18.5679,
      longitude: 73.7811,
      images: ['https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'],
      bedrooms: 3,
      bathrooms: 3,
      areaSize: 1500,
      aqi: 82,
      ownerContact: '+91 98765 43224',
      type: 'buy',
    },
  ]);

  // City coordinates for map centering
  const cityCoordinates = {
    bangalore: { lat: 12.9716, lng: 77.5946, zoom: 11 },
    mumbai: { lat: 19.0760, lng: 72.8777, zoom: 11 },
    delhi: { lat: 28.6139, lng: 77.2090, zoom: 11 },
    pune: { lat: 18.5204, lng: 73.8567, zoom: 11 },
  };

  // Area coordinates for specific area centering
  const areaCoordinates: Record<string, { lat: number; lng: number; zoom: number }> = {
    // Bangalore areas
    'koramangala': { lat: 12.9352, lng: 77.6245, zoom: 14 },
    'whitefield': { lat: 12.9698, lng: 77.7500, zoom: 14 },
    'indiranagar': { lat: 12.9719, lng: 77.6412, zoom: 14 },
    'ub-city': { lat: 12.9716, lng: 77.5946, zoom: 15 },
    'electronic-city': { lat: 12.8456, lng: 77.6603, zoom: 14 },
    'jayanagar': { lat: 12.9279, lng: 77.5937, zoom: 14 },
    'hsr-layout': { lat: 12.9082, lng: 77.6476, zoom: 14 },
    'btm-layout': { lat: 12.9165, lng: 77.6101, zoom: 14 },
    
    // Mumbai areas
    'bandra-west': { lat: 19.0596, lng: 72.8295, zoom: 14 },
    'powai': { lat: 19.1176, lng: 72.9060, zoom: 14 },
    'andheri-east': { lat: 19.1136, lng: 72.8697, zoom: 14 },
    
    // Delhi areas
    'connaught-place': { lat: 28.6315, lng: 77.2167, zoom: 15 },
    'sector-54': { lat: 28.4420, lng: 77.0736, zoom: 14 },
    
    // Pune areas
    'koregaon-park': { lat: 18.5362, lng: 73.8958, zoom: 14 },
    'baner': { lat: 18.5679, lng: 73.7811, zoom: 14 },
  };

  // Filter properties based on search criteria
  const getFilteredProperties = () => {
    return properties.filter(property => {
      // City filter
      if (searchFilters.city !== 'any' && property.city !== searchFilters.city) {
        return false;
      }
      
      // Area filter
      if (searchFilters.area !== 'any') {
        const areaValue = searchFilters.area.replace(/-/g, ' ');
        if (!property.area.toLowerCase().includes(areaValue.toLowerCase())) {
          return false;
        }
      }
      
      // Type filter
      if (searchFilters.type !== property.type) {
        return false;
      }
      
      // Bedrooms filter
      if (searchFilters.bedrooms !== 'any') {
        const bedroomCount = parseInt(searchFilters.bedrooms);
        if (searchFilters.bedrooms === '4' && property.bedrooms < 4) {
          return false;
        } else if (searchFilters.bedrooms !== '4' && property.bedrooms !== bedroomCount) {
          return false;
        }
      }
      
      // Budget filter
      if (searchFilters.budget !== 'any') {
        const [min, max] = searchFilters.budget.split('-').map(b => parseInt(b.replace('+', '')));
        if (max) {
          if (property.price < min || property.price > max) {
            return false;
          }
        } else {
          if (property.price < min) {
            return false;
          }
        }
      }
      
      return true;
    });
  };

  const filteredProperties = getFilteredProperties();

  // Set map center based on search parameters
  useEffect(() => {
    console.log('🗺️ Map Screen - Search Filters:', searchFilters);
    console.log('📍 Filtered Properties:', filteredProperties.length);
    
    // If specific area is selected, center on that area
    if (searchFilters.area !== 'any') {
      const areaKey = searchFilters.area.toLowerCase();
      const areaCoord = areaCoordinates[areaKey];
      
      if (areaCoord) {
        console.log(`🎯 Centering map on area: ${searchFilters.area}`, areaCoord);
        setMapCenter({ lat: areaCoord.lat, lng: areaCoord.lng });
        setMapZoom(areaCoord.zoom);
      } else {
        // Fallback to city center
        const cityCoord = cityCoordinates[searchFilters.city as keyof typeof cityCoordinates];
        if (cityCoord) {
          console.log(`🏙️ Centering map on city: ${searchFilters.city}`, cityCoord);
          setMapCenter({ lat: cityCoord.lat, lng: cityCoord.lng });
          setMapZoom(cityCoord.zoom);
        }
      }
    } else {
      // Center on city
      const cityCoord = cityCoordinates[searchFilters.city as keyof typeof cityCoordinates];
      if (cityCoord) {
        console.log(`🏙️ Centering map on city: ${searchFilters.city}`, cityCoord);
        setMapCenter({ lat: cityCoord.lat, lng: cityCoord.lng });
        setMapZoom(cityCoord.zoom);
      }
    }
  }, [searchFilters]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const getAreaDisplayName = () => {
    if (searchFilters.area === 'any') {
      return searchFilters.city.charAt(0).toUpperCase() + searchFilters.city.slice(1);
    }
    return searchFilters.area.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  // Mock area information - in a real app, this would come from your API
  const getAreaInfo = (area: string, city: string): AreaInfo => {
    const areaInfoMap: Record<string, AreaInfo> = {
      'koramangala': {
        nearbyHospitals: ['Manipal Hospital', 'Fortis Hospital', 'Apollo Clinic'],
        nearbySchools: ['Delhi Public School', 'National Public School', 'Inventure Academy'],
        policeStations: ['Koramangala Police Station', 'HSR Layout Police Station'],
        businessAreas: ['IT Park', 'Koramangala Business District', 'Forum Mall Area'],
        parks: ['Koramangala Park', 'Jakkur Lake', 'Cubbon Park'],
        shoppingCenters: ['Forum Mall', '1 MG Mall', 'Koramangala Market'],
        publicTransport: ['Koramangala Metro Station', 'Bus Terminal', 'Auto Stand'],
        propertyGrowth: [
          { year: 2020, growthPercentage: 8.5 },
          { year: 2021, growthPercentage: 12.3 },
          { year: 2022, growthPercentage: 15.7 },
          { year: 2023, growthPercentage: 18.2 },
          { year: 2024, growthPercentage: 22.1 }
        ],
        rentalYield: 3.2,
        averageRent: 32000,
        connectivityScore: 9.2
      },
      'whitefield': {
        nearbyHospitals: ['Columbia Asia Hospital', 'Manipal Hospital Whitefield', 'Narayana Health'],
        nearbySchools: ['Ryan International School', 'Inventure Academy', 'Gear Innovative School'],
        policeStations: ['Whitefield Police Station', 'Mahadevapura Police Station'],
        businessAreas: ['ITPL', 'Bagmane Tech Park', 'Prestige Tech Park', 'SEZ Area'],
        parks: ['Whitefield Park', 'Hope Farm Nature Reserve', 'Varthur Lake'],
        shoppingCenters: ['Phoenix MarketCity', 'VR Bengaluru', 'Forum Shantiniketan'],
        publicTransport: ['Whitefield Metro Station', 'BMTC Bus Depot', 'Cab Services'],
        propertyGrowth: [
          { year: 2020, growthPercentage: 10.2 },
          { year: 2021, growthPercentage: 14.8 },
          { year: 2022, growthPercentage: 19.3 },
          { year: 2023, growthPercentage: 24.7 },
          { year: 2024, growthPercentage: 28.5 }
        ],
        rentalYield: 3.8,
        averageRent: 28000,
        connectivityScore: 8.7
      },
      'indiranagar': {
        nearbyHospitals: ['Sakra World Hospital', 'Manipal Hospital HAL', 'Cloudnine Hospital'],
        nearbySchools: ['Bishop Cotton Boys School', 'Clarence High School', 'Inventure Academy'],
        policeStations: ['Indiranagar Police Station', 'HAL Police Station'],
        businessAreas: ['HAL Airport Area', 'Commercial Street', 'Brigade Road'],
        parks: ['Cubbon Park', 'Lalbagh Botanical Garden', 'Ulsoor Lake'],
        shoppingCenters: ['UB City Mall', 'Commercial Street', 'Brigade Road'],
        publicTransport: ['Indiranagar Metro Station', 'Bus Terminal', 'Auto Rickshaw Stand'],
        propertyGrowth: [
          { year: 2020, growthPercentage: 7.8 },
          { year: 2021, growthPercentage: 11.2 },
          { year: 2022, growthPercentage: 14.6 },
          { year: 2023, growthPercentage: 17.9 },
          { year: 2024, growthPercentage: 21.3 }
        ],
        rentalYield: 2.9,
        averageRent: 35000,
        connectivityScore: 9.5
      },
      'bandra-west': {
        nearbyHospitals: ['Lilavati Hospital', 'Holy Family Hospital', 'Bhabha Hospital'],
        nearbySchools: ['St. Stanislaus High School', 'Apostolic Carmel High School', 'Hill Grange High School'],
        policeStations: ['Bandra Police Station', 'Khar Police Station'],
        businessAreas: ['Bandra Kurla Complex', 'Linking Road Commercial', 'Hill Road Business Area'],
        parks: ['Bandra Bandstand', 'Carter Road Promenade', 'Joggers Park'],
        shoppingCenters: ['Palladium Mall', 'Infiniti Mall', 'Linking Road Market'],
        publicTransport: ['Bandra Railway Station', 'Metro Line', 'Bus Depot'],
        propertyGrowth: [
          { year: 2020, growthPercentage: 6.5 },
          { year: 2021, growthPercentage: 9.8 },
          { year: 2022, growthPercentage: 13.2 },
          { year: 2023, growthPercentage: 16.7 },
          { year: 2024, growthPercentage: 19.4 }
        ],
        rentalYield: 2.1,
        averageRent: 65000,
        connectivityScore: 9.8
      }
    };

    // Default area info for areas not specifically mapped
    const defaultAreaInfo: AreaInfo = {
      nearbyHospitals: ['City Hospital', 'General Hospital', 'Medical Center'],
      nearbySchools: ['Public School', 'High School', 'Primary School'],
      policeStations: ['Local Police Station', 'Traffic Police'],
      businessAreas: ['Commercial Area', 'Business District'],
      parks: ['City Park', 'Garden Area'],
      shoppingCenters: ['Local Market', 'Shopping Complex'],
      publicTransport: ['Bus Stop', 'Auto Stand'],
      propertyGrowth: [
        { year: 2020, growthPercentage: 5.0 },
        { year: 2021, growthPercentage: 8.5 },
        { year: 2022, growthPercentage: 12.0 },
        { year: 2023, growthPercentage: 15.5 },
        { year: 2024, growthPercentage: 18.0 }
      ],
      rentalYield: 3.0,
      averageRent: 25000,
      connectivityScore: 7.5
    };

    const areaKey = area.toLowerCase().replace(/\s+/g, '-');
    return areaInfoMap[areaKey] || defaultAreaInfo;
  };

  const handleVoiceAgentPress = () => {
    router.push('/voice-agent');
  };

  const PropertyModal = () => {
    if (!selectedProperty) return null;

    const areaInfo = getAreaInfo(selectedProperty.area, selectedProperty.city);
    const currentYear = new Date().getFullYear();
    const fiveYearGrowth = areaInfo.propertyGrowth[areaInfo.propertyGrowth.length - 1]?.growthPercentage || 0;

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
            <TouchableOpacity 
              onPress={() => setShowPropertyModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedProperty.images[0] }} style={styles.modalImage} />
            
            <View style={styles.modalDetails}>
              <View style={styles.propertyHeader}>
                <Text style={styles.modalPropertyTitle}>{selectedProperty.title}</Text>
                <View style={[styles.typeBadge, { 
                  backgroundColor: selectedProperty.type === 'rent' ? theme.colors.primary : theme.colors.secondary 
                }]}>
                  <Text style={styles.typeBadgeText}>
                    {selectedProperty.type === 'rent' ? 'For Rent' : 'For Sale'}
                  </Text>
                </View>
              </View>
              
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

              {/* Investment Analytics Section */}
              <View style={styles.investmentSection}>
                <Text style={styles.sectionTitle}>Investment Analytics</Text>
                
                <View style={styles.investmentGrid}>
                  <View style={styles.investmentCard}>
                    <TrendingUp size={20} color={theme.colors.success} />
                    <Text style={styles.investmentValue}>{fiveYearGrowth}%</Text>
                    <Text style={styles.investmentLabel}>5-Year Growth</Text>
                  </View>
                  
                  <View style={styles.investmentCard}>
                    <IndianRupee size={20} color={theme.colors.primary} />
                    <Text style={styles.investmentValue}>{areaInfo.rentalYield}%</Text>
                    <Text style={styles.investmentLabel}>Rental Yield</Text>
                  </View>
                  
                  <View style={styles.investmentCard}>
                    <Calendar size={20} color={theme.colors.secondary} />
                    <Text style={styles.investmentValue}>₹{areaInfo.averageRent.toLocaleString()}</Text>
                    <Text style={styles.investmentLabel}>Avg. Rent</Text>
                  </View>
                  
                  <View style={styles.investmentCard}>
                    <MapIcon size={20} color={theme.colors.accent} />
                    <Text style={styles.investmentValue}>{areaInfo.connectivityScore}/10</Text>
                    <Text style={styles.investmentLabel}>Connectivity</Text>
                  </View>
                </View>

                {/* Growth Chart */}
                <View style={styles.growthChart}>
                  <Text style={styles.chartTitle}>Property Value Growth (Last 5 Years)</Text>
                  <View style={styles.chartContainer}>
                    {areaInfo.propertyGrowth.map((data, index) => (
                      <View key={data.year} style={styles.chartBar}>
                        <View 
                          style={[
                            styles.chartBarFill, 
                            { height: `${(data.growthPercentage / 30) * 100}%` }
                          ]} 
                        />
                        <Text style={styles.chartYear}>{data.year}</Text>
                        <Text style={styles.chartValue}>{data.growthPercentage}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Area Information Section */}
              <View style={styles.areaSection}>
                <Text style={styles.sectionTitle}>Area Information</Text>
                
                {/* Nearby Hospitals */}
                <View style={styles.amenityGroup}>
                  <View style={styles.amenityHeader}>
                    <Hospital size={18} color={theme.colors.error} />
                    <Text style={styles.amenityTitle}>Nearby Hospitals</Text>
                  </View>
                  <View style={styles.amenityList}>
                    {areaInfo.nearbyHospitals.map((hospital, index) => (
                      <Text key={index} style={styles.amenityItem}>• {hospital}</Text>
                    ))}
                  </View>
                </View>

                {/* Nearby Schools */}
                <View style={styles.amenityGroup}>
                  <View style={styles.amenityHeader}>
                    <GraduationCap size={18} color={theme.colors.primary} />
                    <Text style={styles.amenityTitle}>Educational Institutions</Text>
                  </View>
                  <View style={styles.amenityList}>
                    {areaInfo.nearbySchools.map((school, index) => (
                      <Text key={index} style={styles.amenityItem}>• {school}</Text>
                    ))}
                  </View>
                </View>

                {/* Police Stations */}
                <View style={styles.amenityGroup}>
                  <View style={styles.amenityHeader}>
                    <Shield size={18} color={theme.colors.secondary} />
                    <Text style={styles.amenityTitle}>Safety & Security</Text>
                  </View>
                  <View style={styles.amenityList}>
                    {areaInfo.policeStations.map((station, index) => (
                      <Text key={index} style={styles.amenityItem}>• {station}</Text>
                    ))}
                  </View>
                </View>

                {/* Business Areas */}
                <View style={styles.amenityGroup}>
                  <View style={styles.amenityHeader}>
                    <Building2 size={18} color={theme.colors.accent} />
                    <Text style={styles.amenityTitle}>Business & IT Hubs</Text>
                  </View>
                  <View style={styles.amenityList}>
                    {areaInfo.businessAreas.map((area, index) => (
                      <Text key={index} style={styles.amenityItem}>• {area}</Text>
                    ))}
                  </View>
                </View>

                {/* Parks & Recreation */}
                <View style={styles.amenityGroup}>
                  <View style={styles.amenityHeader}>
                    <Trees size={18} color={theme.colors.success} />
                    <Text style={styles.amenityTitle}>Parks & Recreation</Text>
                  </View>
                  <View style={styles.amenityList}>
                    {areaInfo.parks.map((park, index) => (
                      <Text key={index} style={styles.amenityItem}>• {park}</Text>
                    ))}
                  </View>
                </View>

                {/* Shopping Centers */}
                <View style={styles.amenityGroup}>
                  <View style={styles.amenityHeader}>
                    <ShoppingBag size={18} color={theme.colors.warning} />
                    <Text style={styles.amenityTitle}>Shopping & Entertainment</Text>
                  </View>
                  <View style={styles.amenityList}>
                    {areaInfo.shoppingCenters.map((center, index) => (
                      <Text key={index} style={styles.amenityItem}>• {center}</Text>
                    ))}
                  </View>
                </View>
              </View>
              
              <View style={styles.ratingSection}>
                <View style={styles.rating}>
                  <Star size={16} color={theme.colors.warning} fill={theme.colors.warning} />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.reviewCount}>(142 reviews)</Text>
                </View>
              </View>
              
              {selectedProperty.ownerContact && (
                <View style={styles.contactSection}>
                  <Text style={styles.contactLabel}>Contact Owner</Text>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Properties in {getAreaDisplayName()}
          </Text>
          <Text style={styles.headerSubtitle}>
            {filteredProperties.length} properties • {searchFilters.type === 'rent' ? 'For Rent' : 'For Sale'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.navigationButton}>
          <Navigation size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Map Stats */}
      <View style={styles.mapStats}>
        <View style={styles.statItem}>
          <View style={[styles.statColor, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.statText}>
            {filteredProperties.filter(p => p.type === 'rent').length} For Rent
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statColor, { backgroundColor: theme.colors.secondary }]} />
          <Text style={styles.statText}>
            {filteredProperties.filter(p => p.type === 'buy').length} For Sale
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>
            📍 Zoom: {mapZoom}x
          </Text>
        </View>
      </View>

      {/* Map Content */}
      {Platform.OS === 'web' && (
        <Suspense fallback={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              Loading map for {getAreaDisplayName()}...
            </Text>
            <Text style={styles.loadingSubtext}>
              {filteredProperties.length} properties found
            </Text>
          </View>
        }>
          {useLeaflet && LeafletMap ? (
            <LeafletMap 
              properties={filteredProperties} 
              onPropertySelect={handlePropertySelect}
              selectedCity={searchFilters.city}
              selectedArea={searchFilters.area}
            />
          ) : InteractiveMap ? (
            <InteractiveMap 
              properties={filteredProperties} 
              onPropertySelect={handlePropertySelect}
              selectedCity={searchFilters.city}
              selectedArea={searchFilters.area}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Map component not available</Text>
            </View>
          )}
        </Suspense>
      )}
      
      {Platform.OS !== 'web' && (
        <View style={styles.mobileMapContainer}>
          <View style={styles.mobileMapContent}>
            <Text style={styles.mobileMapTitle}>🗺️ Map View</Text>
            <Text style={styles.mobileMapText}>
              Interactive map showing properties in {getAreaDisplayName()}
            </Text>
            <Text style={styles.mobileMapSubtext}>
              {filteredProperties.length} properties found matching your search criteria
            </Text>
            
            {filteredProperties.length > 0 && (
              <View style={styles.propertiesList}>
                <Text style={styles.propertiesListTitle}>Properties Found:</Text>
                {filteredProperties.slice(0, 5).map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={styles.propertyItem}
                    onPress={() => handlePropertySelect(property)}
                  >
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyTitle}>{property.title}</Text>
                      <Text style={styles.propertyPrice}>
                        ₹{property.price.toLocaleString()}
                        {property.type === 'rent' ? '/month' : ''}
                      </Text>
                      <View style={styles.propertyLocation}>
                        <MapPin size={12} color={theme.colors.textMuted} />
                        <Text style={styles.propertyLocationText}>{property.location}</Text>
                      </View>
                    </View>
                    <View style={[styles.propertyTypeBadge, {
                      backgroundColor: property.type === 'rent' ? theme.colors.primary : theme.colors.secondary
                    }]}>
                      <Text style={styles.propertyTypeText}>
                        {property.type === 'rent' ? 'RENT' : 'SALE'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {filteredProperties.length > 5 && (
                  <Text style={styles.morePropertiesText}>
                    +{filteredProperties.length - 5} more properties
                  </Text>
                )}
              </View>
            )}
            
            {filteredProperties.length === 0 && (
              <View style={styles.noPropertiesContainer}>
                <Text style={styles.noPropertiesTitle}>No Properties Found</Text>
                <Text style={styles.noPropertiesText}>
                  No properties match your search criteria in {getAreaDisplayName()}.
                  Try adjusting your filters.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Voice AI Agent Floating Button */}
      <TouchableOpacity
        style={styles.voiceAgentButton}
        onPress={handleVoiceAgentPress}
        activeOpacity={0.8}
      >
        <View style={styles.voiceAgentGradient}>
          <Bot size={24} color={theme.colors.text} />
          <Sparkles 
            size={14} 
            color={theme.colors.text} 
            style={styles.sparklesIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Property Modal */}
      <PropertyModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  navigationButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  mapStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingSubtext: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  
  // Mobile Map Styles
  mobileMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  mobileMapContent: {
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  mobileMapTitle: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  mobileMapText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  mobileMapSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  propertiesList: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  propertiesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  propertyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyLocationText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  propertyTypeBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  propertyTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text,
  },
  morePropertiesText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  noPropertiesContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noPropertiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  noPropertiesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Voice AI Agent Floating Button
  voiceAgentButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  voiceAgentGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparklesIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
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
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
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
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  modalPropertyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  typeBadgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  modalPrice: {
    fontSize: 24,
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
    borderRadius: theme.borderRadius.md,
  },
  modalFeature: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  modalFeatureText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalAqi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  modalAqiText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  
  // Investment Section Styles
  investmentSection: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  investmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  investmentCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  investmentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  investmentLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  growthChart: {
    marginTop: theme.spacing.md,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: theme.spacing.sm,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  chartBarFill: {
    width: '80%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    minHeight: 10,
    marginBottom: theme.spacing.xs,
  },
  chartYear: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Area Section Styles
  areaSection: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amenityGroup: {
    marginBottom: theme.spacing.md,
  },
  amenityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  amenityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  amenityList: {
    paddingLeft: theme.spacing.lg,
  },
  amenityItem: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  
  ratingSection: {
    marginBottom: theme.spacing.md,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  contactSection: {
    marginBottom: theme.spacing.md,
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
    borderRadius: theme.borderRadius.md,
  },
  contactText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
});