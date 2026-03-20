---
status: testing
phase: 06-first-impressions
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md]
started: 2026-03-20T21:20:00Z
updated: 2026-03-20T21:20:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 6
name: Session gate — hint doesn't reappear
expected: |
  After the hint fades, navigate around (enter a sector, exit back). The hint should NOT reappear. Also: if you click "ENTER THE GRID" again in the same tab/session, the hint should not show a second time. (Opening a fresh tab SHOULD show it again — that's intentional.)
awaiting: user response

## Tests

### 1. Dark boot screen — no white flash
expected: Load (or hard-refresh) the app. The very first frame should be void-black — no white background, no bright shards, no flash of light content. You should see a black screen with cyan monospace text lines appearing one by one.
result: pass

### 2. Boot log lines — staggered appearance
expected: During the boot sequence, 7 cyan text lines appear one after another with a short delay between each (roughly 0.25s apart). Lines should fade/slide in sequentially, not all at once.
result: pass

### 3. Boot sequence duration — faster than before
expected: The boot screen completes and transitions to the title screen in about 3 seconds total (vs the old ~6 second shard animation). It should feel snappy.
result: pass

### 4. Nav hint appears on first grid visit
expected: After passing the boot screen and clicking "ENTER THE GRID" (or progressing to the grid view), a "Click and drag to explore" hint should appear in neon cyan at the bottom-center of the screen. It should appear after the HUD/disc docks into place.
result: pass

### 5. Nav hint auto-fades after 3 seconds
expected: The "Click and drag to explore" hint should automatically fade out after about 3 seconds — no user interaction needed. It should disappear cleanly without abruptly cutting off.
result: pass

### 6. Session gate — hint doesn't reappear
expected: After the hint fades, navigate around (enter a sector, exit back). The hint should NOT reappear. Also: if you click "ENTER THE GRID" again in the same tab/session, the hint should not show a second time. (Opening a fresh tab SHOULD show it again — that's intentional.)
result: [pending]

## Summary

total: 6
passed: 5
issues: 0
pending: 1
skipped: 0

## Gaps

[none yet]
