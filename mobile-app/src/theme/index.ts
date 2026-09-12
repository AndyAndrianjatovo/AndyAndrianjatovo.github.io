import { useColorScheme } from 'react-native'

const palette = {
  blue: '#0A84FF',
  red: '#FF453A',
  green: '#30D158',
  yellow: '#FFD60A',
  gray: '#8E8E93'
}

const light = {
  scheme: 'light' as 'light' | 'dark',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  border: '#E5E5EA',
  text: '#1C1C1E',
  textSecondary: '#6C6C70',
  tint: palette.blue,
  danger: palette.red,
  success: palette.green,
  overlay: 'rgba(0,0,0,0.55)',
  ...palette
}

const dark = {
  scheme: 'dark' as const,
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  border: '#38383A',
  text: '#F2F2F7',
  textSecondary: '#9A9AA0',
  tint: '#0A84FF',
  danger: palette.red,
  success: palette.green,
  overlay: 'rgba(0,0,0,0.7)',
  ...palette
}

export type Theme = typeof light

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
}

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999
}

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const },
  title: { fontSize: 22, fontWeight: '700' as const },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  subhead: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const }
}

export function useTheme(): Theme {
  const scheme = useColorScheme()
  return scheme === 'dark' ? dark : light
}
