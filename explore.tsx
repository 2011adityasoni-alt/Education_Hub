import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Input, Screen, space, Text } from '@/design-system';
import { CourseList } from '@/features/courses/CourseList';
import { useCourses } from '@/features/courses/useCourses';

export default function Explore() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [text, setText] = useState(q ?? '');
  const [debounced, setDebounced] = useState(q ?? '');
  useEffect(() => { if (q !== undefined) { setText(q); setDebounced(q); } }, [q]);
  useEffect(() => { const id = setTimeout(() => setDebounced(text.trim()), 350); return () => clearTimeout(id); }, [text]);

  const query = useCourses({ search: debounced || undefined, limit: 20 });
  return (
    <Screen refreshing={query.isRefetching} onRefresh={query.refetch}>
      <View style={{ gap: space[4] }}>
        <Text variant="display">Explore</Text>
        <Input leftIcon="search" placeholder="Search courses and subjects" value={text} onChangeText={setText} returnKeyType="search" />
        <CourseList query={query} layout="row" emptyMessage={debounced ? `Nothing matches "${debounced}". Try a subject or exam name.` : 'No courses are published yet.'} />
      </View>
    </Screen>
  );
}
