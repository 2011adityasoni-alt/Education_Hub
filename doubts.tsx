import React from 'react';
import { EmptyState, Screen, Text } from '@/design-system';

export default function Doubts() {
  return (
    <Screen>
      <Text variant="display">Doubts</Text>
      <EmptyState icon="chatbubbles-outline" title="Doubt solving is not built yet" message="Asking teachers and tracking answers ships in Phase 5." />
    </Screen>
  );
}
