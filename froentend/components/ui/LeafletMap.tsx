import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, Platform } from 'react-native';
import { MapPin, X, Bed, Bath, Square, Phone, Wind, Star, Hospital, Shield, GraduationCap, Building2, Trees, ShoppingBag, TrendingUp, IndianRupee, Calendar, Map as MapIcon } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { theme } from '@/constants/theme';

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

interface LeafletMapProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  selectedCity: string;
  selectedArea: string;
}

export default function LeafletMap({ 
  properties, 
  onPropertySelect, 
  selectedCity, 
  selectedArea 
}: LeafletMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

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

  // Calculate map center based on properties or city
  const getMapCenter = () => {
    if (properties.length > 0) {
      const avgLat = properties.reduce((sum, p) => sum + p.latitude, 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + p.longitude, 0) / properties.length;
      return { lat: avgLat, lng: avgLng };
    }
    
    // Default city centers
    const cityCoordinates = {
      bangalore: { lat: 12.9716, lng: 77.5946 },
      mumbai: { lat: 19.0760, lng: 72.8777 },
      delhi: { lat: 28.6139, lng: 77.2090 },
      pune: { lat: 18.5204, lng: 73.8567 },
    };
    
    return cityCoordinates[selectedCity as keyof typeof cityCoordinates] || cityCoordinates.bangalore;
  };

  const center = getMapCenter();

  // Generate HTML for Leaflet map
  const generateMapHTML = () => {
    const propertiesJSON = JSON.stringify(properties);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Properties Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-popup {
            min-width: 250px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1c;
            margin-bottom: 8px;
            line-height: 1.3;
        }
        .popup-price {
            font-size: 18px;
            font-weight: 700;
            color: #7C3AED;
            margin-bottom: 8px;
        }
        .popup-location {
            font-size: 14px;
            color: #6a6a6a;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .popup-features {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            font-size: 12px;
            color: #1a1a1c;
        }
        .popup-feature {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .popup-aqi {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            padding: 8px;
            border-radius: 8px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        .aqi-circle {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .aqi-good { background-color: #10B981; }
        .aqi-moderate { background-color: #F59E0B; }
        .aqi-poor { background-color: #EF4444; }
        .aqi-text {
            font-size: 13px;
            font-weight: 500;
            color: #1a1a1c;
        }
        .popup-button {
            background: #7C3AED;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
        }
        .popup-button:hover {
            background: #6D28D9;
        }
        .marker-icon {
            background: #7C3AED;
            border: 3px solid white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .marker-icon.rent {
            background: #7C3AED;
        }
        .marker-icon.buy {
            background: #F59E0B;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map
        const map = L.map('map').setView([${center.lat}, ${center.lng}], ${properties.length > 0 ? 12 : 11});
        
        // Add OpenStreetMap tiles (free, no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Properties data
        const properties = ${propertiesJSON};
        
        // Helper functions for AQI
        function getAQIColorJS(aqi) {
            if (aqi <= 50) return 'aqi-good';
            if (aqi <= 100) return 'aqi-moderate';
            return 'aqi-poor';
        }
        
        function getAQILabelJS(aqi) {
            if (aqi <= 50) return 'Good';
            if (aqi <= 100) return 'Moderate';
            return 'Poor';
        }
        
        // Add markers for each property
        properties.forEach(property => {
            const marker = L.marker([property.latitude, property.longitude], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: \`<div class="marker-icon \${property.type}">🏠</div>\`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            });
            
            // Build AQI HTML if available
            let aqiHtml = '';
            if (property.aqi) {
                const aqiColorClass = getAQIColorJS(property.aqi);
                const aqiLabel = getAQILabelJS(property.aqi);
                aqiHtml = \`
                    <div class="popup-aqi">
                        <div class="aqi-circle \${aqiColorClass}"></div>
                        <span class="aqi-text">AQI: \${property.aqi} (\${aqiLabel})</span>
                    </div>
                \`;
            }
            
            const popupContent = \`
                <div class="custom-popup">
                    <div class="popup-title">\${property.title}</div>
                    <div class="popup-price">₹\${property.price.toLocaleString()}\${property.type === 'rent' ? '/month' : ''}</div>
                    <div class="popup-location">
                        📍 \${property.location}
                    </div>
                    <div class="popup-features">
                        <div class="popup-feature">🛏️ \${property.bedrooms} Bed</div>
                        <div class="popup-feature">🚿 \${property.bathrooms} Bath</div>
                        <div class="popup-feature">📐 \${property.areaSize} sqft</div>
                    </div>
                    \${aqiHtml}
                    <button class="popup-button" onclick="selectProperty('\${property.id}')">
                        View Details
                    </button>
                </div>
            \`;
            
            marker.bindPopup(popupContent, {
                maxWidth: 280,
                className: 'custom-popup-container'
            });
            
            marker.addTo(map);
        });
        
        // Function to handle property selection
        function selectProperty(propertyId) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'propertySelected',
                propertyId: propertyId
            }));
        }
        
        // Fit map to show all markers if properties exist
        if (properties.length > 0) {
            const group = new L.featureGroup(map._layers);
            if (Object.keys(group._layers).length > 0) {
                map.fitBounds(group.getBounds().pad(0.1));
            }
        }
    </script>
</body>
</html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'propertySelected') {
        const property = properties.find(p => p.id === data.propertyId);
        if (property) {
          setSelectedProperty(property);
          setShowPropertyModal(true);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
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
        <View style={styles.modalContainer}>
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
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <View style={styles.mapHeaderContent}>
          <Text style={styles.mapTitle}>
            Properties in {selectedArea !== 'any' 
              ? selectedArea.replace(/-/g, ' ')
              : selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)
            }
          </Text>
          <Text style={styles.mapSubtitle}>{properties.length} properties found</Text>
        </View>
        <View style={styles.mapStats}>
          <View style={styles.statItem}>
            <View style={[styles.statColor, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.statText}>
              {properties.filter(p => p.type === 'rent').length} Rent
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statColor, { backgroundColor: theme.colors.secondary }]} />
            <Text style={styles.statText}>
              {properties.filter(p => p.type === 'buy').length} Sale
            </Text>
          </View>
        </View>
      </View>

      {/* Leaflet Map */}
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: generateMapHTML() }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Property Types</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>For Rent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: theme.colors.secondary }]} />
            <Text style={styles.legendText}>For Sale</Text>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          💡 Tap markers to view property details
        </Text>
      </View>

      <PropertyModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapHeader: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mapHeaderContent: {
    marginBottom: theme.spacing.sm,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  mapStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
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
  mapContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  instructions: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    maxWidth: 200,
  },
  instructionsText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
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