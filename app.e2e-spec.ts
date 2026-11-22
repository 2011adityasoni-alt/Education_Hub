/**
 * End-to-end tests against a REAL PostgreSQL database (DATABASE_URL) that has been migrated and
 * seeded (`npm run seed:reference && ALLOW_DEV_SEED=true npm run seed:dev`). Runs in CI.
 * Uses the same pipeline as production (configureApp: prefix, validation, helmet) and the real guards.
 */
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { Public, RequirePermissions, Roles } from '../src/auth/decorators';
import { TokenService } from '../src/auth/token.service';
import { PrismaService } from '../src/prisma/prisma.service';

@Controller('__probe')
class GuardProbeController {
  @Get('admin') @Roles('admin') admin() { return { ok: true }; }
  @Get('refund') @RequirePermissions('payment:refund') refund() { return { ok: true }; }
  @Get('open') @Public() open() { return { ok: true }; }
}

describe('API (e2e, real database)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokens: TokenService;
  const tokenFor = async (email: string) => {
    const u = await prisma.user.findUniqueOrThrow({ where: { email } });
    return { id: u.id, token: await tokens.signAccess(u.id, u.tokenVersion) };
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule], controllers: [GuardProbeController] }).compile();
    app = mod.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    tokens = app.get(TokenService);
  });
  afterAll(async () => { await app.close(); });

  describe('health', () => {
    it('GET /health/live', () => request(app.getHttpServer()).get('/health/live').expect(200, { status: 'ok' }));
    it('GET /health/ready checks the database', async () => {
      const r = await request(app.getHttpServer()).get('/health/ready').expect(200);
      expect(r.body.checks.database).toBe('up');
    });
  });

  describe('public course catalogue', () => {
    it('returns published courses with only public fields', async () => {
      const r = await request(app.getHttpServer()).get('/v1/courses?limit=5').expect(200);
      expect(Array.isArray(r.body.data)).toBe(true);
      expect(r.body.meta.total).toBeGreaterThanOrEqual(1);
      const allowed = ['id','slug','title','subtitle','thumbnailUrl','level','language','priceInPaise','mrpInPaise','ratingAvg','ratingCount','teachers'];
      for (const c of r.body.data) expect(Object.keys(c).sort()).toEqual([...allowed].sort());
      const raw = JSON.stringify(r.body);
      for (const secret of ['passwordHash', 'correctOptionIds', 'explanation', 'numericAnswer', 'tokenVersion', '@eduhub.test']) {
        expect(raw).not.toContain(secret);
      }
    });
    it('searches', async () => {
      const r = await request(app.getHttpServer()).get('/v1/courses?search=physics').expect(200);
      expect(r.body.data.length).toBeGreaterThanOrEqual(1);
    });
    it('rejects out-of-range and unknown query params with a structured 400', async () => {
      const a = await request(app.getHttpServer()).get('/v1/courses?limit=1000').expect(400);
      expect(a.body.code).toBe('VALIDATION_FAILED');
      await request(app.getHttpServer()).get('/v1/courses?isAdmin=true').expect(400);
      await request(app.getHttpServer()).get('/v1/courses?categoryId=not-a-uuid').expect(400);
    });
    it('does not return unpublished courses', async () => {
      const draft = await prisma.course.findFirst({ where: { status: { not: 'PUBLISHED' } } });
      if (!draft) return;
      const r = await request(app.getHttpServer()).get('/v1/courses?limit=50').expect(200);
      expect(r.body.data.map((c: { id: string }) => c.id)).not.toContain(draft.id);
    });
  });

  describe('authentication', () => {
    it('401 without a token', () => request(app.getHttpServer()).get('/v1/users/me').expect(401));
    it('401 with a garbage token', () => request(app.getHttpServer()).get('/v1/users/me').set('Authorization', 'Bearer abc.def.ghi').expect(401));
    it('200 for a valid token, without sensitive fields', async () => {
      const { token } = await tokenFor('student1@eduhub.test');
      const r = await request(app.getHttpServer()).get('/v1/users/me').set('Authorization', `Bearer ${token}`).expect(200);
      expect(r.body.roles).toEqual(['student']);
      expect(JSON.stringify(r.body)).not.toContain('passwordHash');
    });
    it('revokes tokens when tokenVersion changes', async () => {
      const { id, token } = await tokenFor('student2@eduhub.test');
      await prisma.user.update({ where: { id }, data: { tokenVersion: { increment: 1 } } });
      await request(app.getHttpServer()).get('/v1/users/me').set('Authorization', `Bearer ${token}`).expect(401);
    });
    it('rejects tokens of suspended users', async () => {
      const { id, token } = await tokenFor('student1@eduhub.test');
      await prisma.user.update({ where: { id }, data: { status: 'SUSPENDED' } });
      try { await request(app.getHttpServer()).get('/v1/users/me').set('Authorization', `Bearer ${token}`).expect(401); }
      finally { await prisma.user.update({ where: { id }, data: { status: 'ACTIVE' } }); }
    });
  });

  describe('authorization guards', () => {
    const get = (path: string, token?: string) => { const r = request(app.getHttpServer()).get(path); return token ? r.set('Authorization', `Bearer ${token}`) : r; };
    it('public route needs no token', () => get('/v1/__probe/open').expect(200));
    it('protected route without token = 401', () => get('/v1/__probe/admin').expect(401));
    it('student and teacher cannot use admin-only route', async () => {
      await get('/v1/__probe/admin', (await tokenFor('student1@eduhub.test')).token).expect(403);
      await get('/v1/__probe/admin', (await tokenFor('teacher.physics@eduhub.test')).token).expect(403);
    });
    it('permission check: teacher lacks payment:refund', async () => {
      await get('/v1/__probe/refund', (await tokenFor('teacher.physics@eduhub.test')).token).expect(403);
    });
    it('super_admin passes both', async () => {
      const { token } = await tokenFor('admin@eduhub.test');
      await get('/v1/__probe/admin', token).expect(200);
      await get('/v1/__probe/refund', token).expect(200);
    });
  });

  describe('errors', () => {
    it('unknown route returns the structured error body with a request id', async () => {
      const r = await request(app.getHttpServer()).get('/v1/nope').expect(404);
      expect(r.body).toEqual(expect.objectContaining({ statusCode: 404, code: expect.any(String), requestId: expect.any(String) }));
      expect(JSON.stringify(r.body)).not.toMatch(/stack|prisma|node_modules/i);
    });
  });
});
