# Codebase Concerns

**Analysis Date:** 2026-03-17

## Critical Missing Implementations

**Phase System Incomplete:**
- Issue: SPEC.md requires 5 distinct phases (Boot, Identity Disc, Shatter & Dock, Grid World, Sector Dive), but only Phase 2 (Identity Disc) has any implementation
- Files: `src/components/Scene.jsx`, `src/store/appState.js`
- Impact: App currently renders only the Identity Disc and cannot progress through required user journey. Phases 1, 3, 4, 5 are entirely unbuilt
- Fix approach: Implement phase components in `src/components/phases/BootSequence.jsx`, `src/components/phases/ShatterDock.jsx`, `src/components/phases/GridWorld.jsx`, `src/components/phases/SectorDive.jsx`. Phase transitions controlled via `appState.phase` with conditional rendering in Scene.jsx

**Core Components Not Implemented:**
- Issue: Empty `src/components/phases/` directory; no Grid, Panes, Monoliths, or sector view components exist
- Files: `src/components/3D/`, `src/components/phases/`
- Impact: Cannot navigate to About, Skills, or Projects sectors. No 3D gateway system
- Fix approach: Create component structure:
  - `src/components/3D/Grid.jsx` — isometric grid floor
  - `src/components/3D/GatewayPane.jsx` — semi-transparent panes with billboard behavior
  - `src/components/3D/ProjectMonolith.jsx` — individual project display
  - `src/components/phases/GridWorld.jsx` — phase 4 orchestrator
  - `src/components/phases/SectorAbout.jsx`, `SectorSkills.jsx`, `SectorProjects.jsx` — phase 5 variants

**Boot Sequence Animation Not Implemented:**
- Issue: Phase 1 (two light-cycle racers drawing "LOADING" text) is completely missing
- Files: None exist yet; spec details in SPEC.md §FR1
- Impact: User sees no boot animation; immediate disc appearance; no visual polish or perceived load cover
- Fix approach: Create `src/components/phases/BootSequence.jsx` with canvas-based light-cycle animation

**Audio System Not Integrated:**
- Issue: No Howler.js integration; audio toggle exists in state (appState.js) but no playback, no track loading, no player component
- Files: `src/store/appState.js` (has `audioEnabled` state but nothing uses it)
- Impact: Cannot play background music as specified (tracks: "Just Turn It On and Make Something", "Last Stop by Karl Casey")
- Fix approach: Create `src/utils/audioManager.js` using Howler.js; initialize tracks on app load; wire toggle in HUD

**Glitch Effect Timing Issue:**
- Issue: TitleOverlay glitch effect resets after 15 random cycles (~1 second), creating jerky appearance on sustained hover
- Files: `src/components/UI/TitleOverlay.jsx` lines 10-36
- Impact: Hover glitch visual feels artificial; noticeable gap before re-triggering
- Fix approach: Use GSAP timeline instead of setInterval for smoother glitch sequences; ensure continuous effect during hover

## Placeholder Data Blocking Deployment

**All Project Data TBD:**
- Issue: `src/data/projects.js` contains three entries with all values as "TBD", including GitHub URLs
- Files: `src/data/projects.js` lines 1-30
- Impact: Projects sector will render empty/broken monoliths if feature is built; unfinished appearance if deployed
- Fix approach: Populate with real project data before deployment; ensure `githubUrl` links are valid for external navigation

**Contact Links TBD:**
- Issue: `src/data/contact.js` has placeholder values; GitHub URL, LinkedIn URL, email all "TBD"
- Files: `src/data/contact.js` lines 1-5
- Impact: Bottom-right HUD social icons and About sector contact links will be non-functional or broken
- Fix approach: Fill with actual URLs/email before feature completion; store in env vars if sensitive

## Performance Concerns

**IdentityDisc Texture Generation Per-Component:**
- Issue: `createDiscTexture()` function (line 9 in IdentityDisc.jsx) generates a 1024x1024 canvas texture on every render cycle via useMemo
- Files: `src/components/3D/IdentityDisc.jsx` lines 9-210
- Impact: While useMemo memoizes, regenerating complex canvas geometry with 400+ line draws on initial load delays render; texture size (1MB at 1024x1024) may impact mobile
- Fix approach: Move texture generation to a one-time utility function outside component; consider pre-baking texture as image asset; reduce divisionsX/divisionsZ in grid generation (currently 60/40 = 2400 line segments)

**Particle System Direct Attribute Access in useFrame:**
- Issue: Particle position updates manipulate raw typed array on every frame (IdentityDisc.jsx lines 309-336), bypassing Three.js optimization patterns
- Files: `src/components/3D/IdentityDisc.jsx` lines 308-338
- Impact: 150 particles × frame updates = potential bottleneck; no culling or LOD; unpredictable performance on low-end devices
- Fix approach: Use shader-based particle animation instead of CPU attribute updates; or implement simple frustum culling

