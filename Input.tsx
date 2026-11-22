import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { radius } from '../tokens/radius';
import { space } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, helper, error, leftIcon, secureTextEntry, onFocus, onBlur, style, ...rest }, ref) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const border = error ? t.error : focused ? t.brand : t.border;

  return (
    <View style={{ gap: space[1] }}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View style={[styles.field, { backgroundColor: t.surface, borderColor: border, borderWidth: focused || error ? 2 : 1 }]}>
        {leftIcon ? <Ionicons name={leftIcon} size={20} color={t.textSecondary} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label ?? rest.placeholder}
          placeholderTextColor={t.textSecondary}
          selectionColor={t.brand}
          secureTextEntry={hidden}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={[typography.body, styles.input, { color: t.text }, style]}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} onPress={() => setHidden((h) => !h)} hitSlop={12}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={t.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text variant="small" tone="error" accessibilityLiveRegion="polite">{error}</Text>
        : helper ? <Text variant="small" tone="secondary">{helper}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { minHeight: 52, borderRadius: radius.md, paddingHorizontal: space[4], flexDirection: 'row', alignItems: 'center', gap: space[3] },
  input: { flex: 1, paddingVertical: space[3] },
});
