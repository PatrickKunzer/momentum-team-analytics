/**
 * IONOS Analytics Dashboard - Design Tokens
 * Based on momentum-team-design system
 */

export const colors = {
  // Primary palette
  primaryDark: '#001B41',
  primaryBlue: '#003D8F',
  primaryPurple: '#560E8A',

  // Accent colors
  accentMagenta: '#D746F5',
  accentCyan: '#00D4FF',

  // Backgrounds
  bgLight: '#FAFAFA',
  bgCard: '#F4F7FA',
  bgCardHover: '#EDF2F7',
  bgSidebar: 'linear-gradient(180deg, #FDFBFF 0%, #F8F5FC 50%, #F4F7FA 100%)',

  // Text
  textPrimary: '#001B41',
  textSecondary: '#718095',
  textMuted: '#97A3B4',
  white: '#FFFFFF',

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const gradients = {
  hero: 'linear-gradient(135deg, #003D8F 0%, #560E8A 50%, #D746F5 100%)',
  text: 'linear-gradient(90deg, #095BB1 0%, #560E8A 80%)',
  card: 'linear-gradient(135deg, rgba(0, 61, 143, 0.03) 0%, rgba(86, 14, 138, 0.05) 100%)',
  cardHover: 'linear-gradient(135deg, rgba(0, 61, 143, 0.06) 0%, rgba(86, 14, 138, 0.08) 100%)',
} as const;

export const shadows = {
  soft: '0 4px 20px rgba(0, 27, 65, 0.08)',
  medium: '0 8px 32px rgba(0, 27, 65, 0.12)',
  card: '0 2px 12px rgba(0, 27, 65, 0.06)',
  glow: '0 0 40px rgba(215, 70, 245, 0.25)',
  focus: '0 0 0 4px rgba(86, 14, 138, 0.12)',
} as const;

// Chart color palette - optimized for data visualization
export const chartColors = {
  primary: ['#003D8F', '#560E8A', '#D746F5', '#00D4FF', '#10B981', '#F59E0B'],
  sequential: ['#003D8F', '#1A5AAE', '#3478CD', '#4E96EC', '#68B4FF', '#82D2FF'],
  diverging: ['#EF4444', '#F59E0B', '#FBBF24', '#A3E635', '#22C55E', '#10B981'],
  categorical: ['#003D8F', '#560E8A', '#10B981', '#F59E0B', '#EF4444', '#00D4FF'],
} as const;

// Typography
export const typography = {
  fontFamily: {
    headlines: "'Overpass', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
} as const;

// Spacing scale (in px)
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// Transitions
export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  tooltip: 400,
} as const;
