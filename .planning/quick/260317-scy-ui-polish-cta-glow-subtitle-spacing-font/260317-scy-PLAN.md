---
phase: quick
plan: 260317-scy
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/UI/EnterButton.jsx
  - src/components/UI/TitleOverlay.jsx
autonomous: true
requirements: [ui-polish]
must_haves:
  truths:
    - "ENTER THE GRID button text is vivid red with white-core neon treatment, not muted"
    - "Button border has a faint red glow at rest"
    - "SOFTWARE DEVELOPER subtitle has 10-15px top margin and reduced opacity (~0.7) or desaturated red tint"
    - "Name text-shadow blur radii are tighter so letter segments (M, A, E) remain crisp and readable"
  artifacts:
    - path: "src/components/UI/EnterButton.jsx"
      provides: "Vivid red button text with white-core neon, faint red border glow"
    - path: "src/components/UI/TitleOverlay.jsx"
      provides: "Tighter name glow, spaced + dimmed subtitle"
  key_links: []
---

<objective>
Polish three visual elements on the main hub screen: brighten the CTA button text with a white-core neon red treatment and add a faint red glow to the border, increase subtitle spacing and reduce its prominence, and tighten the name glow so individual letter segments stay crisp.

Purpose: Improve visual hierarchy and readability of the main hub.
Output: Updated EnterButton.jsx and TitleOverlay.jsx with CSS tweaks.
</objective>

<execution_context>
@/Users/tanmaygoel/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tanmaygoel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/UI/EnterButton.jsx
@src/components/UI/TitleOverlay.jsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Brighten CTA button text and add red border glow</name>
  <files>src/components/UI/EnterButton.jsx</files>
  <action>
In EnterButton.jsx, make these style changes:

1. **Button text color (non-hover):** Change from `'rgba(255, 0, 0, 0.75)'` to `'#FF3333'` (vivid red, not muted).

2. **Button text-shadow (non-hover):** Change from `'0 0 8px rgba(255, 0, 0, 0.4)'` to a white-core neon treatment:
   `'0 0 4px rgba(255, 255, 255, 0.8), 0 0 11px rgba(255, 0, 0, 0.7), 0 0 22px rgba(255, 0, 0, 0.4)'`
   The first layer is the white core, subsequent layers are the red bloom.

3. **Button text-shadow (hover):** Update to:
   `'0 0 6px rgba(255, 255, 255, 0.9), 0 0 16px rgba(255, 0, 0, 0.9), 0 0 32px rgba(255, 0, 0, 0.5)'`

4. **borderPulse keyframes:** Add a subtle red glow to the border at rest. Update the 0%/100% keyframe box-shadow from `0 0 8px rgba(255, 0, 0, 0.2)` to `0 0 10px rgba(255, 0, 0, 0.3)` so the border has a faint persistent red glow even at the animation trough.
  </action>
  <verify>
    <automated>cd /Users/tanmaygoel/CS/Tron-Portfolio && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Button text is vivid red with white-core neon glow at rest and on hover; border has faint red glow throughout pulse cycle.</done>
</task>

<task type="auto">
  <name>Task 2: Subtitle spacing/opacity and tighter name glow</name>
  <files>src/components/UI/TitleOverlay.jsx</files>
  <action>
In TitleOverlay.jsx, make these style changes:

1. **Subtitle (SOFTWARE DEVELOPER) top margin:** Change `marginTop: '0.5rem'` to `marginTop: '0.9rem'` (~14px, within the 10-15px ask).

2. **Subtitle opacity/tint:** Change `color: '#F0F0F0'` to `color: 'rgba(255, 200, 200, 0.65)'` — a desaturated pinkish-red at ~0.65 opacity. This both reduces prominence and adds a subtle warm tint that ties to the red theme. Update textShadow to `'0 0 8px rgba(255, 100, 100, 0.2)'` (faint red-tinted glow instead of white).

3. **Name h1 text-shadow:** The current shadow has very large blur radii (42px, 82px, 92px, 102px, 151px) which wash out letter details. Replace the textShadow with tighter values:
   `'0 0 4px #fff, 0 0 8px #fff, 0 0 15px #fff, 0 0 30px #FF0000, 0 0 50px #FF0000, 0 0 60px #FF0000'`
   This keeps the white core crisp (4px, 8px, 15px) and reduces the red bloom radii so M, A, E letter segments remain readable.
  </action>
  <verify>
    <automated>cd /Users/tanmaygoel/CS/Tron-Portfolio && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Name glow is tighter with readable letter segments; subtitle has more top spacing and reduced prominence with desaturated red tint.</done>
</task>

</tasks>

<verification>
`npm run build` succeeds without errors. Visual inspection confirms: button text is vivid with white-core neon, subtitle is spaced and dimmed, name letters are crisp.
</verification>

<success_criteria>
- Build passes
- EnterButton text is vivid red (#FF3333) with white-core text-shadow layers
- Border pulse has faint red glow at rest
- Subtitle has ~14px top margin and reduced opacity with warm tint
- Name text-shadow blur radii are tighter (max 60px vs previous 151px), preserving letter detail
</success_criteria>

<output>
After completion, create `.planning/quick/260317-scy-ui-polish-cta-glow-subtitle-spacing-font/260317-scy-SUMMARY.md`
</output>
