import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, CourseCard, Input, Screen, space, Text, layout } from '@/design-system';
import { CourseList, toCardProps } from '@/features/courses/CourseList';
import { useCourses } from '@/features/courses/useCourses';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

/** Phase 2 home: greeting, search, popular courses from the live API.
 *  Streak, live classes and progress need sign-in and arrive in Phases 4-5. */
export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const query = useCourses({ limit: 6 });
  const search = () => router.push({ pathname: '/explore', params: q.trim() ? { q: q.trim() } : {} });
  const items = query.data?.data ?? [];

  return (
    <Screen refreshing={query.isRefetching} onRefresh={query.refetch}>
      <View style={{ gap: space[5] }}>
        <View style={{ gap: space[1] }}>
          <Text variant="display">{greeting()}</Text>
          <Text tone="secondary">What do you want to learn today?</Text>
        </View>
        <Input leftIcon="search" placeholder="Search courses and subjects" value={q} onChangeText={setQ} returnKeyType="search" onSubmitEditing={search} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="title2">Popular courses</Text>
          <Button label="See all" variant="ghost" size="sm" onPress={() => router.push('/explore')} />
        </View>
        {items.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -layout.screenPadding }}
            contentContainerStyle={{ paddingHorizontal: layout.screenPadding, paddingBottom: space[2], gap: space[4] }}>
            {items.map((c) => (
              <CourseCard key={c.id} {...toCardProps(c)} onPress={() => router.push({ pathname: '/explore', params: { q: c.title } })} />
            ))}
          </ScrollView>
        ) : (
          <CourseList query={query} layout="tile" emptyMessage="New courses are on the way. Check back soon." />
        )}
      </View>
    </Screen>
  );
}
