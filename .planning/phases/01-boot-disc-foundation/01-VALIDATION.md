---
phase: 1
slug: boot-disc-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — visual/animation phase; no automated test framework |
| **Config file** | none — Wave 0 creates `src/utils/` and `public/audio/` |
| **Quick run command** | `npm run dev` — manual visual inspection |
| **Full suite command** | Manual walkthrough per Phase 1 success criteria |
| **Estimated runtime** | ~5 minutes manual review per wave |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev` and manually verify the specific component changed (disc glow, canvas animation frame, overlay visibility)
- **After every plan wave:** Full visual walkthrough — boot plays correctly, disc matches reference image, sessionStorage skip works, WebGL fallback renders
- **Before `/gsd:verify-work`:** All 5 Phase 1 success criteria verified against ROADMAP.md spec

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| DISC-01 | 01-01 | 1 | DISC-01 | visual/manual | `npm run dev` → compare disc to reference image | ✅ | ⬜ pending |
| BOOT-01 | 01-02 | 2 | BOOT-01 | visual/manual | First load in browser — observe cyan/orange letter traces | ❌ W0 | ⬜ pending |
| BOOT-02 | 01-02 | 2 | BOOT-02 | visual/manual | Observe flash expansion on sprite collision | ❌ W0 | ⬜ pending |
| BOOT-03 | 01-02 | 2 | BOOT-03 | visual/manual | Watch title fade-in timing after flash | ❌ W0 | ⬜ pending |
| BOOT-04 | 01-02 | 2 | BOOT-04 | smoke | Reload tab → check `sessionStorage.getItem('tron-boot-played')` in DevTools | ❌ W0 | ⬜ pending |
| AUDIO-01 | 01-02 | 2 | AUDIO-01 | manual-only | Listen for music fade-in after flash; verify Howler loads track | ❌ W0 | ⬜ pending |
| NFR-01 | 01-03 | 2 | NFR-01 | smoke | Disable WebGL in browser flags (`chrome://flags/#disable-webgl`) → reload → verify error screen with links | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `public/audio/` directory — must exist before AUDIO-01 can be verified
- [ ] `public/audio/just-turn-it-on.mp3` (or equivalent) — audio file must be sourced and placed here; Howler will fail gracefully if missing but AUDIO-01 cannot be verified
- [ ] `src/utils/` directory — does not exist yet; create with `audioManager.js` and `webglDetect.js`

*Note: No automated test framework installation needed — this phase is entirely visual/audio; verification is manual inspection against reference image and spec.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Disc emissive glow matches reference image | DISC-01 | Canvas/WebGL rendering cannot be pixel-compared without headless WebGL setup | Open `npm run dev`, compare disc to `reference/Screenshot 2026-03-10 at 11.18.58 PM.png` — look for multiple bright concentric rings with strong Crimson Red emissive halo |
| Light-cycle sprites draw "LOADING" correctly | BOOT-01 | Canvas 2D animation timing not automatable without headless browser + WebGL | Clear sessionStorage, hard refresh — observe cyan top/orange bottom sweep on each letter simultaneously |
| Viewport flash on sprite collision | BOOT-02 | Visual animation expansion not automatable | Watch for white radial flash expanding to full viewport in ~0.2s then fading to black |
| Title reveal after flash | BOOT-03 | Animation timing and visual appearance | After fade to black — "TANMAY GOEL" (Crimson Red, TR2N font) and "SOFTWARE DEVELOPER" (Off-White, Roboto Mono) fade in at center |
| Music fade-in on boot completion | AUDIO-01 | Browser autoplay policies require user gesture in some environments | With audio file present — verify sound starts and fades in over ~2s after the black screen |
| sessionStorage boot skip | BOOT-04 | Requires session state inspection | First load plays boot; reload within same tab skips directly to disc; opening new tab plays boot again |
| WebGL fallback error UI | NFR-01 | Requires browser flag or mocked environment | Use `chrome://flags/#disable-webgl` or test in controlled environment; verify styled Tron error screen with working GitHub/LinkedIn/email links |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies documented
- [ ] Sampling continuity: manual `npm run dev` verification after each task commit
- [ ] Wave 0 covers all MISSING references (`public/audio/`, `src/utils/`)
- [ ] No watch-mode flags
- [ ] Feedback latency: ~1 minute per task (dev server hot reload)
- [ ] `nyquist_compliant: true` set in frontmatter when all criteria met

**Approval:** pending
