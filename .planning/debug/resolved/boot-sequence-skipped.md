---
status: resolved
trigger: "Boot sequence skipped — app jumps directly to the main page"
created: 2026-03-17T00:00:00Z
updated: 2026-03-17T00:00:00Z
---

## Current Focus

hypothesis: sessionStorage BOOT_KEY is already set from a previous dev session, causing the useEffect to immediately call onComplete() and setPhase(2) without running the animation
test: Check the skip logic in BootSequence.jsx useEffect — if sessionStorage.getItem(BOOT_KEY) is truthy, animation is skipped entirely
expecting: Confirmed — the key 'tron-boot-played' is present in sessionStorage from a prior page load
next_action: Verify secondary issue: the reference impl (intro.tsx) does NOT have the sessionStorage skip logic at all — it always plays. Then fix.

## Symptoms

expected: White screen appears, crack lines draw from center, shards explode outward, center shard swings then drops, then main Tron page fades in.
actual: App jumps directly to the main page with no animation.
errors: None — build passes clean.
reproduction: Load the app (npm run dev) — skip happens immediately on page load.
started: Immediately after converting PortfolioV1/components/intro.tsx to JSX.

## Eliminated

- hypothesis: Animation component not mounted at all
  evidence: BootSequence IS rendered in App.jsx — showBoot starts true and BootSequence is included
  timestamp: 2026-03-17T00:00:00Z

- hypothesis: CSS keyframes missing
  evidence: crackDraw, loadDot, pivotSwing, pivotDrop all defined in src/index.css
  timestamp: 2026-03-17T00:00:00Z

- hypothesis: onComplete wiring broken in App.jsx
  evidence: onComplete={() => setShowBoot(false)} is correctly passed; not the issue
  timestamp: 2026-03-17T00:00:00Z

## Evidence

- timestamp: 2026-03-17T00:00:00Z
  checked: BootSequence.jsx useEffect (lines 154-161)
  found: |
    useEffect checks sessionStorage.getItem('tron-boot-played').
    If truthy: immediately calls setPhase(2) and onComplete() — SKIPPING animation entirely.
    The reference intro.tsx has NO sessionStorage skip logic — it always plays the animation.
  implication: During development, once the animation plays once, every subsequent hot-reload or page refresh skips it. This is the root cause.

- timestamp: 2026-03-17T00:00:00Z
  checked: BootSequence.jsx startAnimation (lines 139-151)
  found: sessionStorage.setItem(BOOT_KEY, '1') is written at the 'falling' phase (1200ms in), so it is permanently set after first play.
  implication: Every dev session after the first will skip the animation. This explains "issue appeared immediately" — it appeared after the first successful test run.

- timestamp: 2026-03-17T00:00:00Z
  checked: Reference intro.tsx lines 151-168
  found: startAnimation has NO sessionStorage logic. No skip. Always plays.
  implication: The sessionStorage optimization was added during the JSX conversion but it fires immediately on every dev reload, defeating the animation.

## Resolution

root_cause: BootSequence.jsx added a sessionStorage skip guard (BOOT_KEY = 'tron-boot-played') that is absent in the reference implementation. Once the animation plays once during development (or if the key exists from any prior session), every subsequent load bypasses the entire animation and calls onComplete() immediately. Since dev hot-reloads preserve sessionStorage, the animation is invisible after the first run.

fix: Remove the sessionStorage skip logic entirely to match the reference implementation — always play the animation on load. The useEffect should unconditionally call startAnimation(), and startAnimation() should not write to sessionStorage.

verification: confirmed by user — animation now plays on every load as expected
files_changed: [src/components/UI/BootSequence.jsx]
