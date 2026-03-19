# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## boot-sequence-skipped — Boot animation skipped after first play due to sessionStorage guard
- **Date:** 2026-03-17
- **Error patterns:** boot sequence skipped, animation skipped, jumps to main page, sessionStorage, tron-boot-played, BOOT_KEY, onComplete called immediately
- **Root cause:** BootSequence.jsx added a sessionStorage skip guard (BOOT_KEY = 'tron-boot-played') absent in the reference implementation. After the animation plays once, every subsequent load (including dev hot-reloads) finds the key set and calls onComplete() immediately, bypassing the animation entirely.
- **Fix:** Removed all sessionStorage read/write logic from the useEffect and startAnimation() in BootSequence.jsx so the animation always plays unconditionally on load, matching the reference intro.tsx.
- **Files changed:** src/components/UI/BootSequence.jsx
---

## vite-white-screen-504-ws-fail — White screen caused by stale Vite dep optimization cache
- **Date:** 2026-03-18
- **Error patterns:** white screen, 504, Outdated Optimize Dep, chunk-LINDKGWS.js, WebSocket failed, ws://localhost:5173, failed to connect to websocket, node_modules/.vite/deps, _metadata.json, @react-three/drei absent
- **Root cause:** Vite dep optimization cache (node_modules/.vite/deps/) was stale — _metadata.json recorded a prior set of optimized deps that excluded @react-three/drei. On dev server start, Vite computed a new chunk hash for drei (chunk-LINDKGWS.js) but that chunk was never written to disk, so every import request returned 504. The HMR WebSocket then lost sync with the broken server, and React never mounted — causing a white screen.
- **Fix:** Deleted node_modules/.vite entirely to force Vite to rebuild dep optimization from scratch. Also removed a broken font preload tag from index.html (href used /src/-rooted path that didn't match the CSS @font-face resolved URL).
- **Files changed:** index.html
---
