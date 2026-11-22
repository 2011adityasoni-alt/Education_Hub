import { Platform, ViewStyle } from 'react-native';

type Elevation = 'none' | 'sm' | 'md' | 'lg';
const make = (o: number, r: number, y: number, elevation: number): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: { shadowColor: '#101828', shadowOpacity: o, shadowRadius: r, shadowOffset: { width: 0, height: y } },
    default: { elevation },
  })!;

/** Light mode uses soft navy-tinted shadows. Dark mode drops shadows and relies on borders/surface steps. */
export const lightShadows: Record<Elevation, ViewStyle> = {
  none: {},
  sm: make(0.06, 6, 2, 1),
  md: make(0.1, 14, 6, 3),
  lg: make(0.16, 28, 12, 8),
};
export const darkShadows: Record<Elevation, ViewStyle> = { none: {}, sm: {}, md: {}, lg: {} };
