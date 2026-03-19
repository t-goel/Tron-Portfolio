---
phase: quick
plan: 260318-qle
type: execute
wave: 1
depends_on: []
files_modified:
  - SPEC.md
  - CLAUDE.md
  - .planning/ROADMAP.md
  - .planning/PROJECT.md
  - .planning/phases/02-shatter-dock/02-CONTEXT.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "No planning file describes the Identity Disc as the Phase 2 main hub or central interaction"
    - "SPEC.md Phase 2 describes the 'Enter the Grid' button as the main CTA, not the disc"
    - "Phase 3 (Shatter & Dock) trigger is 'Enter the Grid' click, not disc click"
    - "The disc still exists as a component for the docked HUD nav button -- it is NOT deleted from the project"
  artifacts:
    - path: "SPEC.md"
      provides: "Updated product requirements reflecting new main screen design"
    - path: "CLAUDE.md"
      provides: "Updated architecture description with correct phase flow"
    - path: ".planning/ROADMAP.md"
      provides: "Updated phase descriptions and success criteria"
    - path: ".planning/PROJECT.md"
      provides: "Updated active requirements and context"
    - path: ".planning/phases/02-shatter-dock/02-CONTEXT.md"
      provides: "Updated trigger description (EnterButton, not disc click)"
  key_links: []
---

<objective>
Update all spec and planning documents to reflect the new main screen design: the Identity Disc is no longer the Phase 2 hub centerpiece. Phase 2 now shows the title text ("TANMAY GOEL" / "SOFTWARE DEVELOPER") with an "ENTER THE GRID" button as the sole CTA. The disc still exists as a file (IdentityDisc.jsx) for use as the docked HUD nav button in Phase 3+, but it no longer renders on the main screen.

Purpose: Documentation is out of sync with the actual implementation after quick tasks 260317-rg5 and 260317-s7f removed the disc and polished the new CTA. All downstream planning (Phase 2 Shatter & Dock, Phase 3, etc.) reads these files -- they must be accurate.

Output: 5 updated files with consistent language about the new Phase 2 design.
</objective>

<execution_context>
@/Users/tanmaygoel/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tanmaygoel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@SPEC.md
@CLAUDE.md
@.planning/ROADMAP.md
@.planning/PROJECT.md
@.planning/phases/02-shatter-dock/02-CONTEXT.md
@.planning/quick/260317-rg5-remove-disc-from-main-screen-replace-wit/260317-rg5-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update SPEC.md and CLAUDE.md to remove disc-as-hub references</name>
  <files>SPEC.md, CLAUDE.md</files>
  <action>
Read both files fully before editing.

**SPEC.md changes:**

1. Section 4 (Phase Flow diagram):
   - Phase 2 description: change from "Main Hub (Disc at center)" to "Main Hub (Title + Enter Button)"
   - Phase 2->3 trigger: change from "[onClick: disc]" to "[onClick: ENTER THE GRID button]"
   - Phase 3 description: keep "Shatter & Dock" name but note it is now about grid illumination and HUD setup (the disc docks from offscreen/hidden, not from center)

2. FR2 (Main Hub -- The Identity Disc):
   - Rename section to "FR2: Main Hub -- Title Screen"
   - FR2.1: Remove the 3D Identity Disc rendering requirement. Replace with: the main hub displays the title text and "ENTER THE GRID" CTA button centered on a black void background. The button features a glitch-decode character animation on mount and re-glitch on hover.
   - FR2.2: Keep the text overlay requirements ("TANMAY GOEL" Red TR2N, "SOFTWARE DEVELOPER" Off-White Roboto Mono) but note they are centered on screen (no disc behind them).
   - FR2.3 (Hover State): Remove the disc hover interaction entirely (disc outer ring spin, particles, grid floor preview, text glitch on disc hover). Replace with: hovering the "ENTER THE GRID" button triggers a brief glitch animation on the button text.
   - Add FR2.4: Clicking "ENTER THE GRID" transitions to Phase 3.

