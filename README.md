# Gym Tracker

Mobile-first PWA to log gym lifts (exercise, weight in kg, reps, date) and see a
total-volume (weight × reps) progress chart per exercise.

- **Log tab** — quick entry with autocomplete chips; exercise/weight stay
  prefilled after each set for fast multi-set logging.
- **History tab** — sets grouped by date, delete with undo.
- **Progress tab** — daily volume line chart per exercise.
- **Backup** (gear icon) — export/import JSON.

Data is stored in `localStorage` under `gym-lifts/v1`. Deleted sets are kept as
tombstones (`deleted: true`) so deletions can sync once cloud storage lands.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/gym-tracker/
npm run build    # type-check + production build + service worker
```

## Deploy (GitHub Pages, free)

Push to `main` on GitHub with Pages set to "GitHub Actions"
(repo → Settings → Pages → Source: GitHub Actions). The workflow in
`.github/workflows/deploy.yml` builds and publishes automatically.
`vite.config.ts` sets `base: '/gym-tracker/'` — if the repo is named something
else, update that.

## Cloud sync (Firebase)

Optional Google sign-in (gear icon → Sign in with Google) syncs sets to
Firestore at `users/{uid}/sets/{id}` with offline persistence; signed-out use
stays on localStorage. On first sign-in, device-local sets are merged into the
cloud (union by UUID, tombstones honored — see
`src/storage/FirestoreAdapter.ts` and the migration in `src/hooks/useLifts.ts`).

Firebase project: `gymlogs-202ee` (Spark/free tier, Firestore in asia-south2).
Security rules restrict each user to `users/{uid}/**`. The config in
`src/firebase.ts` is public client identifiers; the rules are the security
boundary. If you fork this, create your own Firebase project, enable Google
sign-in, add your Pages domain to Authentication → Authorized domains, and
swap the config.
