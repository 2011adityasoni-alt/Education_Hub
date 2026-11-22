import { palette as p } from '../tokens/colors';
import { darkShadows, lightShadows } from '../tokens/shadows';

/**
 * Colour rules
 *  - purple = primary actions and selection. lime = at most ONE highlight per screen (key CTA, streak).
 *  - `*Text` colours are the contrast-safe variants for text; the raw brand colours are for fills.
 */
const light = {
  mode: 'light' as const,
  bg: p.softGrey,
  surface: p.white,
  surfaceAlt: '#F9FAFB',
  border: '#E4E7EC',
  text: p.navy,
  textSecondary: p.textSecondary,
  textOnBrand: p.white,
  brand: p.purple,
  brandText: p.purpleText,
  brandSoft: p.purpleSoft,
  accent: p.lime,
  onAccent: p.navy,
  success: p.success,
  successText: p.successText,
  successSoft: p.successSoft,
  error: p.error,
  danger: p.danger,
  errorText: p.errorText,
  errorSoft: p.errorSoft,
  skeleton: '#E4E7EC',
  skeletonHighlight: '#F2F4F7',
  overlay: 'rgba(16,24,40,0.5)',
  statusBar: 'dark' as const,
  shadows: lightShadows,
};

export type Theme = Omit<typeof light, 'mode' | 'statusBar'> & { mode: 'light' | 'dark'; statusBar: 'light' | 'dark' };

const dark: Theme = {
  mode: 'dark',
  bg: p.slate900,
  surface: p.navy,
  surfaceAlt: p.slate800,
  border: p.slate700,
  text: '#F9FAFB',
  textSecondary: p.slate400,
  textOnBrand: p.white,
  brand: p.purple,
  brandText: p.purpleOnDark,
  brandSoft: p.purpleSoftDark,
  accent: p.lime,
  onAccent: p.navy,
  success: p.success,
  successText: '#32D583',
  successSoft: '#0B3B2A',
  error: p.error,
  danger: p.danger,
  errorText: '#F97066',
  errorSoft: '#4A1B17',
  skeleton: p.slate800,
  skeletonHighlight: p.slate700,
  overlay: 'rgba(0,0,0,0.65)',
  statusBar: 'light',
  shadows: darkShadows,
};

export const lightTheme: Theme = light;
export const darkTheme: Theme = dark;
