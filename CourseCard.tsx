import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';
import { Badge } from './Badge';
import { Text } from './Text';

export interface CourseCardProps {
  title: string;
  subtitle?: string | null;
  thumbnailUrl?: string | null;
  teacherNames: string[];
  ratingAvg: number;
  ratingCount: number;
  priceInPaise: number;
  mrpInPaise: number;
  badge?: string;
  /** 'tile' for horizontal carousels, 'row' for lists */
  layout?: 'tile' | 'row';
  onPress: () => void;
}

export const formatRupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export function CourseCard({ title, subtitle, thumbnailUrl, teacherNames, ratingAvg, ratingCount, priceInPaise, mrpInPaise, badge, layout = 'tile', onPress }: CourseCardProps) {
  const t = useTheme();
  const row = layout === 'row';
  const off = mrpInPaise > priceInPaise ? Math.round((1 - priceInPaise / mrpInPaise) * 100) : 0;
  const thumb = { width: row ? 112 : '100%' as const, height: row ? 112 : 140 };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${teacherNames.join(', ')}. ${formatRupees(priceInPaise)}`}
      onPress={onPress}
      style={({ pressed }) => [{ width: row ? '100%' : 260, flexDirection: row ? 'row' : 'column', backgroundColor: t.surface, borderRadius: radius.lg,
        overflow: 'hidden', borderWidth: t.mode === 'dark' ? 1 : 0, borderColor: t.border, opacity: pressed ? 0.94 : 1 }, t.shadows.sm]}
    >
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={thumb} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <View style={[thumb, { backgroundColor: t.brandSoft, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="play-circle" size={40} color={t.brandText} />
        </View>
      )}
      <View style={{ flex: 1, padding: space[4], gap: space[1] }}>
        {badge ? <Badge label={badge} /> : null}
        <Text variant="headline" numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="small" tone="secondary" numberOfLines={1}>{subtitle}</Text> : null}
        {teacherNames.length ? <Text variant="small" tone="secondary" numberOfLines={1}>{teacherNames.join(', ')}</Text> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
          <Ionicons name="star" size={14} color="#F79009" />
          <Text variant="caption">{ratingCount > 0 ? `${ratingAvg.toFixed(1)} (${ratingCount})` : 'New'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2], marginTop: space[1] }}>
          <Text variant="title2">{formatRupees(priceInPaise)}</Text>
          {off > 0 ? <>
            <Text variant="small" tone="secondary" style={{ textDecorationLine: 'line-through' }}>{formatRupees(mrpInPaise)}</Text>
            <Text variant="caption" tone="success">{off}% off</Text>
          </> : null}
        </View>
      </View>
    </Pressable>
  );
}
