import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, DimensionValue, View, ViewStyle } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';

/** Pulsing placeholder. Pulse is skipped when the OS "reduce motion" setting is on. */
export function Skeleton({ width = '100%', height = 16, round = radius.sm, style }: { width?: DimensionValue; height?: number; round?: number; style?: ViewStyle }) {
  const t = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const [reduce, setReduce] = useState(false);

  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {}); }, []);
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.55, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity, reduce]);

  return <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[{ width, height, borderRadius: round, backgroundColor: t.skeleton, opacity }, style]} />;
}

export function CourseCardSkeleton({ horizontal }: { horizontal?: boolean }) {
  const t = useTheme();
  return (
    <View accessibilityLabel="Loading course" style={{ width: horizontal ? 260 : '100%', backgroundColor: t.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
      <Skeleton height={140} round={0} />
      <View style={{ padding: space[4], gap: space[2] }}>
        <Skeleton height={18} width="85%" />
        <Skeleton height={14} width="55%" />
        <Skeleton height={20} width="35%" style={{ marginTop: space[2] }} />
      </View>
    </View>
  );
}
