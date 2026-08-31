# Notebook

A multi-user, offline-first React app where each user logs and gets reminded about many different kinds of information. The first three modules are **Spaced Repetition**, **Recurring Tasks** and **PDF Reader** — but the point of this codebase is the _architecture_: new module types plug in by adding one folder and one registry line.

## Tech stack

- **Build**: Vite + React 19 + TypeScript
- **Routing**: react-router v7 (`createBrowserRouter`, lazy-loaded modules)
- **State/data**: TanStack Query over Firestore snapshots
- **Backend**: Firebase Auth (Email/Password + password reset) & Firestore; Firebase Hosting config ready
- **Offline-first**: `vite-plugin-pwa` service worker (app shell) + Firestore `persistentLocalCache` (data), multi-tab safe
- **UI**: Tailwind CSS v4 + shadcn-style primitives in `src/core/ui`
- **Forms**: react-hook-form + zod · **i18n**: react-i18next (en/vi) · **Tests**: Vitest + Testing Library

## Architecture

```
src/
  app/
    providers/        # QueryClientProvider, ThemeProvider, i18n provider, AuthProvider composition
    router.tsx        # createBrowserRouter — routes are generated from the module registry
    AppLayout.tsx     # sidebar + header + <Outlet/>
    components/       # header/sidebar/language-switcher/theme-toggle
  core/               # shared infrastructure only — no module business logic
    firebase/         # init, emulator wiring, generic users/{uid}/{collection} CRUD, profile bootstrap
    auth/             # AuthProvider/useAuth, ProtectedRoute, login/password-reset pages
    offline/          # network status + sync indicator
    i18n/             # i18next init (core 'common' namespace) + en/vi locales
    ui/               # Button, Input, Card, EmptyState, Spinner…
    hooks/            # useModuleNotes (snapshot→TanStack Query bridge), useLocalStorage, useDebounce
    lib/              # date formatting, auth error mapping
  modules/            # ← every feature is a standalone module (see below)
  types/              # shared types: AppUser, BaseNote
main.tsx
```

### Module registry pattern

Each module folder exposes an `AppModule` object from its own `module.config.ts`: id, path, icon, nav label key, namespace, collection name, lazy route elements and its **own** en/vi translations. `module.registry.ts` collects them into one array. Everything else is derived automatically:

- **Routing** (`app/router.tsx`) builds `/login`, `/forgot-password`, the protected layout route and one child subtree per module (list at index, extra pages via `children`) from the registry.
- **Sidebar** (`app/components/sidebar.tsx`) renders one nav entry per registry item.
- **i18n** (`core/i18n/config.ts`) merges every module's `locales/en.ts` / `locales/vi.ts` into i18next as a per-module namespace at startup.
- **Data layer** (`core/firebase/crud.ts` + `core/hooks/use-module-notes.ts`) is generic: it takes any `users/{uid}/{collectionName}` path, so modules never touch core when added.

Adding a module therefore requires **no edits** to router, sidebar, i18n or data code.

### Firestore data model

All user data lives under `users/{uid}/…`. Chosen layout: **a dedicated subcollection per module** (`memoryItems`, `maintenanceTasks` + `maintenanceLogs`, `pdfDocuments`) rather than one shared `items` collection with a `moduleId` field. Why:

- Security rules stay trivially simple (`request.auth.uid == uid`, one wildcard block) — no per-document discriminator field to keep honest.
- Per-module queries need no composite indexes or filtering on `moduleId`.
- A new module needs no data-model migration: its subcollection simply starts empty; the rules file gains one validated block for its schema (the only intentional touch-point).

Item documents carry `createdAt` (server timestamp) plus their module fields:

| Collection              | Fields                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `spacedRepetitionCards` | front, back, easeFactor, intervalDays, repetitions, nextReviewAt, lastReviewedAt                                                |
| `maintenanceTasks`      | name, emoji?, notes?, intervalDays?, intervalMonths?, trackReading, readingLabel?, intervalReading? — at least one interval set |
| `maintenanceLogs`       | taskId, performedAt, readingValue? — the history of each occurrence                                                             |
| `pdfDocuments`          | title, url, lastReadPage, totalPages                                                                                            |

The `recurring-tasks` module is a **generic recurring-task tracker**: every task carries its own configuration (day/month intervals plus an optional metered reading like odometer km, complete with its own unit label), users log every occurrence (date + optional reading), and `modules/recurring-tasks/lib/schedule.ts` computes the next due date from whichever configured deadline lands first — usage-based intervals are converted into an estimated date through the average units/day observed across the history. Adding a new kind of chore (dental scaling, yearly health check-up, career-goal review, …) is pure data: create another task through the UI, no code changes needed.

