import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

/** Say what is missing, then give the next step. */
export function EmptyState({ icon = 'albums-outline', title, message, actionLabel, onAction }: {
  icon?: keyof typeof Ionicons.glyphMap; title: string; message: string; actionLabel?: string; onAction?: () => void;
}) {
  const t = useTheme();
  return (
    <View accessibilityRole="summary" style={{ alignItems: 'center', padding: space[8], gap: space[3] }}>
      <View style={{ width: 72, height: 72, borderRadius: radius.xl, backgroundColor: t.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={32} color={t.brandText} />
      </View>
      <Text variant="title2" style={{ textAlign: 'center' }}>{title}</Text>
      <Text tone="secondary" style={{ textAlign: 'center', maxWidth: 300 }}>{message}</Text>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}
