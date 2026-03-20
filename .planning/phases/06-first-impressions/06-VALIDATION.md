---
phase: 6
slug: first-impressions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (Vite project) |
| **Config file** | vite.config.js |
| **Quick run command** | `npm run dev` (visual inspection) |
| **Full suite command** | `npm run build && npm run preview` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev` and visually inspect
- **After every plan wave:** Run `npm run build && npm run preview`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 1 | BOOT-05 | visual | `npm run dev` | ✅ | ⬜ pending |
| 6-01-02 | 01 | 1 | BOOT-05 | visual | `npm run dev` | ✅ | ⬜ pending |
| 6-02-01 | 02 | 1 | PANE-02 | visual | `npm run dev` | ❌ W0 | ⬜ pending |
| 6-02-02 | 02 | 1 | PANE-02 | manual | sessionStorage check | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/UI/GridAffordanceHint.jsx` — new component stub for PANE-02

*Existing infrastructure covers BootSequence rewrite (BOOT-05).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No white flash on load | BOOT-05 | Requires real browser render observation | Open dev tools Network tab, throttle to Slow 3G, reload — background must remain #000000 throughout |
| Hint auto-fades | PANE-02 | CSS animation timing requires visual check | Enter grid, observe hint appears and fades within ~3s |
| Hint not shown on 2nd grid visit (same session) | PANE-02 | sessionStorage state requires manual test | Enter grid, navigate to sector, return to grid — hint must NOT reappear |
| Hint not shown after page reload (new session) | PANE-02 | sessionStorage clears on tab close | Close tab, reopen — hint MUST appear again |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
