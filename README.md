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

## Phase B — cloud sync (planned)

Storage is already behind `src/storage/StorageAdapter.ts`; every record has a
UUID + `createdAt`, so cloud merge is union-by-id.

1. Create a Firebase project (free Spark tier, no card): enable **Google
   sign-in** (Authentication) and **Firestore**.
2. Add the `firebase` SDK and a `FirestoreAdapter` implementing
   `StorageAdapter`, storing docs at `users/{uid}/sets/{id}` with offline
   persistence enabled.
3. Security rules: users can only read/write `users/{uid}/**`.
4. On first sign-in, merge localStorage sets into Firestore (tombstones
   honored). Signed-out use keeps working on localStorage.
