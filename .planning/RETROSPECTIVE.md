# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-19
**Phases:** 4 | **Plans:** 13 | **Timeline:** 9 days (2026-03-10 → 2026-03-19)

### What Was Built
- Canvas 2D boot animation with dual light-cycle sprites (cyan/orange) tracing "LOADING", collision flash, Howler.js audio fade-in, and sessionStorage boot gate
- 7-ring IdentityDisc with emissiveIntensity up to 8.0 producing Crimson Red Bloom halos matching Tron visual reference
- GSAP disc dock transition + persistent HUD (disc + name top-left, social icons bottom-right)
- Three billboarding holographic gateway panes with idle chaos surface texture, hover decrypt animation, and grid light pulse
- Three full content sectors: Projects 2D card overlay (with decorative 3D monoliths), About terminal typewriter (6-command bio), Skills Canvas 2D network graph with light-racer expansion
- Mobile graceful degradation (MobileGateway stacked cards), SEO/OG meta tags, TR2N crimson favicon

### What Worked
- **Coarse granularity** — 4 phases mapping directly to the product's natural experience layers (Boot, Dock, Grid, Sectors) kept planning overhead minimal while delivering complete playable slices
- **High emissiveIntensity strategy** — once discovered that Bloom threshold is 0.2, targeting emissiveIntensity 3.5–8.0 with `toneMapped={false}` reliably produced Tron-quality halos without trial-and-error
- **Canvas 2D for animation-heavy components** — boot sequence and skills graph both benefited from direct Canvas API control vs. trying to choreograph Three.js objects
- **Data-driven content pattern** — `src/data/projects.js`, `skills.js`, `contact.js` meant sector components never needed editing when content changed
- **GSAP for the dock transition** — `power2.inOut` easing + `onComplete` callback made the sequence feel polished with minimal code

### What Was Inefficient
- **Projects sector scope shift** — original plan called for 3D monolith fly-through as primary UI; pivoted to 2D card overlay mid-execution; monoliths became decorative. Could have been resolved earlier in planning with a clearer wireframe
- **Phase 4 task count (5 plans vs. 4)** — a gap-closure plan (04-05) was needed to populate real project/contact data that should have been specified upfront in data config
- **No milestone audit** — proceeding without `/gsd:audit-milestone` means cross-phase integration was verified manually rather than systematically

### Patterns Established
- **Bloom requires `toneMapped={false}` + high emissiveIntensity (3.5+)** — log luminanceThreshold and set emissive values accordingly
- **DOM elements for persistent UI overlay** — use CSS/HTML div elements (not R3F) for HUD elements that must survive scene transitions
- **Canvas 2D clip regions for sprite animation** — letter-tracing effect achieved cleanly with `ctx.clipPath` per glyph rather than complex geometry
- **`useFrame` + `Math.atan2` for billboarding** — simple Y-rotation formula keeps panes facing camera without R3F billboard helper overhead

### Key Lessons
1. **Plan the Projects sector interaction model before Phase 3** — the pane-click → sector fly-through contract needed to be finalized before building panes; late pivot cost a plan
2. **Populate content data files before final phase** — real content (project names, contact links, bio text) should be captured in `src/data/` before the sector rendering phase begins
3. **Run `/gsd:audit-milestone` before completion** — catching integration gaps (e.g., Home button returning to correct phase, mobile sector routing) systematically saves manual QA time

### Cost Observations
- Model mix: ~100% sonnet (balanced profile throughout)
- Sessions: ~10 sessions across 9 days
- Notable: Canvas 2D components (boot, skills) were fast to build once the animation model was clear; Three.js debugging (disc rings, pane billboarding) took proportionally more time

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 13 | Initial build — established all base patterns |

### Cumulative Quality

| Milestone | Requirements | Coverage | Notes |
|-----------|-------------|----------|-------|
| v1.0 | 38/38 | 100% | All v1 requirements shipped |
