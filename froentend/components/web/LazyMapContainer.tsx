import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  aqi?: number;
  ownerContact?: string;
  type: 'rent' | 'buy';
}

interface LazyMapContainerProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
}

export default function LazyMapContainer({ properties, onPropertySelect }: LazyMapContainerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>🗺️</Text>
        <Text style={styles.placeholderTitle}>Interactive Map</Text>
        <Text style={styles.placeholderSubtitle}>
          Map view showing {properties.length} properties
        </Text>
        <Text style={styles.placeholderNote}>
          Click on property markers to view details
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  placeholderNote: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});