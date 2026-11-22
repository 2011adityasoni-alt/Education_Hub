# Education Hub

NestJS + Prisma (PostgreSQL) API in `apps/api`; Expo (React Native) student app in `apps/mobile`.
Developed entirely from an Android phone: see **docs/MOBILE_ONLY_GUIDE.md**.
Verification status and open blockers: **docs/VERIFICATION_REPORT.md**.

```
.github/workflows/  ci.yml (full verification) · migrate.yml (DB migrations) · eas-build.yml (APK/AAB)
.devcontainer/      Codespaces environment
apps/api/           prisma/ (schema, sql/constraints.sql, seeds) · src/ · test/ (e2e) · Dockerfile
apps/mobile/        app/ (expo-router screens) · src/design-system/ · eas.json
render.yaml         API deployment blueprint
docker-compose.yml  OPTIONAL local Postgres/Redis (not needed on a phone; use Neon)
```
Secrets are never committed. See each `.env.example`.
