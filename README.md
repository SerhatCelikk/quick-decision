# Quick Decision

A fast-paced two-choice trivia game built with React Native Expo + Supabase.

## v1.1 Features

- **🏆 Achievements & Badges** — 15 unlockable badges for gameplay milestones, multiplayer wins, referrals, seasonal events, and premium membership. Badge gallery in Profile → Achievements.
- **🌸 Seasonal Events** — Spring Knowledge Sprint (April 2026): 30 spring-themed questions with milestone badges and an event leaderboard. Event banner on home screen.
- **👑 Premium Subscription** — Paywall screen with monthly ($4.99) and yearly ($35.99) plans. Removes ads, unlocks unlimited energy, exclusive badges, and early access. Ready for StoreKit 2 / Play Billing activation.
- **⚔️ Real-time Multiplayer** — Matchmaking lobby with ELO rating (Bronze/Silver/Gold/Diamond ranks), Quick Match, live battle against a random opponent (10 questions, 8s each), real-time score sync via Supabase Realtime, and results with ELO change.
- **🤝 Referral System** — Unique referral codes for every user. Share via native share sheet. 50 coin reward for both referrer and referee on successful join.
- **🇹🇷 i18n — Turkish & English** — Full Turkish translation across all screens. Language selector in Profile tab, persisted across sessions.
- **⭐ In-App Review** — Triggers native App Store / Play Store review prompt after 5 successful level completions (expo-store-review, added to next EAS build).
- **💀 Loading & Error States** — `LoadingSkeleton` shimmer component and `ErrorView` with retry used across all new v1.1 screens.

## Getting Started

```bash
npm install
npm start        # Expo dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## Testing

### Unit & Integration Tests (Jest + React Native Testing Library)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test files are in `src/__tests__/`:

| File | What it covers |
|------|----------------|
| `constants.test.ts` | `getLevelConfig`, `PASS_THRESHOLD`, `COLORS` |
| `gameLogic.test.ts` | Score calculation, streak bonuses, pass/fail rules, timer expiry |
| `gameService.test.ts` | Supabase service calls, offline AsyncStorage queue, flush on re-auth |
| `useLevelProgress.test.ts` | Hook lifecycle, submit + refresh, null result path |
| `HomeScreen.test.tsx` | Level display, Play Now navigation, frontier message |
| `LevelCompletionScreen.test.tsx` | Pass/fail UI, stat display, CTA navigation |
| `authFlow.test.ts` | useAuth hook contract |

Coverage target: **80%+ on core game logic** (constants, gameService, hooks).

### E2E Tests (Maestro)

E2E flows require a running Expo dev build on a simulator or device.

**Install Maestro:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Run all flows:**
```bash
maestro test .maestro/flows/
```

**Run a single flow:**
```bash
maestro test .maestro/flows/01_home_to_game.yaml
```

Flows in `.maestro/flows/`:

| File | What it tests |
|------|---------------|
| `01_home_to_game.yaml` | Home screen → tap Play Now → Game screen loads |
| `02_answer_questions.yaml` | Answer all questions → reach Level Completion |
| `03_level_completion_retry.yaml` | Timer expiry path → fail → Try Again |
| `04_home_navigate_back.yaml` | Level Completion → Home navigation |

## Architecture

- **React Native Expo** — cross-platform (iOS + Android)
- **Supabase** — auth, database, stored procedures
- **AsyncStorage** — offline score/attempt queue (flushed on re-auth)
- **Navigation** — `@react-navigation/native-stack` + bottom tabs

## Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```
