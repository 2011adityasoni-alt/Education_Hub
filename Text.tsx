import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typography, TextVariant } from '../tokens/typography';
import { Theme } from '../theme/themes';
import { useTheme } from '../theme/ThemeProvider';

type Tone = 'default' | 'secondary' | 'brand' | 'success' | 'error' | 'onBrand' | 'onAccent';
export interface TextProps extends RNTextProps { variant?: TextVariant; tone?: Tone }

const toneColor = (t: Theme, tone: Tone) =>
  ({ default: t.text, secondary: t.textSecondary, brand: t.brandText, success: t.successText, error: t.errorText, onBrand: t.textOnBrand, onAccent: t.onAccent })[tone];

export function Text({ variant = 'body', tone = 'default', style, ...rest }: TextProps) {
  const theme = useTheme();
  return <RNText {...rest} style={[typography[variant], { color: toneColor(theme, tone) }, style]} />;
}
