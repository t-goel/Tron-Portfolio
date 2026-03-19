# Phase 4: Sector Dives + Finish - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

All three content sectors (Projects, About Me, Skills) are fully navigable — clicking a gateway pane flies the camera into the sector, content renders and is interactive, HUD returns to Grid World. Additionally: mobile graceful degradation, OG meta tags, and TR2N favicon are implemented so the portfolio is deployable.

Clicking a pane (sector navigation trigger) is the entry point. Grid World pane geometry/hover effects are Phase 3 scope — Phase 4 adds the click handler and everything beyond the threshold.

</domain>

<decisions>
## Implementation Decisions

### Sector Navigation Transition (PROJ-01, ABOUT-01, SKILLS-01)
- On gateway pane click: GSAP lerp camera to a position 2 units past the pane center (~1.0s ease-in-out)
- During transit: gateway panes fade out (opacity 1 → 0 over 0.5s)
- On arrival: sector component mounts and fades in (opacity 0 → 1 over 0.4s)
- `setActiveSector('projects' | 'about' | 'skills')` drives sector mount via Zustand `activeSector` (already in store)
- Returning via HUD: `setActiveSector(null)` + reverse GSAP lerp back to `[0, 8, 14]` + panes fade back in
- Transition state tracked in Zustand (add `transitioning: false` flag to prevent double-clicks during animation)

### Projects Sector — 2D Overlay Panel (PROJ-02/03/04/05/06)
- **Key decision (from CLAUDE.md note):** Implement as a 2D full-viewport HTML overlay panel for speed and ease of access, not pure 3D interaction. The 3D monolith silhouettes are visible as decorative background ambiance while the overlay is open.
- Overlay: fixed 100vw × 100vh div with `backdrop-filter: blur(8px)` + dark background (`rgba(0,0,0,0.85)`)
- Content: vertically scrollable column of project cards
- Each card: accent-colored left border (2px), project name in TR2N font (large), tagline in Roboto Mono, tech stack as inline pill tags (rounded, cyan/orange), "VIEW ON GITHUB ↗" link
- Active project (data `active: true`): Crimson Red accent border + "IN PROGRESS" badge in top-right corner; others use Neon Orange accent
- All project content driven from `src/data/projects.js` — no hardcoded data in component
- GitHub link opens in new tab (`target="_blank"`)
- **⚠ Data blocker:** `src/data/projects.js` contains TBD placeholders — executor must prompt user to fill real project data before this sector can be meaningfully tested

### About Me Sector — Terminal Interface (ABOUT-01/02/03/04)
- Full viewport HTML overlay (fixed 100vw × 100vh), `backdrop-filter: blur(12px)` + `rgba(0,0,0,0.9)` background
- Terminal window: Roboto Mono, Neon Cyan text on black, top chrome bar with red/yellow/green dot decorations
- Auto-typewriter sequence (35ms per character, 400ms pause between commands):
  ```
  $ whoami
  tanmay-goel

  $ cat background.txt
  [Bio: CS at UIUC (Class of 2027), building full-stack and ML systems]

  $ cat interests.txt
  [Interests: AI/ML research, distributed systems, immersive frontends]

  $ cat looking_for.txt
  [Seeking: SWE/ML internship opportunities — Summer 2027]

  $ ls contact/
  github.txt  linkedin.txt  email.txt

  $ cat contact/*
  [Renders each contact link as a clickable cyan anchor]
  ```
- Contact links sourced from `src/data/contact.js` — render as `<a>` tags styled with Neon Cyan glow
- **⚠ Data blocker:** `src/data/contact.js` contains TBD placeholders — executor must prompt user to fill github, linkedin, email before this sector is complete
- Bio copy: Claude writes placeholder-quality professional bio from context (Tanmay Goel, CS UIUC, AI/ML + full-stack focus, seeking internships); user reviews and edits in data file

### Skills Sector — Network Graph (SKILLS-01/02/03/04/05)
- Full viewport HTML Canvas 2D overlay (same backdrop-filter blur pattern as About/Projects)
- Canvas fills 100vw × 100vh, re-renders on resize
- **Tier 1 node layout:** 5 category nodes in radial arrangement around canvas center, radius 200px, evenly spaced (72° apart). Node: filled circle (radius 30px) in category color, label below in Roboto Mono
- **Tier 1 edges:** faint glowing lines connecting all Tier 1 nodes to center (or hub-and-spoke from center point)
- **Tier 2 expansion (SKILLS-03):** On Tier 1 click — animate a "light-racer" point traveling outward from that node along polar-offset directions (one per skill), then spawn skill label node at endpoint. Duration: 0.6s. Uses `requestAnimationFrame` loop inside the canvas handler.
- **Collapse (SKILLS-04):** Second click on same Tier 1 node — reverse animation: trails retract, skill nodes disappear
- **Hover (SKILLS-05):** Cursor proximity (within 35px) triggers: node brightness pulse (scale alpha 0.6 → 1.0), all connected edges highlight in full cyan, label shown if hidden
- Colors: Tier 1 node colors from `skillCategories[i].color` in `src/data/skills.js`; Tier 2 nodes inherit parent color at 70% opacity