**Grid Floor Scaling Not Tested on Mobile:**
- Issue: Grid dimensions hardcoded as 60×40 units (lines 248-249); no viewport aspect ratio adjustment
- Files: `src/components/3D/IdentityDisc.jsx` lines 245-265
- Impact: Mobile viewports (<768px) may see off-screen grid or stretched/distorted perspective; NFR2 specifies mobile degradation, but implementation incomplete
- Fix approach: Compute grid size based on camera FOV and viewport aspect ratio; adjust divisionsX/divisionsZ dynamically

## Architecture Gaps

**Monolithic Scene Component:**
- Issue: Scene.jsx (34 lines) only conditionally renders IdentityDisc; no structure for phases 3-5 or layer organization
- Files: `src/components/Scene.jsx`
- Impact: As phases are added, Scene.jsx will become unscalable; all phase rendering logic crammed into one file
- Fix approach: Create phase orchestrator pattern; e.g., `usePhase()` hook that returns component to render; keep Scene.jsx focused on lights/effects only

**State Management Incomplete:**
- Issue: appState.js has minimal state (phase, audioEnabled, hudVisible, activeSector); missing camera state, UI animations, transition progress
- Files: `src/store/appState.js` lines 3-21
- Impact: Camera lerps (GSAP-driven) not tied to state; UI transitions (text fades, disc dock) not coordinated; difficult to sync animations with phase changes
- Fix approach: Extend state with `cameraPosition`, `transitionProgress`, `animationQueue` slices; use GSAP callbacks to update state

**No Error Boundary or WebGL Fallback:**
- Issue: SPEC.md §NFR6 requires "If WebGL unavailable, display error with contact links"; no implementation exists
- Files: No component for this; missing from App.jsx
- Impact: Non-WebGL browsers see blank/broken page; no graceful degradation
- Fix approach: Create `src/utils/webglDetect.js` and `src/components/WebGLError.jsx`; wrap Canvas in error boundary; detect on App mount

## Styling & Font Loading Issues

**TR2N Font Not Bundled:**
- Issue: SPEC.md §3 notes "Font file: Tron-JOAa.ttf (bundled in project root, move to src/assets/fonts/)" — font not found; TitleOverlay assumes it's available
- Files: `src/components/UI/TitleOverlay.jsx` line 57; project root empty
- Impact: "TANMAY GOEL" text renders in serif fallback (sans-serif) if font doesn't load; visual doesn't match Tron aesthetic
- Fix approach: Add Tron-JOAa.ttf to `src/assets/fonts/`; import via @font-face in `src/index.css`; use font-display: swap to prevent FOUT

**No CSS Reset or Global Styles:**
- Issue: `src/index.css` not shown; tailwind configured but no visible Tailwind imports or global baseline
- Files: Not found; `src/index.css` must exist (loaded in main.jsx) but content unknown
- Impact: Default browser styles may interfere with Tron aesthetic (margins, line-height, etc.)
- Fix approach: Ensure `src/index.css` imports Tailwind @layer directives and includes CSS reset (margin: 0, box-sizing: border-box)

## Type Safety & Validation

**No Runtime Validation on Data Imports:**
- Issue: Data files (projects.js, skills.js, contact.js) have no schema validation; components assume correct structure
- Files: `src/data/projects.js`, `src/data/skills.js`, `src/data/contact.js`
- Impact: If contact.js is updated with wrong shape (e.g., missing `github` key), components using it will error silently or crash
- Fix approach: Add Zod schema in each data file; validate on import; or centralize in `src/schemas/`

**Missing PropTypes or Runtime Checks:**
- Issue: Components receive props (e.g., IdentityDisc gets onClick, onHoverChange) with no validation
- Files: `src/components/3D/IdentityDisc.jsx` line 212; `src/components/UI/TitleOverlay.jsx` line 5
- Impact: Typos in callback names or wrong prop types go undetected until runtime
- Fix approach: Add prop validation (PropTypes or TypeScript); or keep JSDoc comments documenting expected shapes

## Testing Gaps

**No Test Coverage:**
- Issue: No test files exist; no jest.config.js, no .test.js files
- Files: None
- Impact: Phase transitions, animations, interaction handlers untested; refactoring breaks silently; candidate unaware of testing expectations
- Fix approach: Add vitest/jest; create test files for:
  - appState hooks (phase transitions)
  - IdentityDisc interactions (hover, click behavior)
  - Data validation (contact, projects, skills shapes)
  - Animation synchronization

## Browser Compatibility Concerns

