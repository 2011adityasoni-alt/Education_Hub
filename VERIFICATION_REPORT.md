# Verification report: Phase 2 + 3 stabilization

Environment: sandbox with NO internet, NO PostgreSQL, NO Docker (npm registry returned HTTP 000; `npm ping` failed).
Consequence: nothing that needs `npm install` or a database was executed. Those steps are wired into
`.github/workflows/ci.yml` and run on GitHub's servers when you start it from your phone (see MOBILE_ONLY_GUIDE.md).

## 1. Passed (actually executed in the sandbox)

| Check | Result |
|---|---|
| Prisma schema static check: braces, every relation has a back-relation, every FK is `@db.Uuid` with explicit `onDelete` | PASS (48 models, 30 enums, 85 FKs) |
| TypeScript syntax parse of all API + mobile files (`tsc`, syntax errors only) | PASS (0 syntax errors) |
| JSON validity: package.json ×2, tsconfig, app.json, eas.json, devcontainer, jest-e2e | PASS |
| YAML validity: 3 workflows + render.yaml | PASS |
| WCAG AA contrast of all 23 text/background pairs (computed) | PASS after fixes (see §3) |
| Secret scan (keys, private keys, DB URLs with passwords) | PASS, none found |
| Env vars used in code are all documented in `.env.example` | PASS |
| Answer-key exposure scan: 22 non-test API files, none reference QuestionKey/correct answers | PASS (static stand-in for the jest guard test) |

## 2. NOT verified (could not run here; each has a CI step)

| Not verified | Where it will be proven |
|---|---|
| `npm install` and version compatibility of API and mobile packages | CI: install steps |
| `prisma validate`, `prisma generate` | CI: "prisma validate" + postinstall |
| Initial migration generated from the schema; migration applies to PostgreSQL | CI bootstrap + "apply migrations" |
| Extra SQL (13 CHECKs, partial index, audit trigger) applies and behaves | CI: "verify database objects" (inserts that must fail) |
| Prisma migrate drift (partial/expression indexes may confuse it) | CI: drift check (informational) |
| `tsc` type-check, `nest build` | CI |
| Unit tests (env, guard, filter, answer-key guard) | CI: `npm test` |
| End-to-end: /health, /v1/courses, auth, roles, permissions, revocation, validation, error shape | CI: `npm run test:e2e` (real DB) |
| Built server boots and answers over HTTP | CI: smoke step |
| Seed scripts | CI: seed step (also exercised by e2e) |
| Expo SDK alignment, `expo-doctor`, type-check, Android bundle | CI mobile steps |
| Theme switching, navigation, loading/empty/error UI on a device | NOT automated. Manual check on your phone (Part 5). No UI tests exist yet |
| Rate limiting actually throttles | No test yet |
| EAS APK/AAB build | eas-build.yml |

No result in section 2 should be assumed to pass.

## 3. Issues found and fixed

1. **Expo SDK 52 is obsolete** (current stable is SDK 57; SDK 58 beta/stable is arriving). Google Play requires new apps and
   updates to target Android 16 / API 36 since 31 Aug 2026, which SDK 52 cannot satisfy. Bumped to `~57.0.0`; the CI
   bootstrap run executes `expo install --fix` to align every package. *Unverified until CI runs.*
2. **Answer-key guard test would have failed** on a harmless `role.key` select (found by running its logic). Narrowed.
3. **Rate limiting behind a proxy**: on Render all users would share one IP bucket. Added `TRUST_PROXY_HOPS`.
4. **Seed could run on any database**. `seed:dev` now also requires `ALLOW_DEV_SEED=true`.
5. **JWT TTL typing risk** with newer jsonwebtoken types: TTL is now `JWT_ACCESS_TTL_SECONDS` (60–3600). Preventive.
6. **`prisma generate` was not automatic**; tests would fail on a fresh install. Added `postinstall`.
7. **Two competing ways to create the constraints migration** replaced by one: CI generates `init` from the real schema and
   installs `prisma/sql/constraints.sql` as a second migration. (Not hand-written: avoids drift.)
8. **Missing `expo-linking`** (required by expo-router); removed a type import from a transitive package.
9. **No e2e tests / shared bootstrap**: extracted `configureApp()` so tests run the production pipeline; added 15 e2e tests.
10. **CI shell pitfalls** (`&&` under `set -e`, `kill %1`) fixed before first run.
11. Earlier: four colour combinations failed WCAG AA and were corrected (purple text, success/error text, danger button).

## 4. Security review (code inspection; not penetration-tested)

| Area | Status |
|---|---|
| Authentication | Foundation only. Access-token verify + DB lookup on every request (status, deletedAt, tokenVersion), so suspension and revocation are immediate. **No login/OTP/refresh endpoints yet.** |
| Authorization | Deny-by-default (global guards; `@Public()` opt-out). Roles + ALL-of permissions; super_admin bypass is explicit. Ownership/enrollment checks are not written yet (no such endpoints exist). |
| Sensitive data | Explicit `select` everywhere; `passwordHash` never selected; error filter hides internals; pino redacts Authorization/cookies. Logs include URL query strings (search terms): low risk. |
| Answer keys | Separate table; static guard test; DB-role separation documented but NOT applied. |
| Validation | Global whitelist + forbidNonWhitelisted + transform; DTO bounds on public query. Search `%`/`_` wildcards not escaped: low. |
| Rate limiting | Global 100/min/IP, in-memory (single instance only). No stricter limit yet for OTP/login (Phase 4). |
| Secrets | `.env` git-ignored; no secrets in repo; production refuses placeholder JWT secret; CI uses throwaway credentials. |
| Transport | Helmet on; CORS off unless origins listed; Swagger off in production. Release Android builds block plain http: the API must be https. |

## 5. Production blockers (must close before real students/payments)

1. No sign-in (Phase 4); no endpoint beyond catalogue + `/users/me`.
2. CI bootstrap not yet run, so no lockfiles and no committed migrations; first green CI run is required.
3. Expo SDK upgrade unverified; confirm built app targets API 36.
4. Placeholder Android package `com.example.eduhub` (permanent once on Play).
5. Backups and restore not configured or tested (database provider setting).
6. QuestionKey database-role separation not applied.
7. Rate limiting is in-memory; needs Redis before more than one instance.
8. No monitoring/error tracking, no uptime alert.
9. `npm audit` result unknown.
10. Privacy policy, terms, and consent flows for minors (India's data-protection law) need legal review before launch.
11. No automated mobile UI tests.

## 6. Pending (next work)

CI bootstrap + fix whatever it reports; Phase 4 (OTP login, refresh rotation, per-route throttles, secure token storage via
expo-secure-store); Redis throttler; mobile tests; shared types package.

## 7. Commands

Everything runs from the phone. See `docs/MOBILE_ONLY_GUIDE.md`. In a Codespace terminal the equivalent of CI is:
```
cd apps/api && npm install && npx prisma validate && npx prisma migrate deploy && npx tsc --noEmit \
  && npm run build && npm test && npm run seed:reference && ALLOW_DEV_SEED=true npm run seed:dev && npm run test:e2e
cd ../mobile && npm install && npx expo install --fix && npx tsc --noEmit && npx expo export --platform android
```
