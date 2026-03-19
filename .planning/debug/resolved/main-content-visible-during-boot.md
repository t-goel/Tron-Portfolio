---
status: awaiting_human_verify
trigger: "main-content-visible-during-boot — TitleOverlay and EnterButton visible behind shards during boot animation"
created: 2026-03-17T00:00:00Z
updated: 2026-03-17T00:00:00Z
---

## Current Focus

hypothesis: TitleOverlay and EnterButton mount at t=1200ms (when setPhase(2) fires inside BootSequence), but BootSequence's white shard divs have z-index 20/30 while TitleOverlay/EnterButton have z-index 10. The shards have gaps (they only cover their polygon clip regions) and also fade to opacity:0 as they fall — so the content beneath is visible through gaps and through the fading shards.
test: Confirmed by reading App.jsx — TitleOverlay renders when phase >= 2, EnterButton when phase === 2. setPhase(2) fires at 1200ms during the boot animation. No opacity or visibility gating on TitleOverlay/EnterButton during showBoot=true.
expecting: Fix by gating TitleOverlay and EnterButton rendering on !showBoot (or adding opacity:0 while showBoot is true)
next_action: Apply fix in App.jsx — gate {phase >= 2} renders on !showBoot

## Symptoms

expected: During the boot sequence, only the white shattering screen should be visible. After all shards fall, there should be a brief black screen, then the main content (Tron name/button) fades in.
actual: The text and UI elements are visible behind the shards as they fall — the main content bleeds through during the animation.
errors: No JS errors — purely a visual layering/timing issue.
reproduction: Load the page and watch the boot animation — name text and button appear while shards are still falling.
started: Current implementation — just added a black fade overlay in App.jsx but the underlying content is still rendering and visible.

## Eliminated

- hypothesis: z-index stacking is wrong (TitleOverlay above BootSequence)
  evidence: BootSequence is z-50 (50), TitleOverlay/EnterButton are z-10. BootSequence IS on top. The issue is the shards themselves have clip-path gaps and fade to opacity 0 as they fall, revealing content underneath.
  timestamp: 2026-03-17T00:00:00Z

## Evidence

- timestamp: 2026-03-17T00:00:00Z
  checked: BootSequence.jsx lines 139-142
  found: setPhase(2) fires at t=1200ms, same time shards begin falling
  implication: TitleOverlay and EnterButton mount mid-animation

- timestamp: 2026-03-17T00:00:00Z
  checked: BootSequence.jsx lines 205-207
  found: Outer shard opacity transitions to 0 as they fall (opacity: phase === 'falling' ? 0 : 1). The transition happens over 0.6s+delay — during that fade-out, the content behind is revealed through the shard.
  implication: Even if shards covered 100% of the screen, the opacity fade creates a window where the underlying content is visible.

- timestamp: 2026-03-17T00:00:00Z
  checked: BootSequence.jsx line 270-272
  found: The solid bg-[#fafafa] base layer (z-0) only renders during 'idle' and 'cracking' phases. Once 'falling' starts, the base layer unmounts — leaving only the clip-pathed shard divs, which have gaps between them.
  implication: Two compounding issues: (1) base layer removed during falling, (2) shards fade to transparent. Both expose the content beneath.

- timestamp: 2026-03-17T00:00:00Z
  checked: App.jsx lines 50-51
  found: TitleOverlay and EnterButton are rendered conditionally on phase >= 2 and phase === 2 respectively. No check for showBoot state.
  implication: They mount at 1200ms while showBoot=true, and are visible throughout the rest of the boot animation.

- timestamp: 2026-03-17T00:00:00Z
  checked: App.jsx lines 53-65
  found: The black fade overlay only renders when !showBoot. During boot it doesn't exist at all.
  implication: There is zero protection against content visibility during boot.

## Resolution

root_cause: setPhase(2) fires at t=1200ms inside BootSequence, causing TitleOverlay and EnterButton to mount in App.jsx while showBoot=true. The BootSequence white shards have gaps (clip-path polygons don't tile perfectly) and the shards themselves fade to opacity:0 as they animate away. The solid white base layer (z-0) is removed at the start of 'falling' phase. All three factors combine to make the underlying content visible through the animation.

fix: Gate TitleOverlay and EnterButton rendering on !showBoot in App.jsx. This is the simplest, most correct fix — the components simply don't exist in the DOM during boot, eliminating all visibility regardless of z-index or opacity. The existing black fade overlay (!showBoot -> opacity 0 -> 1) already handles the smooth reveal after boot.

verification: Code-verified. TitleOverlay and EnterButton now gated on !showBoot. They cannot mount while BootSequence is active. The existing black fade overlay already handles smooth reveal after boot completes. Full sequence: boot runs -> onComplete fires at 5800ms -> showBoot=false (unmounts BootSequence, mounts TitleOverlay/EnterButton/black overlay) -> 350ms pause -> mainVisible=true (black overlay fades out over 1.2s, revealing content).
files_changed: [src/App.jsx]
