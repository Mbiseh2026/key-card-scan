## Root cause

Deleting `src/routeTree.gen.ts` left `src/router.tsx` importing a missing module. Until the TanStack Router Vite plugin writes a fresh tree, every `createFileRoute("/...")` call sees an untyped registry, which is why TypeScript reports each route path as "not assignable to parameter of type 'undefined'". All 11 errors collapse to this one missing file.

## Fix

1. Recreate `src/routeTree.gen.ts` with the correct generated content for the current routes (no `settings`):
   - `/` (index)
   - `/login`
   - `/_app` layout with children: `/home`, `/gate` (+ `/gate/success`), `/history`, `/timetable`, `/more`, `/class/$classId`
2. Restart the dev server so the TanStack Router plugin picks it up and keeps it in sync on subsequent route changes.

No app code, no routes, no UI changes — just regenerating the one file I removed too eagerly.

## Verification

- Build errors clear (all 11 TS2345 + the TS2307 for `./routeTree.gen`).
- Preview loads `/` and redirects to `/login` / `/home` as before.
