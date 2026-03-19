---
phase: 3
slug: grid-world
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser visual verification (no automated test framework — consistent with prior phases) |
| **Config file** | none |
| **Quick run command** | `npm run dev` — open browser, check visual output |
| **Full suite command** | `npm run build && npm run preview` — verify production build |
| **Estimated runtime** | ~15 seconds (dev server startup) |

---

## Sampling Rate

- **After every task commit:** `npm run dev` — verify no regressions visually
- **After every plan wave:** `npm run build` — verify production build passes
- **Before `/gsd:verify-work`:** Full suite must be green (build succeeds, no console errors)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | GRID-01 | manual | `npm run dev` — three panes visible in triangle | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | GRID-02 | manual | `npm run dev` — OrbitControls drag works | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | GRID-03 | manual | `npm run dev` — panes billboard to camera | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 1 | GRID-04 | manual | `npm run dev` — idle canvas texture streams visible | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | GRID-05 | manual | `npm run dev` — hover decrypt animation plays | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 2 | GRID-05 | manual | `npm run dev` — grid light pulse ripples on hover | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 2 | NFR-03 | manual | `npm run dev` — 60 FPS sustained during orbit + hover | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*This project uses browser-based visual verification instead of automated tests. No test framework installation required.*

Existing infrastructure covers all phase requirements via:
- `npm run dev` — Vite dev server with HMR
- `npm run build` — Vite production build (type-checks JSX, catches import errors)
- Browser DevTools performance profiler — FPS measurement for NFR-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Three panes in triangle formation | GRID-01 | WebGL 3D spatial layout — no DOM assertion possible | Open dev server, enter phase 3, confirm three panes at approximate triangle positions (front-center, rear-left, rear-right) |
| Camera orbit 360° horizontal | GRID-02 | User interaction with OrbitControls | Drag left/right to complete full horizontal orbit; drag up/down to verify polar clamp (floor never disappears) |
| Panes always face camera | GRID-03 | Billboard math requires visual verification | Orbit camera 360° — all three panes should continuously face viewer |
| Idle canvas texture streams | GRID-04 | Animated Canvas 2D texture — visual only | Observe pane surfaces for hex/ASCII character streams and random line segments |
| Hover decrypt animation | GRID-05 | Pointer interaction + animation — visual only | Hover each pane; confirm wireframe snaps, text decrypts left-to-right, label appears in cyan TR2N |
| Grid light pulse on hover | GRID-05 | Ring geometry animation at y=-3 | Hover pane; confirm expanding ring pulse at pane base, second pulse fires at ~50% |
| 60 FPS performance | NFR-03 | Requires browser profiler | Open DevTools Performance tab, record 5s of orbit + hover; confirm average FPS ≥ 60 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
