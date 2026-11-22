/**
 * Reference data (roles + permissions). Safe and REQUIRED in every environment, including production.
 * Idempotent: run as often as you like.
 */
import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, RoleKey } from '../src/auth/permissions';

export async function seedReference(prisma: PrismaClient): Promise<void> {
  for (const key of ALL_PERMISSIONS) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }
  const perms = await prisma.permission.findMany();
  const byKey = new Map(perms.map((p) => [p.key, p.id]));

  for (const [roleKey, permKeys] of Object.entries(ROLE_PERMISSIONS) as [RoleKey, string[]][]) {
    const role = await prisma.role.upsert({
      where: { key: roleKey },
      update: {},
      create: { key: roleKey, name: roleKey.replace('_', ' '), isSystem: true },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permKeys.map((k) => ({ roleId: role.id, permissionId: byKey.get(k)! })),
      skipDuplicates: true,
    });
  }
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedReference(prisma)
    .then(() => console.log('Reference data (roles, permissions) seeded.'))
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
