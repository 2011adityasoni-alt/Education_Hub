import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { CourseCard, CourseCardSkeleton, EmptyState, ErrorState, space } from '@/design-system';
import { CourseSummary } from './useCourses';

export function toCardProps(c: CourseSummary) {
  return { title: c.title, subtitle: c.subtitle, thumbnailUrl: c.thumbnailUrl, teacherNames: c.teachers.map((t) => t.fullName),
    ratingAvg: c.ratingAvg, ratingCount: c.ratingCount, priceInPaise: c.priceInPaise, mrpInPaise: c.mrpInPaise };
}

/** Handles loading / error / empty / success for a course query. */
export function CourseList({ query, layout, emptyMessage }: {
  query: { isPending: boolean; isError: boolean; error: unknown; data?: { data: CourseSummary[] }; refetch: () => void };
  layout: 'row' | 'tile'; emptyMessage: string;
}) {
  const router = useRouter();
  if (query.isPending) return <View style={{ gap: space[4] }}>{[0, 1, 2].map((i) => <CourseCardSkeleton key={i} horizontal={layout === 'tile'} />)}</View>;
  if (query.isError) {
    const e = query.error instanceof ApiError ? query.error : null;
    return <ErrorState message={e?.message ?? 'Check your connection and try again.'} requestId={e?.requestId} onRetry={query.refetch} />;
  }
  const items = query.data?.data ?? [];
  if (!items.length) return <EmptyState icon="search-outline" title="No courses found" message={emptyMessage} />;
  // Course detail screen ships in Phase 5; until then cards are read-only (no dead navigation).
  return <View style={{ gap: space[4] }}>{items.map((c) => <CourseCard key={c.id} layout={layout} {...toCardProps(c)} onPress={() => router.push({ pathname: '/explore', params: { q: c.title } })} />)}</View>;
}
