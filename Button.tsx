import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

/** `accent` (lime) is reserved for the single most important action on a screen, e.g. "Enrol now". */
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 36, md: 48, lg: 56 };

export function Button({ label, variant = 'primary', size = 'md', loading, icon, fullWidth, disabled, onPress, ...rest }: ButtonProps) {
  const t = useTheme();
  const inactive = disabled || loading;
  const look = {
    primary: { bg: t.brand, fg: t.textOnBrand, border: 'transparent' },
    accent: { bg: t.accent, fg: t.onAccent, border: 'transparent' },
    secondary: { bg: 'transparent', fg: t.text, border: t.border },
    ghost: { bg: 'transparent', fg: t.brandText, border: 'transparent' },
    danger: { bg: t.danger, fg: '#FFFFFF', border: 'transparent' },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      hitSlop={size === 'sm' ? 8 : 0}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHT[size], backgroundColor: look.bg, borderColor: look.border, opacity: inactive ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        fullWidth && { alignSelf: 'stretch' },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={look.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={look.fg} /> : null}
          <Text style={[size === 'sm' ? typography.caption : typography.label, { color: look.fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: space[6], alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
