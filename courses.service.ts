import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListCoursesQueryDto } from './dto/list-courses.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(q: ListCoursesQueryDto) {
    const where: Prisma.CourseWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
      ...(q.categoryId ? { categoryId: q.categoryId } : {}),
      ...(q.search
        ? { OR: [{ title: { contains: q.search, mode: 'insensitive' } }, { subtitle: { contains: q.search, mode: 'insensitive' } }] }
        : {}),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        orderBy: [{ enrollmentCount: 'desc' }, { publishedAt: 'desc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        // Explicit select: catalogue responses expose only public fields.
        select: {
          id: true, slug: true, title: true, subtitle: true, thumbnailUrl: true, level: true, language: true,
          priceInPaise: true, mrpInPaise: true, ratingAvg: true, ratingCount: true,
          teachers: { select: { teacher: { select: { id: true, user: { select: { fullName: true } } } } } },
        },
      }),
    ]);

    return {
      data: rows.map(({ teachers, ratingAvg, ...c }) => ({
        ...c,
        ratingAvg: Number(ratingAvg),
        teachers: teachers.map((t) => ({ id: t.teacher.id, fullName: t.teacher.user.fullName })),
      })),
      meta: { page: q.page, limit: q.limit, total },
    };
  }
}
