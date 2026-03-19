---
status: resolved
trigger: "White screen on localhost:5173 with Vite WebSocket failures and 504 Outdated Optimize Dep errors"
created: 2026-03-18T00:00:00Z
updated: 2026-03-18T00:00:00Z
---

## Current Focus

hypothesis: Vite dep optimization cache is stale — @react-three/drei is imported by Scene.jsx but is absent from node_modules/.vite/deps/_metadata.json optimized map. Vite tries to create a new chunk for it at runtime (chunk-LINDKGWS.js) but the cache is locked from a prior run, causing 504. This cascades to WebSocket failures as the HMR client loses sync with the server.
test: Clear node_modules/.vite cache entirely so Vite rebuilds it fresh with all deps correctly included on next dev start.
expecting: On next npm run dev, Vite pre-bundles all deps including @react-three/drei, no 504, app loads and boot sequence plays.
next_action: Delete node_modules/.vite/deps directory and restart dev server.

## Symptoms

expected: Portfolio app loads and displays the title screen with "Enter the Grid" button
actual: White screen — nothing renders
errors: |
  client:745 WebSocket connection to 'ws://localhost:5173/?token=BUNfVETWPk9A' failed
  chunk-LINDKGWS.js:1 Failed to load resource: 504 (Outdated Optimize Dep)
  client:755 WebSocket connection failed again
  client:765 [vite] failed to connect to websocket
  Font preload warning: Tron-JOAa.ttf preloaded but not used within a few seconds
reproduction: Run npm run dev, open localhost:5173, get white screen
started: Unknown — user reported now

## Eliminated

- hypothesis: React component tree has a runtime error preventing mount
  evidence: All component files exist, all imports resolve to real files, no syntax errors, no undefined module references. App.jsx, Scene.jsx, BootSequence, TitleOverlay, EnterButton, store, utils are all present and syntactically correct.
  timestamp: 2026-03-18T00:00:00Z

- hypothesis: index.html is broken or missing the root div / script tag
  evidence: index.html has correct <div id="root"> and <script type="module" src="/src/main.jsx">. No structural issues.
  timestamp: 2026-03-18T00:00:00Z

- hypothesis: WebSocket failure is the root cause
  evidence: WebSocket failure is a downstream symptom. It occurs because Vite's dev server gets into a broken state after the 504 stale dep error — the HMR websocket then cannot connect. Root cause is the stale cache.
  timestamp: 2026-03-18T00:00:00Z

## Evidence

- timestamp: 2026-03-18T00:00:00Z
  checked: node_modules/.vite/deps/_metadata.json optimized map
  found: Only react, react-dom, react/jsx-dev-runtime, react/jsx-runtime, @react-three/fiber, react-dom/client, zustand, @react-three/postprocessing, three, howler are pre-bundled. @react-three/drei is ABSENT.
  implication: drei is imported in Scene.jsx via "import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'" — wait, actually Scene.jsx imports from @react-three/postprocessing which IS in the cache. But drei is installed (v10.7.7) and NOT in cache. Vite will try to discover and bundle it on first import, generating a new chunk (LINDKGWS), but because the cache metadata hash doesn't match, Vite serves a 504 for that chunk.

- timestamp: 2026-03-18T00:00:00Z
  checked: The failing chunk name "chunk-LINDKGWS.js"
  found: This chunk does NOT exist in node_modules/.vite/deps/. Vite tried to serve a chunk it computed at runtime but that chunk was never written to disk because it belongs to a newer optimization run that hasn't been committed to the cache yet.
  implication: Cache is in a partially-invalidated state. The lockfile or package install changed after the cache was last written (e.g. packages were updated or npm install was re-run), but the cache wasn't cleared.

- timestamp: 2026-03-18T00:00:00Z
  checked: Font preload warning
  found: index.html has <link rel="preload" href="/src/assets/fonts/Tron-JOAa.ttf"> but the @font-face in index.css uses a relative path "./assets/fonts/Tron-JOAa.ttf". The preload uses the /src/-rooted path while the font-face is CSS-relative — these are different resolved URLs so the browser preloads but can't match the font-face declaration, causing the "preloaded but not used" warning.
  implication: Secondary issue. Font will still load (just without preload benefit). Not causing the white screen.

## Resolution

root_cause: Vite dep optimization cache (node_modules/.vite/deps/) is stale. The _metadata.json records a set of optimized deps from a previous run. Since then, packages were installed/updated (the cache doesn't include @react-three/drei which is installed at 10.7.7), so when the dev server starts and encounters imports that require re-optimization, it generates new chunk hashes. Those chunks don't exist on disk yet, so Vite returns 504 for them. The HMR WebSocket then fails because the server is in an inconsistent state, and React never mounts — producing the white screen.
fix: |
  1. Deleted node_modules/.vite (entire directory) to force Vite to rebuild dep optimization cache from scratch.
  2. Removed broken font preload tag from index.html — the href "/src/assets/fonts/Tron-JOAa.ttf" didn't match how Vite serves the asset after transformation, causing a "preloaded but not used" browser warning. Font still loads correctly via @font-face in index.css.
verification: confirmed by user — npm run dev now loads the app correctly with no 504 errors or WebSocket failures
files_changed:
  - index.html
