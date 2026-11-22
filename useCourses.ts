import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

/** Matches GET /v1/courses (apps/api/src/courses/courses.service.ts). Move to a shared types package in Phase 5. */
export interface CourseSummary {
  id: string; slug: string; title: string; subtitle: string | null; thumbnailUrl: string | null;
  level: 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED'; language: string;
  priceInPaise: number; mrpInPaise: number; ratingAvg: number; ratingCount: number;
  teachers: { id: string; fullName: string }[];
}
export interface Paged<T> { data: T[]; meta: { page: number; limit: number; total: number } }

export function useCourses(opts: { search?: string; limit?: number } = {}) {
  const { search, limit = 20 } = opts;
  return useQuery({
    queryKey: ['courses', { search, limit }],
    queryFn: ({ signal }) => apiGet<Paged<CourseSummary>>('/courses', { search, limit }, signal),
  });
}