3. FR3 (Shatter & Dock):
   - FR3.1: Keep audio requirement as-is.
   - FR3.2 (Disc Docks): Update to reflect that the IdentityDisc is NOT on screen in Phase 2. Instead: a CSS-based disc element appears and animates to the top-left corner as the Home button. The 3D IdentityDisc component is used only for the docked nav state, not as a centerpiece.
   - FR3.4 (Grid Powers On): Remove "The faint hover-state grid permanently locks in" -- there is no hover-state grid preview anymore. Instead: the grid illuminates fresh as part of the transition.
   - Update the trigger from "onClick on the central Identity Disc" to "onClick on the ENTER THE GRID button"

4. FR6 (Global Navigation):
   - FR6.1: Change "small red disc" to "small red disc icon" to clarify it is a CSS/DOM element, not the 3D disc.

5. Color Palette table (Section 3):
   - Change Crimson Red usage from "Identity Disc, 'TANMAY GOEL' typography" to "'TANMAY GOEL' typography, HUD nav disc, 'ENTER THE GRID' button glow"

**CLAUDE.md changes:**

1. Architecture > Phase-Based State Machine:
   - Line 2: Change "Main Hub (Identity Disc) -- Central 3D disc with title text" to "Main Hub (Title Screen) -- Title text with 'ENTER THE GRID' CTA button"
   - Line 3: Change "Shatter & Dock -- Disc shrinks to nav button, grid powers on" to "Shatter & Dock -- Grid powers on, nav HUD appears with docked disc icon"

2. Key Directories:
   - `src/components/3D/` description: Change "Grid, Disc, Panes, Monoliths" to "Grid, Panes, Monoliths (IdentityDisc preserved for HUD nav)"

3. Status line: Change "Pre-implementation -- SPEC.md is complete, no source code yet" to "Active development -- Phase 1 complete, Phase 2+ in planning"
  </action>
  <verify>
    <automated>grep -c "Identity Disc" SPEC.md | xargs -I{} test {} -le 3 && echo "PASS: disc references reduced" || echo "FAIL: too many disc references"; grep "Main Hub" CLAUDE.md | grep -q "Title Screen" && echo "PASS: CLAUDE.md updated" || echo "FAIL: CLAUDE.md not updated"</automated>
  </verify>
  <done>SPEC.md FR2 describes the title screen + Enter button (not the disc), FR3 trigger is the button click, CLAUDE.md architecture lists "Title Screen" for Phase 2. The Identity Disc is mentioned only in the context of the docked HUD nav button (Phase 3+) and the IdentityDisc.jsx component file.</done>
</task>

<task type="auto">
  <name>Task 2: Update ROADMAP.md, PROJECT.md, and 02-CONTEXT.md</name>
  <files>.planning/ROADMAP.md, .planning/PROJECT.md, .planning/phases/02-shatter-dock/02-CONTEXT.md</files>
  <action>
Read all three files fully before editing.

**ROADMAP.md changes:**

1. Phase 1 description line: Change "Rebuild the IdentityDisc visual and implement the boot sequence" to "Implement the boot sequence and title screen with Enter the Grid CTA"
2. Phase 1 Goal: Change "visitor sees the rebuilt disc and the boot sequence plays once per session" to "visitor sees the boot sequence play once per session, then the title screen with ENTER THE GRID button"
3. Phase 1 Success Criteria item 1: Change "IdentityDisc displays multiple layered concentric rings..." to "Title screen displays 'TANMAY GOEL' / 'SOFTWARE DEVELOPER' text with 'ENTER THE GRID' button featuring glitch-decode animation"
4. Phase 1 Success Criteria item 4: Change "lands directly on the disc" to "lands directly on the title screen"
5. Phase 2 Goal: Change "Clicking the disc collapses it into the top-left corner" to "Clicking 'ENTER THE GRID' triggers the transition -- grid illuminates, CSS disc docks to top-left as Home button"
6. Phase 2 Success Criteria item 1: Change "Clicking the disc triggers a wind-down scale animation" to "Clicking 'ENTER THE GRID' triggers the transition: a CSS disc element animates to the top-left corner and settles as a Home button"
7. Plan 01-01 description: Change "Rebuild IdentityDisc 3D model with 7 torus rings and metallic center" to "Rebuild IdentityDisc 3D model (preserved for HUD nav) and title screen layout"

