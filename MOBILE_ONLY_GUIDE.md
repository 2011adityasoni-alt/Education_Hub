# Building Education Hub from an Android phone only

Everything runs in the cloud: GitHub (code), GitHub Codespaces (a VS Code + terminal in Chrome),
GitHub Actions (automatic checks), Neon (PostgreSQL), Render (API hosting), Expo EAS (Android builds).
Tip: in Chrome, open menu (⋮) → **Desktop site** for GitHub and Codespaces. They are much easier to use.

Free allowances (from GitHub docs, checked Nov 2026): Codespaces 120 core-hours + 15 GB storage per month
(a 2-core machine = 60 hours); Actions 2,000 minutes per month. Stop your codespace when finished.
Neon, Render and EAS limits change often: check their pricing pages before relying on them.

## Part 1. Import the zip

1. Create a GitHub account at github.com. Turn on two-factor login (Settings → Password and authentication).
2. Tap **+ → New repository**. Name: `education-hub`. Choose **Private**. Tap **Create repository**.
3. Download `education-hub-github-ready.zip` from the chat to your phone (it lands in Downloads).
4. In your new repo tap **Add file → Upload files**, pick the zip, tap **Commit changes**.
   (GitHub cannot unzip. The next step does that.)
5. Tap **Code → Codespaces → Create codespace on main**. Wait for the editor to open.
6. Open the terminal: ☰ menu → **Terminal → New Terminal**. Paste these two lines one at a time:
   ```
   unzip -o education-hub-github-ready.zip && rm education-hub-github-ready.zip
   git add -A && git commit -m "Import Education Hub" && git push
   ```
   This ZIP is already flat (no extra outer folder), so the files land exactly where GitHub needs them.
   If the push is refused with a message about "workflow" permission, add the three files in `.github/workflows`
   through the GitHub website instead (Add file → Create new file) and paste their contents.
7. Check the repo page: you should see `apps`, `docs`, `.github`, `render.yaml`.

## Part 2. Cloud database (Neon)

1. Create an account at neon.tech → **New project**. Pick the region nearest your students.
2. Copy the connection string. Use the **direct** (non-pooled) one for now. Prisma migrations need it.
3. Keep TWO databases: one for development, one for production. Never run `seed:dev` on production.
4. Save secrets (never paste them in chat, code or a `.env` you commit):
   - Dev: GitHub profile photo → Settings → Codespaces → **Secrets** → add `DATABASE_URL`,
     `JWT_ACCESS_SECRET` (32+ random characters), `DEV_SEED_PASSWORD` (12+ characters). Grant access to this repo.
   - Production: repo → Settings → **Environments** → New environment `production` → add secret `DATABASE_URL`.
     Add a `staging` environment the same way if you want one.

To make a random secret in the Codespaces terminal: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Part 3. First verification run (this does the real install, migrate, build and tests)

1. Repo → **Actions** tab → **CI** → **Run workflow** → tick **bootstrap** → **Run workflow**.
2. It installs dependencies, validates the schema, creates the first DB migrations from your schema, applies them
   to a throwaway PostgreSQL, checks the constraints, builds, runs unit + end-to-end tests, starts the server and
   calls `/health` and `/v1/courses`, then bundles the Android app.
3. Tap the run to see each step. A red step names the problem. Copy its log text into the chat and I will fix it.
4. When done it pushes a branch `bootstrap/generated` (lockfiles, migrations, aligned Expo versions).
   Repo home → **Compare & pull request** → **Create pull request** → **Merge**. Do this before anything else.

## Part 4. Deploy the API (Render)

1. Repo → Actions → **Migrate database** → Run workflow → `production`. (Applies migrations + roles/permissions.)
2. render.com → **New → Blueprint** → pick your repo. Enter `DATABASE_URL` (production Neon string) and
   `CORS_ORIGINS` (leave empty until you have a web panel). `JWT_ACCESS_SECRET` is generated for you.
3. When live, open `https://<your-service>.onrender.com/health/ready`. It should show `"status":"ok"`.

## Part 5. Run the app on your phone while developing

1. In the Codespace terminal: `cd apps/api && npm run start:dev`. Open the **Ports** tab, long-press port 3000 →
   **Port Visibility → Public**, copy its URL.
2. New terminal: `cd apps/mobile`, create `.env` containing `EXPO_PUBLIC_API_URL=<that URL>/v1`, then
   `npx expo start --tunnel`.
3. Install **Expo Go** from Google Play and open the `exp://` link shown. If Expo Go's version does not match the
   project's SDK, skip this and use the APK in Part 6.

## Part 6. Android APK / AAB with EAS

One-time setup, in the Codespace terminal:
1. Create an account at expo.dev. Run `cd apps/mobile && npx eas-cli login`, then `npx eas-cli init`.
   Commit the change it makes to `app.json`.
2. **Before your first production build, change `com.example.eduhub` in `app.json` to your own package name
   (for example `in.yourbrand.eduhub`).** It cannot be changed after publishing on Google Play.
3. Run the first build once in the terminal so EAS can create your signing key:
   `npx eas-cli build -p android --profile preview`. Accept the prompt to generate a keystore.
4. expo.dev → your project → **Environment variables** → add `EXPO_PUBLIC_API_URL` = your Render URL + `/v1`
   for `preview` and `production` (it must start with https://).
5. expo.dev → Account settings → **Access tokens** → create one → GitHub repo → Settings → Secrets → Actions →
   add `EXPO_TOKEN`.

After that, every build is two taps: repo → **Actions → Android build (EAS) → Run workflow** → `preview`
(installable APK) or `production` (AAB for Google Play). Open the link on expo.dev and download.
New apps on Google Play must now target Android 16 (API 36); the current Expo SDK handles this, but confirm in the
EAS build log.

## Editing code on the phone

- Quick edits: open the repo in Chrome and press `.` (period) to get github.dev, a VS Code editor with no terminal.
- Running anything: use Codespaces. Never commit `.env` files (they are git-ignored).
- Every push triggers the CI workflow. Do not merge a red build.
