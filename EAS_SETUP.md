# EAS Build & CI/CD Setup Guide

This guide walks you through activating the CI/CD pipeline and shipping the first TestFlight/internal preview build.

---

## Prerequisites

- Expo account at [expo.dev](https://expo.dev) (free)
- Apple Developer account (for TestFlight)
- EAS CLI: `npm install -g eas-cli`

---

## Step 1 — Link the project to EAS

```bash
cd ~/Desktop/quick-decision
eas login          # log in to your Expo account
eas init           # creates/links an EAS project; copies projectId into app.json automatically
```

After `eas init`, your `app.json` will have the real `extra.eas.projectId` and the `updates.url` filled in.

---

## Step 2 — Install expo-updates

```bash
npx expo install expo-updates
```

---

## Step 3 — Set up environment files

```bash
cp .env.staging.example .env.staging
cp .env.production.example .env.production
# Fill in the real Supabase URLs and keys
```

---

## Step 4 — First preview build (iOS + Android)

```bash
# Make sure .env.staging is populated, then:
eas build --platform all --profile preview
```

- iOS: produces a `.ipa` uploaded to TestFlight internal testing automatically.
- Android: produces a `.apk` for direct install.
- EAS will walk you through Apple credentials on first run.

To share the build URL with beta testers:
```bash
eas build:list --profile preview --limit 1
```

---

## Step 5 — Configure GitHub Actions secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret name                  | Value                                     |
|------------------------------|-------------------------------------------|
| `EXPO_TOKEN`                 | Your Expo access token (expo.dev → Account → Access Tokens) |
| `STAGING_SUPABASE_URL`       | Staging Supabase project URL              |
| `STAGING_SUPABASE_ANON_KEY`  | Staging anon key                          |
| `PROD_SUPABASE_URL`          | Production Supabase project URL           |
| `PROD_SUPABASE_ANON_KEY`     | Production anon key                       |

---

## Step 6 — Fill in Apple/Android submit credentials (for production)

Edit `eas.json` and replace:
- `YOUR_APPLE_TEAM_ID` → your 10-character Apple Team ID
- `YOUR_ASC_APP_ID` → App Store Connect app numeric ID
- For Android: download your Google Play service account JSON and put it at `./google-service-account.json`

---

## CI/CD Behaviour

| Event                        | What happens                                      |
|------------------------------|---------------------------------------------------|
| Push to `main`               | Lint + OTA update (preview channel) + preview build |
| PR to `main`                 | Lint only                                         |
| Manual workflow dispatch     | Choose `preview` or `production` build            |

---

## OTA Updates

After the initial TestFlight build is installed, any subsequent push to `main` sends an OTA update — users get the new JS bundle on next app launch **without an App Store review**.

To manually publish an OTA update:
```bash
eas update --channel preview --message "Fix: question timer bug"
```

---

## Version Management

- **Semantic version** (`1.0.0`) lives in `app.json → expo.version`.
- **Build number** (`ios.buildNumber`, `android.versionCode`) is auto-incremented by EAS on each production build because `eas.json → build.production.autoIncrement: true`.
- Bump the semantic version before each App Store release by editing `app.json`.
