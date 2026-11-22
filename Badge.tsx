import React from 'react';
import { View } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export function Badge({ label, tone = 'brand' }: { label: string; tone?: 'brand' | 'success' | 'error' | 'neutral' }) {
  const t = useTheme();
  const c = { brand: [t.brandSoft, 'brand'], success: [t.successSoft, 'success'], error: [t.errorSoft, 'error'], neutral: [t.surfaceAlt, 'secondary'] }[tone] as [string, 'brand' | 'success' | 'error' | 'secondary'];
  return (
    <View style={{ backgroundColor: c[0], borderRadius: radius.pill, paddingHorizontal: space[2], paddingVertical: 2, alignSelf: 'flex-start' }}>
      <Text variant="caption" tone={c[1]}>{label}</Text>
    </View>
  );
}
