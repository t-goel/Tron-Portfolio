# Phase 1: Boot + Disc Foundation - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the IdentityDisc 3D model to match the reference image, implement the boot sequence (light-cycle sprites draw "LOADING" → collision flash → music fade-in → title reveal → transition to Phase 2 disc scene), and add a WebGL fallback error screen. Disc click behavior, social icons, and grid illumination belong to Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Boot Sequence Rendering
- BootSequence lives as a DOM overlay component in `src/components/UI/BootSequence.jsx` (NOT inside the Three.js canvas)
- Renders full-viewport HTML Canvas 2D on a black div, positioned absolute on top of everything
- Three.js canvas does not need to be initialized during boot sequence
- Phase transition: when boot completes, BootSequence unmounts and the R3F canvas (Scene.jsx with IdentityDisc) becomes visible

[auto] Boot sequence rendering — Q: "DOM overlay or Three.js canvas?" → Selected: DOM overlay (recommended default)

### Light-Cycle Animation Technique
- Two sprites simultaneously trace the letters of "LOADING" on a 2D canvas
- Cyan sprite draws the top half of each letter; orange sprite draws the bottom half — both at 90-degree sweep angles per the spec
- Implementation: HTML Canvas 2D with font outline path coordinates. Pre-compute letter bounding boxes and split at vertical midpoint; each sprite sweeps along its half-path using a progress variable advanced per requestAnimationFrame tick
- On collision: sprites converge at letter center, trigger flash that expands radially to fill viewport in 0.2s, then fade to black
- No Three.js, no SVG — pure Canvas 2D for this component

[auto] Light-cycle animation — Q: "How to draw letters with sprites?" → Selected: HTML Canvas 2D path tracing (recommended default)

### Audio Autoplay Strategy
- Howler.js initialized in `src/utils/audioManager.js` (new utility file)
- Music fades in after the boot flash fades to black (BOOT-03 timing)
- Attempt autoplay immediately at that point; use Howler's `fade(0, 1, 2000)` for 2-second fade-in
- If browser blocks autoplay: show minimal "CLICK TO ENABLE AUDIO" prompt in the boot UI; trigger play on first click
- `audioEnabled` state in Zustand toggles mute/unmute but does not stop the track

[auto] Audio autoplay — Q: "When/how does music start?" → Selected: Attempt autoplay at boot end; fall back to click-to-enable (recommended default)

### Disc Rebuild Approach
- Keep and enhance the existing procedural approach in `src/components/3D/IdentityDisc.jsx`
- Visual changes required (DISC-01):
  - Add more concentric torus rings at varying radii and tube widths to create layered depth
  - Increase Crimson Red (`#FF0000`) emissive intensity significantly (currently too dim)
  - Adjust torus geometry parameters (tubularSegments, radialSegments) for beveled 3D depth
  - Dark metallic center disc material (MeshStandardMaterial with metalness: 0.9, roughness: 0.1)
  - Use reference image (`reference/Screenshot 2026-03-10 at 11.18.58 PM.png`) as visual benchmark during development
- Preserve: particle system, hover animations, grid floor preview, rotation
- Performance: texture generation stays in useMemo; consider reducing grid divisionsX/Z from 60/40 to 40/30 on rebuild

[auto] Disc rebuild — Q: "Procedural or texture-based?" → Selected: Enhance procedural (recommended default)

### WebGL Fallback
- Detect WebGL on App mount using a utility (`src/utils/webglDetect.js`)
- If unavailable, render `src/components/WebGLFallback.jsx` — a styled full-viewport error message in Tron aesthetic
- Error message includes: "THIS EXPERIENCE REQUIRES WEBGL" with direct links to GitHub, LinkedIn, and email from `src/data/contact.js`
- No boot sequence plays if WebGL is unavailable

