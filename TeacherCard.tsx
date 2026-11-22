import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface TeacherCardProps {
  name: string;
  subject: string;
  avatarUrl?: string | null;
  ratingAvg?: number;
  experienceYears?: number;
  isVerified?: boolean;
  onPress: () => void;
}

export function TeacherCard({ name, subject, avatarUrl, ratingAvg, experienceYears, isVerified, onPress }: TeacherCardProps) {
  const t = useTheme();
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${subject}${isVerified ? ', verified' : ''}`}
      onPress={onPress}
      style={({ pressed }) => [{ width: 148, alignItems: 'center', padding: space[4], gap: space[2], backgroundColor: t.surface, borderRadius: radius.lg,
        borderWidth: t.mode === 'dark' ? 1 : 0, borderColor: t.border, opacity: pressed ? 0.94 : 1 }, t.shadows.sm]}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: 72, height: 72, borderRadius: radius.pill }} accessibilityIgnoresInvertColors />
      ) : (
        <View style={{ width: 72, height: 72, borderRadius: radius.pill, backgroundColor: t.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="title2" tone="brand">{initials}</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
        <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{name}</Text>
        {isVerified ? <Ionicons name="checkmark-circle" size={16} color={t.successText} /> : null}
      </View>
      <Text variant="small" tone="secondary" numberOfLines={1}>{subject}</Text>
      <Text variant="caption" tone="secondary">
        {[ratingAvg ? `★ ${ratingAvg.toFixed(1)}` : null, experienceYears ? `${experienceYears} yrs` : null].filter(Boolean).join('  ')}
      </Text>
    </Pressable>
  );
}
