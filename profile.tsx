import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Button, radius, Screen, space, Text, ThemeMode, useThemeContext } from '@/design-system';

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function Profile() {
  const { theme: t, mode, setMode } = useThemeContext();
  const router = useRouter();
  return (
    <Screen>
      <View style={{ gap: space[5] }}>
        <Text variant="display">Profile</Text>
        <View style={{ gap: space[2] }}>
          <Text variant="headline">Appearance</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', backgroundColor: t.surface, borderRadius: radius.pill, padding: 4, borderWidth: 1, borderColor: t.border }}>
            {MODES.map((m) => {
              const on = mode === m.value;
              return (
                <Pressable key={m.value} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setMode(m.value)}
                  style={{ flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: on ? t.brand : 'transparent' }}>
                  <Text variant="label" tone={on ? 'onBrand' : 'secondary'}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        {__DEV__ ? <Button label="Open design gallery" variant="secondary" icon="color-palette-outline" onPress={() => router.push('/dev/gallery')} /> : null}
      </View>
    </Screen>
  );
}
