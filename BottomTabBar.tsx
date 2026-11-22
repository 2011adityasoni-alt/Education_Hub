import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '../tokens/radius';
import { layout, space } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;
/** Structural subset of React Navigation's BottomTabBarProps, so we do not depend on a transitive package's types. */
interface BottomTabBarProps {
  state: { index: number; routes: { key: string; name: string; params?: object }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
}
/** Home | Explore | My Learning | Doubts | Profile */
const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'Home', icon: 'home-outline', active: 'home' },
  explore: { label: 'Explore', icon: 'compass-outline', active: 'compass' },
  learning: { label: 'My Learning', icon: 'book-outline', active: 'book' },
  doubts: { label: 'Doubts', icon: 'chatbubbles-outline', active: 'chatbubbles' },
  profile: { label: 'Profile', icon: 'person-outline', active: 'person' },
};

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border,
      paddingBottom: insets.bottom, paddingTop: space[2], minHeight: layout.tabBarHeight + insets.bottom }, t.shadows.md]}>
      {state.routes.map((route, index) => {
        const cfg = TABS[route.name];
        if (!cfg) return null;
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={cfg.label}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 2, minHeight: layout.minTouchTarget }}
          >
            <View style={{ paddingHorizontal: space[4], paddingVertical: space[1], borderRadius: radius.pill, backgroundColor: focused ? t.brandSoft : 'transparent' }}>
              <Ionicons name={focused ? cfg.active : cfg.icon} size={22} color={focused ? t.brandText : t.textSecondary} />
            </View>
            <Text variant="caption" tone={focused ? 'brand' : 'secondary'}>{cfg.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
