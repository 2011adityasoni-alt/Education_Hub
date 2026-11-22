import React from 'react';
import { EmptyState, Screen, Text } from '@/design-system';

export default function Learning() {
  return (
    <Screen>
      <Text variant="display">My Learning</Text>
      <EmptyState icon="book-outline" title="Sign-in is not built yet" message="Enrolled courses and progress appear here once sign-in and enrolment ship (Phases 4 and 5)." />
    </Screen>
  );
}
