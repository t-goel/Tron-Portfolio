---
phase: 4
slug: sector-dives-finish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser testing (WebGL/Canvas — no automated test framework) |
| **Config file** | none |
| **Quick run command** | `npm run dev` + open browser |
| **Full suite command** | `npm run build && npm run preview` |
| **Estimated runtime** | ~15 seconds build |

---

## Sampling Rate

- **After every task commit:** `npm run dev` — verify in browser visually
- **After every plan wave:** `npm run build` must succeed with no errors
- **Before `/gsd:verify-work`:** Full build + manual walkthrough of all 3 sectors
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PROJ-01 | manual | `npm run dev` — click Projects pane, camera flies through | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | PROJ-02/03/04/05 | manual | Projects overlay renders 3 cards from projects.js | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | PROJ-06 | manual | GitHub link opens new tab | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | ABOUT-01/02 | manual | Camera fly-in to About sector | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | ABOUT-03 | manual | Terminal typewriter auto-runs through all commands | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 1 | ABOUT-04 | manual | Contact links clickable at end of typewriter | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | SKILLS-01/02 | manual | Skills sector mounts Canvas; 5 Tier 1 nodes in radial layout | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | SKILLS-03/04 | manual | Click Tier 1: light-racer animation spawns Tier 2 nodes | ❌ W0 | ⬜ pending |
| 04-03-03 | 03 | 2 | SKILLS-05 | manual | Second click collapses Tier 2 nodes | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 3 | NFR-02 | manual | Resize to 767px: OrbitControls disabled, panes stack vertically | ❌ W0 | ⬜ pending |
| 04-04-02 | 04 | 3 | NFR-04 | automated | `grep -c "og:title" index.html` returns ≥ 1 | ✅ | ⬜ pending |
| 04-04-03 | 04 | 3 | NFR-05 | automated | `grep -c "favicon" index.html` returns ≥ 1 | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No automated test framework needed — this is a WebGL/Canvas portfolio.
- All verification is manual browser testing.
- Build success (`npm run build` exits 0) serves as the automated signal after each wave.

*Existing infrastructure covers all automated phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Camera fly-through on pane click | PROJ-01, ABOUT-01, SKILLS-01 | WebGL 3D animation, no DOM to inspect | Click each pane in browser, verify smooth camera lerp |
| Projects overlay renders all cards | PROJ-02/03/04 | Data-driven React render with CSS | Open Projects sector, verify 3 cards with accent borders |
| GitHub link opens new tab | PROJ-06 | Browser behavior | Click "VIEW ON GITHUB ↗", verify new tab |
| Terminal typewriter sequence | ABOUT-03 | Time-based animation | Open About sector, wait ~10s, verify all commands typed |
| Contact links work | ABOUT-04 | Live URL check | Click GitHub/LinkedIn/email links |
| Skills Canvas radial layout | SKILLS-01/02 | Canvas 2D rendering | Open Skills sector, verify 5 nodes in radial arrangement |
| Light-racer expansion | SKILLS-03/04 | Canvas animation | Click Tier 1 node, verify trails + spawned Tier 2 nodes |
| Collapse on second click | SKILLS-05 | Canvas state machine | Click Tier 1 twice, verify Tier 2 collapses |
| Mobile layout ≤767px | NFR-02 | Responsive CSS | Open DevTools device emulation at 375px |
| OG meta preview | NFR-04 | Social platform rendering | Check index.html for all required meta tags |
| TR2N favicon | NFR-05 | Browser tab rendering | Check browser tab shows custom favicon |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