### Security rules

`firestore.rules` denies everything by default; owners get full access under their own `users/{uid}/**`, and create/update writes are additionally validated per collection (required string fields, numeric ranges, timestamp/null optionals, server-set `createdAt`). Rule tests live in `tests/firestore.rules.test.ts`.

## Local development

```bash
npm install
cp .env.example .env   # placeholders work out of the box with emulators
npm run prepare        # installs git hooks (husky)
npm run dev            # http://localhost:3000
```

With the emulators (recommended — sign-in/password reset works fully offline):

```bash
firebase login          # once, needed by the CLI
npm run dev:emulators   # Auth :9099, Firestore :8080, Emulator UI :4000
```

Keep `VITE_USE_EMULATOR=true` in `.env`; the app connects to both emulators automatically in dev builds and never in production builds. Seed sample data through the Emulator UI at `http://localhost:4000`, or just create items through the running app.

Production build: `npm run build` → deploy with `firebase deploy --only hosting` (hosting already points at `dist` with SPA rewrites).

### Environment variables

See `.env.example`: `VITE_USE_EMULATOR` plus the standard `VITE_FIREBASE_*` web-app keys. Placeholder values are acceptable while developing against emulators; real values come from the Firebase console for production. Never commit a real `.env`.

### Password reset email

The app handles password reset links at `/reset-password`. In Firebase Console, open **Authentication → Templates → Password reset**, customize the action URL, and set it to your deployed app URL followed by `/reset-password` (for example, `https://your-app.web.app/reset-password`). Add the deployed domain to **Authentication → Settings → Authorized domains** as well.

### Scripts

| Script                              | Purpose                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                       | Vite dev server                                              |
| `npm run dev:emulators`             | Firebase Auth + Firestore emulators                          |
| `npm run test`                      | Vitest unit tests                                            |
| `npm run test:rules`                | Firestore rules tests (needs the Firestore emulator running) |
| `npm run lint` / `lint:fix`         | ESLint                                                       |
| `npm run prettier` / `prettier:fix` | Prettier check/format                                        |

Pre-commit runs ESLint + Prettier on staged files via husky + lint-staged.

## Adding a new module (the whole point)

1. Create the feature folder with the standard shape:

   ```
   src/modules/habit-tracker/
     api/habits.ts                     # thin wrappers over core CRUD for your collection
     hooks/use-habits.ts               # useModuleNotes<Habit>(COLLECTION) + mutations
     components/habit-list-page.tsx    # default export
     components/habit-create-page.tsx  # default export
     routes.tsx                        # lazy() wrappers for the pages
     types.ts                          # Habit interface
     locales/en.ts, locales/vi.ts
     module.config.ts
   ```

2. Declare the module — id, path, icon, labelKey, namespace, `collectionName`, lazy elements, extra `children` routes and translations — in `module.config.ts`.
3. Add exactly one import + one array entry in `src/modules/module.registry.ts`.
4. Add one validated match block for the new collection in `firestore.rules`.

That's it — routing, sidebar entry, en/vi translations and data plumbing light up automatically. Nothing in `app/` or `core/` changes.

## Known limitations (intentional scaffolding scope)

- Spaced repetition grades reviews client-side with a small SM-2 implementation (`modules/spaced-repetition/lib/schedule.ts`, unit-tested); every item can also carry an external quiz link plus a "quiz done" checkbox.
- Recurring-task scheduling runs fully client-side (`modules/recurring-tasks/lib/schedule.ts`, unit-tested). An in-app reminder bell in the header (`modules/recurring-tasks/components/reminder-bell.tsx`) collects overdue / due-soon tasks across every task shape; OS-level push notifications remain a TODO.
- The PDF viewer renders pages fully client-side with pdf.js (`modules/pdf-reader/components/pdf-viewer.tsx`): fit-width canvas rendering with devicePixelRatio scaling, prev/next + zoom controls, arrow-key navigation and a reading progress bar. The real total page count is detected on load and persisted back to Firestore, and every page change saves reading progress. Because pdf.js fetches the file with XHR/fetch, **external hosts must send CORS headers** — otherwise the viewer shows an error with an "open original" fallback. PDF bytes are not cached offline beyond the normal browser HTTP cache.
- Rules tests require the Firestore emulator (`FIRESTORE_EMULATOR_HOST`); they auto-skip otherwise so plain `npm run test` stays green.