**PROJECT.md changes:**

1. Validated requirements: Update "IdentityDisc (Phase 2): 3D disc with procedural texture..." to "Title Screen (Phase 2): 'TANMAY GOEL' / 'SOFTWARE DEVELOPER' text with 'ENTER THE GRID' glitch CTA button; IdentityDisc component preserved for docked HUD nav"
2. Active requirements: Update "Phase 3: Shatter & Dock transition -- disc scales down and lerps to top-left" to "Phase 3: Shatter & Dock transition -- grid illuminates, CSS disc docks to top-left as Home button, social icons and mute toggle appear"

**02-CONTEXT.md changes:**

1. Domain section: The phrase "Clicking 'ENTER THE GRID' triggers the disc dock animation" is already mostly correct. Verify and ensure no references to "clicking the disc" remain as the trigger.
2. Decisions > Disc Dock Animation: Clarify that the 3D IdentityDisc is NOT on screen at Phase 2 start. The dock animation creates a DOM disc from scratch (or fades it in) and animates it to the top-left. Remove any reference to "the 3D IdentityDisc fading out" during dock -- it was already removed from Scene.jsx.
3. Decisions > Phase Transition Sequence: Update to remove "IdentityDisc triggers dock animation sequence on phase 3 detection" -- the IdentityDisc is not mounted in Phase 2. Instead: the DOM disc element appears at viewport center and GSAP animates it to top-left.
4. Code Context > Integration Points: Update IdentityDisc.jsx bullet to note: "IdentityDisc.jsx is NOT mounted during Phase 2 (removed in quick task 260317-rg5). It may be re-mounted later for the docked HUD state or replaced entirely by the CSS disc."
  </action>
  <verify>
    <automated>grep -c "Clicking the disc" .planning/ROADMAP.md | xargs -I{} test {} -eq 0 && echo "PASS: ROADMAP disc-click refs removed" || echo "FAIL"; grep "Title Screen" .planning/PROJECT.md | head -1 | grep -q "Title Screen" && echo "PASS: PROJECT.md updated" || echo "FAIL"</automated>
  </verify>
  <done>ROADMAP Phase 1/2 descriptions, goals, and success criteria reference the title screen + Enter button. PROJECT.md validated/active lists are accurate. 02-CONTEXT.md dock animation description no longer references a 3D disc being on screen during Phase 2.</done>
</task>

</tasks>

<verification>
After both tasks complete:
1. `grep -rn "Identity Disc" SPEC.md CLAUDE.md .planning/ROADMAP.md .planning/PROJECT.md .planning/phases/02-shatter-dock/02-CONTEXT.md` -- remaining mentions should only be in context of the docked HUD nav or the preserved component file, never as "the main hub centerpiece"
2. `grep -n "onClick.*disc\|click.*disc\|Clicking the disc\|clicking the disc" SPEC.md .planning/ROADMAP.md .planning/phases/02-shatter-dock/02-CONTEXT.md` -- should return 0 results (trigger is now the button)
3. `npm run build` passes (no file changes affect code, but confirms nothing was accidentally broken)
</verification>

<success_criteria>
- All 5 files consistently describe Phase 2 as a title screen with "ENTER THE GRID" button
- No file describes clicking the disc as the Phase 2->3 transition trigger
- The Identity Disc / IdentityDisc.jsx is mentioned only as a preserved component for future HUD nav use
- Phase 2 (Shatter & Dock) context correctly describes the DOM-based disc dock animation without assuming a 3D disc is on screen
</success_criteria>

<output>
After completion, create `.planning/quick/260318-qle-update-spec-and-planning-files-identity-/260318-qle-SUMMARY.md`
</output>
