import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { MapPin, X, Bed, Bath, Square, Phone, Wind, Star, ZoomIn, ZoomOut } from 'lucide-react-native';
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

interface InteractiveMapProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  selectedCity: string;
  selectedArea: string;
}

export default function InteractiveMap({ 
  properties, 
  onPropertySelect, 
  selectedCity, 
  selectedArea 
}: InteractiveMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);

  // City coordinates for map centering
  const cityCoordinates = {
    bangalore: { lat: 12.9716, lng: 77.5946, zoom: 11 },
    mumbai: { lat: 19.0760, lng: 72.8777, zoom: 11 },
    delhi: { lat: 28.6139, lng: 77.2090, zoom: 11 },
    pune: { lat: 18.5204, lng: 73.8567, zoom: 11 },
  };

  // Update map center when city changes
  useEffect(() => {
    const cityCoord = cityCoordinates[selectedCity as keyof typeof cityCoordinates];
    if (cityCoord) {
      setMapCenter({ lat: cityCoord.lat, lng: cityCoord.lng });
      setMapZoom(cityCoord.zoom);
    }
  }, [selectedCity]);

  // Focus on specific area if selected
  useEffect(() => {
    if (selectedArea !== 'any' && properties.length > 0) {
      const areaProperties = properties.filter(p => 
        p.area.toLowerCase().replace(/\s+/g, '-') === selectedArea
      );
      
      if (areaProperties.length > 0) {
        // Calculate center of area properties
        const avgLat = areaProperties.reduce((sum, p) => sum + p.latitude, 0) / areaProperties.length;
        const avgLng = areaProperties.reduce((sum, p) => sum + p.longitude, 0) / areaProperties.length;
        
        setMapCenter({ lat: avgLat, lng: avgLng });
        setMapZoom(13); // Zoom in for area view
      }
    }
  }, [selectedArea, properties]);

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
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

  const getMarkerColor = (property: Property) => {
    return property.type === 'rent' ? theme.colors.primary : theme.colors.secondary;
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `${Math.round(price / 1000)}K`;
    }
    return price.toString();
  };

  const PropertyMarker = ({ property, index }: { property: Property; index: number }) => {
    // Calculate position based on lat/lng relative to map center
    const latRange = 0.15; // Degrees of latitude to show
    const lngRange = 0.15; // Degrees of longitude to show
    
    // Calculate relative position from map center
    const relativeX = (property.longitude - mapCenter.lng) / lngRange;
    const relativeY = (mapCenter.lat - property.latitude) / latRange; // Inverted for screen coordinates
    
    // Convert to percentage positions (50% = center)
    const x = 50 + (relativeX * 40); // Scale to 40% of map width from center
    const y = 50 + (relativeY * 40); // Scale to 40% of map height from center
    
    // Keep markers within bounds
    const boundedX = Math.max(5, Math.min(95, x));
    const boundedY = Math.max(5, Math.min(95, y));
    
    return (
      <TouchableOpacity
        key={property.id}
        style={[
          styles.marker,
          {
            left: `${boundedX}%`,
            top: `${boundedY}%`,
          }
        ]}
        onPress={() => handleMarkerClick(property)}
        activeOpacity={0.8}
      >
        <View style={[styles.markerPin, { backgroundColor: getMarkerColor(property) }]}>
          <MapPin size={16} color={theme.colors.text} />
        </View>
        <View style={[styles.markerPrice, { backgroundColor: getMarkerColor(property) }]}>
          <Text style={styles.markerPriceText}>
            ₹{formatPrice(property.price)}
          </Text>
        </View>
      </TouchableOpacity>
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
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.favoriteButton}>
                  <Text style={styles.favoriteButtonText}>Save Property</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => {
                    setShowPropertyModal(false);
                    onPropertySelect(selectedProperty);
                  }}
                >
                  <Text style={styles.viewDetailsButtonText}>View Full Details</Text>
                </TouchableOpacity>
              </View>
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
            {selectedArea !== 'any' 
              ? `Properties in ${selectedArea.replace(/-/g, ' ')}`
              : `Properties in ${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}`
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

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* Map Background with Grid */}
        <View style={styles.mapBackground}>
          {/* Grid Lines for Visual Appeal */}
          <View style={styles.gridContainer}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLineVertical, { left: `${i * 10}%` }]} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: `${i * 10}%` }]} />
            ))}
          </View>
          
          {/* Map Center Indicator */}
          <View style={styles.mapCenterIndicator}>
            <Text style={styles.mapCenterText}>
              {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}
            </Text>
          </View>
        </View>

        {/* Property Markers */}
        <View style={styles.markersContainer}>
          {properties.map((property, index) => (
            <PropertyMarker key={property.id} property={property} index={index} />
          ))}
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={() => setMapZoom(Math.min(mapZoom + 1, 16))}
          >
            <ZoomIn size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={() => setMapZoom(Math.max(mapZoom - 1, 8))}
          >
            <ZoomOut size={18} color={theme.colors.text} />
          </TouchableOpacity>
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
            💡 Click on markers to view property details
          </Text>
        </View>
      </View>

      {/* Property Modal */}
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
    position: 'relative',
    backgroundColor: '#1a1a1a',
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#2a2a2e',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapCenterIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  mapCenterText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  markersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  markerPin: {
    borderRadius: 20,
    padding: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  markerPrice: {
    marginTop: 4,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    minWidth: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerPriceText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  mapControls: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  favoriteButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});