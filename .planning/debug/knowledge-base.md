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
