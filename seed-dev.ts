/**
 * DEVELOPMENT / STAGING ONLY. Refuses to run in production.
 * Creates clearly fake users on the reserved `.test` TLD. No credentials are hardcoded:
 * the shared password for the fake accounts comes from DEV_SEED_PASSWORD.
 */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { seedReference } from './seed-reference';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('seed:dev refuses to run with NODE_ENV=production');
  if (process.env.ALLOW_DEV_SEED !== 'true') throw new Error('Set ALLOW_DEV_SEED=true to confirm DATABASE_URL is a disposable dev database');
  const pw = process.env.DEV_SEED_PASSWORD;
  if (!pw || pw.length < 12) throw new Error('Set DEV_SEED_PASSWORD (min 12 chars) in apps/api/.env');

  await seedReference(prisma);
  const passwordHash = await argon2.hash(pw);
  const role = async (key: string) => (await prisma.role.findUniqueOrThrow({ where: { key } })).id;

  const mkUser = async (email: string, fullName: string, roleKey: string) =>
    prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email, fullName, passwordHash, status: 'ACTIVE', emailVerifiedAt: new Date(),
        roles: { create: { roleId: await role(roleKey) } },
      },
    });

  const admin = await mkUser('admin@eduhub.test', 'Dev Admin', 'super_admin');
  await prisma.adminProfile.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });

  const teachers = [];
  for (const [email, name, subjects] of [
    ['teacher.physics@eduhub.test', 'Dev Physics Teacher', ['Physics']],
    ['teacher.chem@eduhub.test', 'Dev Chemistry Teacher', ['Chemistry']],
  ] as const) {
    const u = await mkUser(email, name, 'teacher');
    teachers.push(await prisma.teacherProfile.upsert({
      where: { userId: u.id }, update: {},
      create: { userId: u.id, headline: `${subjects[0]} faculty (dev data)`, subjects: [...subjects], isVerified: true, experienceYears: 8 },
    }));
  }

  for (const [email, name] of [['student1@eduhub.test', 'Dev Student One'], ['student2@eduhub.test', 'Dev Student Two']]) {
    const u = await mkUser(email, name, 'student');
    await prisma.studentProfile.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id, examTarget: 'JEE', city: 'Pune', state: 'Maharashtra' } });
  }

  const jee = await prisma.category.upsert({ where: { slug: 'jee' }, update: {}, create: { name: 'JEE', slug: 'jee', sortOrder: 1 } });
  await prisma.category.upsert({ where: { slug: 'neet' }, update: {}, create: { name: 'NEET', slug: 'neet', sortOrder: 2 } });

  const course = await prisma.course.upsert({
    where: { slug: 'dev-jee-physics-foundation' }, update: {},
    create: {
      categoryId: jee.id, createdById: admin.id, title: 'JEE Physics Foundation (dev data)', slug: 'dev-jee-physics-foundation',
      subtitle: 'Mechanics to Electrostatics', level: 'FOUNDATION', examTarget: 'JEE',
      priceInPaise: 249900, mrpInPaise: 499900, status: 'PUBLISHED', publishedAt: new Date(),
      teachers: { create: [{ teacherId: teachers[0].id, isLead: true }] },
      lessons: { create: [{ title: 'Units and measurements', position: 1, isPublished: true, isFreePreview: true }] },
    },
  });

  const existingTest = await prisma.test.findFirst({ where: { courseId: course.id, title: 'Dev Physics Mock 1' } });
  if (!existingTest) {
    const test = await prisma.test.create({
      data: { courseId: course.id, createdById: teachers[0].id, title: 'Dev Physics Mock 1', durationMinutes: 30, totalMarks: 20, status: 'PUBLISHED' },
    });
    for (let i = 1; i <= 5; i++) {
      const q = await prisma.question.create({
        data: { testId: test.id, position: i, subject: 'Physics', stem: `Dev question ${i}?`, marks: 4, negativeMarks: 1,
          options: { create: [1, 2, 3, 4].map((n) => ({ position: n, label: `Option ${n}` })) } },
        include: { options: true },
      });
      await prisma.questionKey.create({ data: { questionId: q.id, correctOptionIds: [q.options[(i - 1) % 4].id], explanation: 'Dev explanation.' } });
    }
  }

  await prisma.coupon.upsert({
    where: { code: 'DEVWELCOME10' }, update: {},
    create: { code: 'DEVWELCOME10', discountType: 'PERCENT', discountValue: 10, validFrom: new Date(), validUntil: new Date(Date.now() + 90 * 864e5) },
  });

  await prisma.learningCentre.upsert({
    where: { slug: 'dev-centre-pune' }, update: {},
    create: { name: 'Dev Learning Centre', slug: 'dev-centre-pune', addressLine: '1 Test Road', city: 'Pune', state: 'Maharashtra',
      pincode: '411001', latitude: 18.5204, longitude: 73.8567, status: 'ACTIVE', facilities: ['Library', 'Wi-Fi'] },
  });

  console.log('Dev seed complete (fake data, *.eduhub.test users).');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
