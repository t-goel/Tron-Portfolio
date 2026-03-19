---
phase: 2
slug: shatter-dock
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework — all behaviors are visual/animation |
| **Config file** | none — Wave 0 installs vitest if unit tests added |
| **Quick run command** | `npm run dev` + visual browser inspection |
| **Full suite command** | `npm run dev` + full 7-requirement visual pass |
| **Estimated runtime** | ~30 seconds per visual pass |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev` and visually verify the changed behavior in-browser
- **After every plan wave:** Full visual pass — all 7 requirements checked in browser
- **Before `/gsd:verify-work`:** Full suite must be green (all 7 requirements visually confirmed)
- **Max feedback latency:** 60 seconds (dev server restart + browser check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | DOCK-04 | manual | `npm run dev` → verify cyan grid fades in on phase 3 | ❌ visual | ⬜ pending |
| 2-01-02 | 01 | 1 | DOCK-01 | manual | `npm run dev` → click ENTER THE GRID → verify disc fades/DOM disc moves to top-left | ❌ visual | ⬜ pending |
| 2-01-03 | 01 | 2 | DOCK-02 | manual | `npm run dev` → verify "TANMAY GOEL" text appears beside docked disc after animation | ❌ visual | ⬜ pending |
| 2-01-04 | 01 | 2 | DOCK-03 | manual | `npm run dev` → verify 3 social icon circles fade in at bottom-right | ❌ visual | ⬜ pending |
| 2-02-01 | 02 | 1 | AUDIO-02 | manual | `npm run dev` → verify speaker icon visible at bottom-right after phase 1 | ❌ visual | ⬜ pending |
| 2-02-02 | 02 | 1 | AUDIO-02 | manual | `npm run dev` → click speaker → verify audio mutes/unmutes, icon changes state | ❌ visual | ⬜ pending |
| 2-02-03 | 02 | 1 | NAV-01 | manual | `npm run dev` → verify HUD disc+name visible and not occluded by canvas | ❌ visual | ⬜ pending |
| 2-02-04 | 02 | 2 | NAV-02 | manual | `npm run dev` → click HUD disc → verify returns to phase 2 main screen | ❌ visual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*No Wave 0 setup needed — all Phase 2 behaviors are animation/visual and verified via dev server.*

- [ ] If unit tests are later added for MuteToggle/SocialIcons state logic: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom`

*Existing infrastructure (npm run dev + browser) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Disc scale animation to top-left | DOCK-01 | GSAP CSS animation — no WebGL test runner | Click "ENTER THE GRID", observe: disc fades out, DOM disc circle moves from center to top-left over ~1.2s |
| TANMAY GOEL text beside disc | DOCK-02 | CSS opacity transition visual | After dock animation, verify text appears with ~200ms delay beside docked disc circle |
| Social icon circles | DOCK-03 | CSS fade-in visual | After dock completes, verify 3 circles (GitHub, LinkedIn, Email) glow in bottom-right; verify links open correctly |
| Grid illumination | DOCK-04 | WebGL opacity animation | After clicking ENTER THE GRID, cyan grid fades in over ~2s; horizon shows bloom glow |
| Mute toggle appears | AUDIO-02 | Fixed-position DOM visual | After boot, speaker icon visible bottom-right; clicking toggles audio and changes icon |
| HUD always visible | NAV-01 | z-index / fixed positioning | During phase 3+, disc+name in top-left is never occluded; clickable |
| HUD click returns home | NAV-02 | Phase state interaction | Clicking top-left HUD disc returns to phase 2 main screen (ENTER THE GRID button visible) |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions (visual inspection steps)
- [ ] Sampling continuity: dev server check after each task commit
- [ ] Wave 0: N/A (no test framework needed for visual-only phase)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s (npm run dev + browser verify)
- [ ] `nyquist_compliant: true` set in frontmatter after all verifications pass

**Approval:** pending
