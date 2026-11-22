import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

/** State what failed and how to fix it. Errors do not apologise. */
export function ErrorState({ title = "Couldn't load this", message, requestId, onRetry }: {
  title?: string; message: string; requestId?: string; onRetry?: () => void;
}) {
  const t = useTheme();
  return (
    <View accessibilityRole="alert" style={{ alignItems: 'center', padding: space[8], gap: space[3] }}>
      <View style={{ width: 72, height: 72, borderRadius: radius.xl, backgroundColor: t.errorSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="cloud-offline-outline" size={32} color={t.errorText} />
      </View>
      <Text variant="title2" style={{ textAlign: 'center' }}>{title}</Text>
      <Text tone="secondary" style={{ textAlign: 'center', maxWidth: 300 }}>{message}</Text>
      {requestId ? <Text variant="caption" tone="secondary" selectable>Reference: {requestId}</Text> : null}
      {onRetry ? <Button label="Try again" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}