### Claude's Discretion
- Exact easing curves for the boot flash expansion (radial gradient animation timing)
- Letter path coordinate calculation strategy (measure via canvas font metrics or hardcode key points)
- Exact number and radii of additional torus rings on the disc (use reference image as guide)
- Audio track file location and filename (reference spec says "Just Turn It On and Make Something")

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Requirements
- `SPEC.md` — Full product requirements; §FR1 covers boot sequence spec in detail; §NFR6 covers WebGL fallback
- `.planning/REQUIREMENTS.md` §Boot Sequence — BOOT-01, BOOT-02, BOOT-03, BOOT-04, AUDIO-01, NFR-01 requirements (traceability table)
- `.planning/ROADMAP.md` §Phase 1 — Plans 01-01, 01-02, 01-03 and success criteria

### Reference Visual
- `reference/Screenshot 2026-03-10 at 11.18.58 PM.png` — Target visual for DISC-01 (IdentityDisc rebuild). Downstream agents MUST examine this image before planning the disc geometry changes.

### Existing Code to Modify
- `src/components/3D/IdentityDisc.jsx` — Existing disc; needs visual rebuild (DISC-01). Read before making any plan tasks.
- `src/components/Scene.jsx` — Conditionally renders by phase; BootSequence must be wired here or in App.jsx
- `src/store/appState.js` — Phase state machine; boot sequence triggers `setPhase` on completion
- `src/components/UI/TitleOverlay.jsx` — Title overlay already exists; boot sequence must coordinate with it for BOOT-03 title fade-in

### Design System
- `src/index.css` — CSS variables for colors (--color-cyan, --color-orange, --color-crimson, etc.) and font declarations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/UI/TitleOverlay.jsx`: Already renders "TANMAY GOEL" + "SOFTWARE DEVELOPER" with glitch effect — BOOT-03 title reveal should reuse this component rather than re-implementing the title text
- `src/store/appState.js`: `setPhase()` action available — BootSequence calls this when complete to transition to Phase 2 (disc scene)
- `src/store/appState.js`: `audioEnabled` state already exists — AudioManager should subscribe to this for mute toggle
- `src/components/Scene.jsx`: EffectComposer with Bloom + Vignette already configured — no need to re-add postprocessing
- `src/data/contact.js`: Contact links (GitHub, LinkedIn, email) — WebGL fallback screen imports from here

### Established Patterns
- Phase-conditional rendering: `{phase === N && <Component />}` in Scene.jsx — BootSequence renders when `phase === 1` (or equivalent BOOT phase constant)
- Zustand subscription: `const { phase, setPhase } = useAppState(s => ({ phase: s.phase, setPhase: s.setPhase }))` — selector pattern already used
- Procedural geometry with `useMemo`: disc texture generation uses `useMemo` — maintain this pattern for any new geometry in the disc
- CSS variables for colors: `var(--color-cyan)` `var(--color-crimson)` available in HTML canvas `ctx.strokeStyle` for boot sequence

### Integration Points
- `src/App.jsx`: DOM overlay structure (Canvas + absolute-positioned divs) — BootSequence overlay added here alongside TitleOverlay
- `src/store/appState.js`: Phase 1 constant (PHASE_BOOT or similar) needs to be defined if not already — add to phase constants
- `src/components/Scene.jsx`: Phase guard around IdentityDisc — disc scene should only render after boot completes (when phase transitions past 1)
- `sessionStorage` flag: boot sequence checks `sessionStorage.getItem('bootPlayed')` on mount; sets it on completion; skips to Phase 2 if already set (BOOT-04)

</code_context>

<specifics>
## Specific Ideas

- The boot sequence should feel like a loading screen that IS the experience — not just a spinner. The light-cycle sprite animation is the hero moment.
- BOOT-03 says "TANMAY GOEL" appears in Red (Crimson Red), "SOFTWARE DEVELOPER" in White (Off-White) — existing TitleOverlay currently may not have this exact color; verify and adjust if needed.
- sessionStorage key: `'tron-boot-played'` or similar — set after boot completes, checked on App mount.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-boot-disc-foundation*
*Context gathered: 2026-03-17*
