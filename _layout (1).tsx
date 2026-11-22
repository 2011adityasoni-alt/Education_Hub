import { Tabs } from 'expo-router';
import React from 'react';
import { BottomTabBar } from '@/design-system';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="learning" />
      <Tabs.Screen name="doubts" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