**Three.js & WebGL Requirements Not Fully Documented:**
- Issue: SPEC.md requires WebGL (NFR6), but no browser version targets or compatibility matrix provided
- Files: `src/components/3D/IdentityDisc.jsx`; package.json uses `three@^0.183.2` (very recent)
- Impact: iOS/Safari WebGL quirks not tested; mobile performance unknown; Three.js r183+ may not support older Android browsers
- Fix approach: Document supported browsers (e.g., "Chrome 90+, Safari 14+, Firefox 88+"); test on BrowserStack; consider Three.js fallback for r170 (more stable)

**Vite Bundle Size Not Audited:**
- Issue: NFR3 targets <3 second load; bundled with Three.js (~150KB gzip), GSAP (~30KB), R3F (~50KB), react (~40KB) = ~300KB before assets/textures
- Files: package.json; no build analysis
- Impact: Initial load may exceed 3s on slower networks; no code splitting for phases
- Fix approach: Run `npm run build` and check dist/ size; add @vitejs/plugin-visualizer; lazy-load phase components

## Missing Accessibility Features

**No ARIA Labels or Semantic HTML:**
- Issue: 3D Canvas interactions (disc click, pane click) not exposed to screen readers
- Files: `src/components/3D/IdentityDisc.jsx` line 349; `src/components/UI/TitleOverlay.jsx` line 40
- Impact: Portfolio not accessible to users with visual impairments; violates WCAG guidelines
- Fix approach: Add aria-label to Canvas; create fallback navigation menu for screen reader users; test with aXe

**No Mobile Tap Feedback:**
- Issue: Cursor style changes on hover (IdentityDisc.jsx line 271), but no visual feedback for tap on mobile
- Files: `src/components/3D/IdentityDisc.jsx` lines 267-283
- Impact: Mobile users unsure if interaction registered; unclear which elements are clickable
- Fix approach: Add visual highlight on pointer down; trigger brief scale/color animation on successful tap

## Deployment Readiness Issues

**No Build Configuration Validated:**
- Issue: vite.config.js not shown; unclear if static export is configured
- Files: vite.config.js (assumed to exist, not verified)
- Impact: Vercel deployment may fail if SPA routing not correctly set up; 404 on reload
- Fix approach: Verify vite.config.js exists with proper build target; ensure index.html fallback for SPA

**No Environment Variable Documentation:**
- Issue: SPEC.md mentions env vars for contact links, but no .env.example or CI/CD config
- Files: None found
- Impact: Deployment unclear; no clear instructions for filling TBD values
- Fix approach: Create `.env.example` with placeholders; document in README

**Missing Open Graph Meta Tags:**
- Issue: SPEC.md §NFR4 requires OG tags for social preview; no implementation
- Files: `public/index.html` not shown; unclear if meta tags exist
- Impact: Link shared on Twitter/LinkedIn renders poorly
- Fix approach: Verify `public/index.html` has og:image, og:title, og:description; point og:image to Vercel URL after deployment

## Code Organization Gaps

**No Clear File Naming Convention:**
- Issue: PascalCase for components (IdentityDisc.jsx, TitleOverlay.jsx), but no consistent pattern; data files use camelCase (contact.js, projects.js)
- Files: src/components, src/data
- Impact: As codebase grows, unclear where new files belong or how to name them
- Fix approach: Document in CONVENTIONS.md: components = PascalCase.jsx, utilities = camelCase.js, data = camelCase.js, phases = PascalCase.jsx

**No Barrel Exports:**
- Issue: Components not organized with index.js barrel files; hard to import from nested paths
- Files: `src/components/3D/IdentityDisc.jsx` imported directly; would need full path for new components
- Impact: Verbose imports; refactoring paths breaks multiple files
- Fix approach: Add `src/components/index.js`, `src/components/3D/index.js` to export main components

## Deferred Requirements

**Contact Links Feature Blocked:**
- Issue: SPEC.md §9 lists "Contact Links: DEFERRED" as open question; implementation partially stubbed
- Files: `src/data/contact.js`, appState.js has no contact state
- Impact: HUD social icons (Phase 3, FR3.3) and About sector contact links (FR5.2.3) cannot be implemented without real data
- Fix approach: Populate contact.js before grid/sectors are built; add contact link renderer component

**Mobile Graceful Degradation Incomplete:**
- Issue: NFR2 requires Phase 1-2 scaling, disabled OrbitControls, stacked panes, scrollable 2D overlay on <768px; no implementation
- Files: Scene.jsx has no viewport check; no mobile-specific phase logic
- Impact: Mobile users see desktop layout; may be unusable on small screens
- Fix approach: Add useWindowSize hook; conditional rendering based on breakpoint; implement mobile-specific phase variants

---

*Concerns audit: 2026-03-17*
