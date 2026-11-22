import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout } from '../tokens/spacing';
import { useTheme } from '../theme/ThemeProvider';

export function Screen({ children, scroll = true, refreshing, onRefresh, padded = true }: {
  children: React.ReactNode; scroll?: boolean; refreshing?: boolean; onRefresh?: () => void; padded?: boolean;
}) {
  const t = useTheme();
  const pad = padded ? { paddingHorizontal: layout.screenPadding } : null;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.statusBar} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ paddingBottom: 32, paddingTop: 12 }, pad]}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.brand} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingTop: 12 }, pad]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
