export const Colors = {
  dark: {
    // Primary colors
    background: '#0A0A0B',
    surface: '#1A1A1C',
    surfaceElevated: '#2A2A2E',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#6A6A6A',
    
    // Accent colors
    primary: '#7C3AED',
    primaryLight: '#A855F7',
    secondary: '#F59E0B',
    accent: '#10B981',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Tab colors
    tabActive: '#7C3AED',
    tabInactive: '#6A6A6A',
    
    // Border colors
    border: '#2A2A2E',
    borderLight: '#3A3A3E',
    
    // Gradient colors
    gradientStart: '#7C3AED',
    gradientEnd: '#A855F7',
  },
  light: {
    // Primary colors
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceElevated: '#FFFFFF',
    
    // Text colors
    text: '#1A1A1C',
    textSecondary: '#6A6A6A',
    textMuted: '#9CA3AF',
    
    // Accent colors
    primary: '#7C3AED',
    primaryLight: '#A855F7',
    secondary: '#F59E0B',
    accent: '#10B981',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Tab colors
    tabActive: '#7C3AED',
    tabInactive: '#9CA3AF',
    
    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    // Gradient colors
    gradientStart: '#7C3AED',
    gradientEnd: '#A855F7',
  }
};

export const getColors = (isDark: boolean) => isDark ? Colors.dark : Colors.light;