---
status: awaiting_human_verify
trigger: "duplicate-pane-text-overlap — Two overlapping text labels appear on the gateway panes"
created: 2026-03-18T00:00:00Z
updated: 2026-03-18T00:00:00Z
---

## Current Focus

hypothesis: drawFrame renders the label twice — once in the chaotic-zone cell loop (labelCellMap path, lines 39-41) and again via a centered ctx.fillText call added at lines 84-92. Both render on every frame.
test: Read GatewayPane.jsx and trace all label rendering paths in drawFrame.
expecting: Two distinct label draw calls confirmed in the same function.
next_action: Remove the redundant centered fillText block (lines 84-92) while preserving the cell-map label reveal in the loop, since the loop already handles both idle and decrypted states via decryptProgress gating.

## Symptoms

expected: Each gateway pane shows a single label (e.g. "ABOUT", "SKILLS", "PROJECTS")
actual: Two text strings are visible on each pane, overlapping each other
errors: No console errors
reproduction: Run dev server, enter phase 3 via `useAppState.setState({phase: 3, hudVisible: true})`, hover a pane
started: Immediately after recent edits to GatewayPane.jsx — the drawFrame function was modified to always show the label, but there was already label-rendering logic in the chaotic-zone loop

## Eliminated

(none — root cause confirmed on first read)

## Evidence

- timestamp: 2026-03-18T00:00:00Z
  checked: GatewayPane.jsx drawFrame function, lines 1-93
  found: |
    Path 1 (lines 32-58): cell loop. When cellIndex/totalCells < decryptProgress AND the cell is in labelCellMap, the label character is drawn in cyan at grid position.
    Path 2 (lines 84-92): after the loop, an unconditional ctx.fillText(label, 120, 80) draws the full label string centered on the canvas at all times, at alpha (0.35 + decryptProgress * 0.65).
    Both paths execute on every drawFrame call.
  implication: Two independent label renders always overlap — one character-grid reveal, one centered text block.

## Resolution

root_cause: drawFrame has two label rendering paths. The cell-loop path (labelCellMap) draws individual label characters as the reveal progresses. A second unconditional centered fillText call was added at lines 84-92 to "always show label faintly", but this double-draws the label on top of the first pass at every decryptProgress value.
fix: Remove lines 84-92 (the unconditional centered fillText block). Add a faint idle label draw only when decryptProgress === 0 (no reveal in progress) so the pane is never unlabeled at rest. This keeps a single rendering path and eliminates the overlap.
verification: Fix applied — removed unconditional centered fillText block, replaced with idle-only guard (decryptProgress === 0). Awaiting human confirmation in browser.
files_changed: [src/components/3D/GatewayPane.jsx]
