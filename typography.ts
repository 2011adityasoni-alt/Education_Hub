import { TextStyle } from 'react-native';

/** Plus Jakarta Sans: geometric, friendly, strong numerals (prices, scores, timers). */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export type TextVariant = 'display' | 'title1' | 'title2' | 'headline' | 'body' | 'bodyStrong' | 'small' | 'caption' | 'label';

export const typography: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  title1: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  title2: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  headline: { fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20 },
};
