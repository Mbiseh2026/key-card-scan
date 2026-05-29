## Cause

The app preview is blank because the root route (`/`) currently renders `null` and only redirects in the browser. During preview/SSR it returns no visible UI, so the first screen can appear completely blank. The server logs also show the route tree file was recently missing during regeneration, which can leave the preview stuck until the route tree and dev server are stabilized.

## Immediate Fix Plan

1. **Make `/` render a real screen instead of `null`**
   - Replace the root route’s blank component with a lightweight redirect/loading screen.
   - Keep the current logic: logged-in users go to `/home`, others go to `/login`.

2. **Keep redirects safe for preview/SSR**
   - Avoid browser-only `localStorage` redirect logic running in a way that leaves SSR blank.
   - Use a small client-side effect to decide the destination after hydration.

3. **Stabilize route generation**
   - Keep `src/routeTree.gen.ts` aligned with existing route files only:
     - `/`
     - `/login`
     - `/home`
     - `/gate`
     - `/gate/success`
     - `/timetable`
     - `/class/$classId`
     - `/history`
     - `/more`
   - Do not re-add deleted routes like `/settings` or `/ai`.

4. **Restart preview and verify**
   - Restart the dev server after the root route fix.
   - Confirm `/` shows content immediately and then navigates to `/login` or `/home`.
   - Check logs again for missing-file route errors.