### Mobile Graceful Degradation (NFR-02)
- Breakpoint: `<768px` (matches existing CSS pattern)
- OrbitControls: disabled (remove from Scene.jsx under mobile check, or set `enabled={!isMobile}`)
- Gateway panes: replaced by 3 vertically stacked 2D cards in a scrollable container (same glass/cyan aesthetic as pane texture)
- Each mobile card: tappable, opens the corresponding sector inline below the card
- Grid background: static CSS pattern (repeating grid lines via `background-image: linear-gradient`) or SVG — no Three.js grid computation
- Sector content (Projects/About/Skills): renders the same 2D overlay components, no changes needed — they work on mobile already
- `isMobile` hook: `window.innerWidth < 768` with resize listener, or CSS media query via `matchMedia`

### SEO, OG Tags, Favicon (NFR-04, NFR-05)
- **index.html `<head>` additions:**
  - `<title>Tanmay Goel — Software Developer</title>`
  - `<meta name="description" content="Tanmay Goel — CS at UIUC. Full-stack and ML engineer. Interactive 3D portfolio.">`
  - OG tags: `og:title`, `og:description`, `og:type: website`, `og:image` (static image in `/public/`)
  - Twitter card meta tags (summary_large_image)
- **Favicon:** Inline `<script>` in `<head>` draws "T" in Crimson Red (`#FF0000`) in TR2N-style on 32×32 black canvas, converts to dataURL, injects as `<link rel="icon">`. Fallback: `/public/favicon.ico` (same "T" as PNG)
- **OG image:** Generate a 1200×630 screenshot or static PNG in `/public/og-image.png` — dark background, "TANMAY GOEL / SOFTWARE DEVELOPER" text with grid visual

### Claude's Discretion
- Exact camera positions for each sector (depth past pane, height adjustment)
- Bio copy content (user will review and edit in data files)
- Exact timing curves for light-racer Tier 2 expansion
- Whether to use CSS `backdrop-filter` blur or a Three.js blur pass for sector overlays (CSS is simpler and sufficient)
- Favicon generation approach (inline script vs build-time asset)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Full requirement IDs for Phase 4: PROJ-01 through PROJ-06, ABOUT-01 through ABOUT-04, SKILLS-01 through SKILLS-05, NFR-02, NFR-04, NFR-05

### Product Spec
- `SPEC.md` — Authoritative product requirements document (at project root)

### Data Config (must be populated before execution)
- `src/data/projects.js` — Project data schema: id, name, tagline, techStack[], accentColor, githubUrl, active, position
- `src/data/skills.js` — Skills categories: id, label, color, skills[]
- `src/data/contact.js` — Contact links: github, linkedin, email

### Existing Phase Patterns
- `src/components/3D/GatewayPane.jsx` — Canvas 2D texture pattern, useFrame, GSAP animations
- `src/components/UI/BootSequence.jsx` — Canvas 2D animation loop pattern
- `src/store/appState.js` — Zustand store: phase, activeSector, hudVisible, setActiveSector
- `src/components/Scene.jsx` — Scene composition, OrbitControls integration point

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useAppState.activeSector` (Zustand) — already wired for null/'about'/'skills'/'projects' — sector mount/unmount is just a conditional render on this value
- `GatewayPane.jsx` onPointerEnter/Leave pattern — add `onPointerDown` for click navigation trigger
- GSAP (imported in GatewayPane/BootSequence) — same library for camera lerp transitions
- `src/data/skills.js` — `skillCategories` array with id, label, color, skills[] — drives Skills graph directly
- `src/data/projects.js` — `projects` array — drives Projects cards directly

### Established Patterns
- Canvas 2D in `useFrame` with throttling (Phase 3) — same pattern for Skills network graph
- `backdrop-filter: blur` + dark overlay — CSS pattern used in BootSequence; reuse for sector overlays
- CSS variables from design system (`--cyan`, `--orange`, `--crimson`, `--void`) — use throughout sector components
- GSAP timeline for sequenced animations (BootSequence) — reuse for typewriter terminal

### Integration Points
- `Scene.jsx`: add click handler dispatch to GatewayPanes; mount sector components conditionally on `activeSector`
- `GatewayPanes.jsx`: pass `onPaneClick(label)` prop down to each `GatewayPane`
- `App.jsx`: render sector overlay components as fixed-position children outside the R3F `<Canvas>` (they're HTML, not 3D)
- `index.html`: add `<head>` meta tags and favicon script

</code_context>

<specifics>
## Specific Ideas

- CLAUDE.md note: "I want to prioritize speed and ease of access to projects. Maybe make the projects a normal webpage/browser scroll." — Addressed by implementing Projects as a 2D scrollable HTML overlay instead of pure 3D interaction, while keeping monolith silhouettes as background ambiance.
- Terminal "feels like a real bash session" — green prompt marker `$`, cursor blink between commands
- Skills graph: light-racer expansion should feel like the boot sequence light-cycles — same visual language

</specifics>

<deferred>
## Deferred Ideas

- None raised during auto-discussion — all ideas are within Phase 4 scope or already in v2 requirements.

</deferred>

---

*Phase: 04-sector-dives-finish*
*Context gathered: 2026-03-19*
