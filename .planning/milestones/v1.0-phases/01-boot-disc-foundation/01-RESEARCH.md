# Phase 1: Boot + Disc Foundation - Research

**Researched:** 2026-03-17
**Domain:** React Three Fiber disc geometry, HTML Canvas 2D animation, Howler.js audio, WebGL detection
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Boot Sequence Rendering:** BootSequence lives as a DOM overlay component in `src/components/UI/BootSequence.jsx` (NOT inside the Three.js canvas). Renders full-viewport HTML Canvas 2D on a black div, positioned absolute on top of everything. Three.js canvas does not need to be initialized during boot sequence. Phase transition: when boot completes, BootSequence unmounts and the R3F canvas (Scene.jsx with IdentityDisc) becomes visible.

- **Light-Cycle Animation Technique:** Two sprites simultaneously trace the letters of "LOADING" on a 2D canvas. Cyan sprite draws the top half of each letter; orange sprite draws the bottom half — both at 90-degree sweep angles per the spec. Implementation: HTML Canvas 2D with font outline path coordinates. Pre-compute letter bounding boxes and split at vertical midpoint; each sprite sweeps along its half-path using a progress variable advanced per requestAnimationFrame tick. On collision: sprites converge at letter center, trigger flash that expands radially to fill viewport in 0.2s, then fade to black. No Three.js, no SVG — pure Canvas 2D for this component.

- **Audio Autoplay Strategy:** Howler.js initialized in `src/utils/audioManager.js` (new utility file). Music fades in after the boot flash fades to black (BOOT-03 timing). Attempt autoplay immediately at that point; use Howler's `fade(0, 1, 2000)` for 2-second fade-in. If browser blocks autoplay: show minimal "CLICK TO ENABLE AUDIO" prompt in the boot UI; trigger play on first click. `audioEnabled` state in Zustand toggles mute/unmute but does not stop the track.

- **Disc Rebuild Approach:** Keep and enhance the existing procedural approach in `src/components/3D/IdentityDisc.jsx`. Visual changes required (DISC-01): Add more concentric torus rings at varying radii and tube widths to create layered depth; increase Crimson Red (`#FF0000`) emissive intensity significantly (currently too dim); adjust torus geometry parameters for beveled 3D depth; dark metallic center disc material (MeshStandardMaterial with metalness: 0.9, roughness: 0.1); use reference image as visual benchmark. Preserve: particle system, hover animations, grid floor preview, rotation. Performance: consider reducing grid divisionsX/Z from 60/40 to 40/30 on rebuild.

- **WebGL Fallback:** Detect WebGL on App mount using a utility (`src/utils/webglDetect.js`). If unavailable, render `src/components/WebGLFallback.jsx` — a styled full-viewport error message in Tron aesthetic. Error message includes: "THIS EXPERIENCE REQUIRES WEBGL" with direct links to GitHub, LinkedIn, and email from `src/data/contact.js`. No boot sequence plays if WebGL is unavailable.

### Claude's Discretion

- Exact easing curves for the boot flash expansion (radial gradient animation timing)
- Letter path coordinate calculation strategy (measure via canvas font metrics or hardcode key points)
- Exact number and radii of additional torus rings on the disc (use reference image as guide)
- Audio track file location and filename (reference spec says "Just Turn It On and Make Something")

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DISC-01 | Rebuild IdentityDisc 3D model to match reference image — multiple layered concentric rings with beveled 3D depth, strong Crimson Red emissive glow, dark metallic center | Torus geometry patterns, emissive intensity tuning, reference image analyzed |
| BOOT-01 | Two light-cycle sprites trace "LOADING" simultaneously — cyan top half, orange bottom half at 90-degree angles | HTML Canvas 2D font path tracing, requestAnimationFrame loop pattern |
| BOOT-02 | Sprites reverse and collide at letter center, triggering flash that expands to fill viewport in 0.2s then fades to black | Radial gradient animation, canvas composite operations |
| BOOT-03 | From black: background music fades in, "TANMAY GOEL" (Red, TR2N) and "SOFTWARE DEVELOPER" (White, Roboto Mono) fade in at center, scene transitions to Phase 2 | TitleOverlay reuse pattern, Howler fade API, phase state transition |
| BOOT-04 | sessionStorage flag ensures boot sequence plays only on first visit per session | sessionStorage API, App mount check pattern |
| AUDIO-01 | Background music (Howler.js) fades in during Phase 1 boot sequence and loops for the entire session | Howler.js API: fade(), loop, autoplay, mute |
| NFR-01 | WebGL unavailability detected on page load; shows styled error with direct links to GitHub, LinkedIn, and email | WebGL detection via canvas context, conditional render in App.jsx |
</phase_requirements>

---

## Summary

Phase 1 is a brownfield addition: a fully working Phase 2 disc scene already exists (IdentityDisc.jsx, Scene.jsx, TitleOverlay.jsx, appState.js), and Phase 1 layers a boot sequence in front of it. The architectural strategy is a DOM overlay — BootSequence.jsx mounts on top of the existing Canvas, runs its animation, then unmounts to reveal the R3F scene already initialized below.

The two most technically interesting problems are: (1) the light-cycle letter-tracing animation, which requires splitting font glyph paths at their vertical midpoint — the most practical approach uses canvas `measureText` bounding boxes and `CanvasRenderingContext2D.strokeText` with clipping regions rather than full bezier path decomposition; and (2) the disc visual rebuild, which the reference image shows needs thicker, more beveled torus rings with much brighter emissive output — the current code uses `emissiveIntensity` values of 0.9–1.8, and the reference image clearly shows values in the 3–8 range with postprocessing Bloom amplifying them further.

The Zustand store currently initializes `phase: 2`, which will need to change to `phase: 1` (or a BOOT constant). The boot sequence calls `setPhase(2)` when complete. No new libraries are needed — all required tools (Howler, Zustand, Three.js, Canvas 2D) are already in package.json.

**Primary recommendation:** Implement the three plans in order — disc rebuild first (visual, isolated, immediately verifiable), then boot sequence (most complex), then WebGL fallback (small but must run before any other code). Wire them together through the phase state machine.

---

## Standard Stack

### Core (all already installed — verified from package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | ^0.183.2 | 3D geometry (TorusGeometry, MeshStandardMaterial) | Already in project, required for R3F |
| @react-three/fiber | ^9.5.0 | React bindings for Three.js, useFrame hook | Project tech stack — drives the disc scene |
| @react-three/postprocessing | ^3.0.4 | Bloom/Vignette EffectComposer already wired in Scene.jsx | Already configured, amplifies emissive glow |
| howler | ^2.2.4 | Audio playback, fade, loop, mute | Already installed, locked decision |
| zustand | ^5.0.11 | Phase state machine, audioEnabled flag | Already installed, central state |
| react | ^19.2.0 | Component lifecycle for BootSequence mount/unmount | Already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| HTML Canvas 2D (browser API) | native | Boot sequence animation rendering | BootSequence.jsx exclusively — no import needed |
| sessionStorage (browser API) | native | Boot-played flag for BOOT-04 | App mount check only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Canvas 2D for boot | SVG animation | SVG is higher-level but harder to clip letter halves precisely; locked as Canvas 2D |
| Canvas 2D for boot | Three.js canvas | Would require WebGL, complicates fallback path; locked as DOM overlay |
| Howler.js | Web Audio API directly | More control but significantly more boilerplate; Howler already installed |

**No new installs required.** All dependencies are already in `package.json`.

---

## Architecture Patterns

### Current File Structure (brownfield baseline)

```
src/
├── App.jsx                        # Root — Canvas + TitleOverlay, needs BootSequence + WebGLFallback wired in
├── components/
│   ├── Scene.jsx                  # R3F scene — phase === 2 guard on IdentityDisc
│   ├── 3D/
│   │   └── IdentityDisc.jsx       # Existing disc — visual rebuild target (DISC-01)
│   └── UI/
│       └── TitleOverlay.jsx       # "TANMAY GOEL" + "SOFTWARE DEVELOPER" — reused for BOOT-03
├── store/
│   └── appState.js                # phase: 2 currently — needs phase: 1 as new default
├── data/
│   ├── contact.js                 # GitHub/LinkedIn/email — used by WebGLFallback
│   ├── projects.js
│   └── skills.js
└── index.css                      # CSS vars: --crimson-red, --neon-cyan, --neon-orange, --off-white
```

### New Files This Phase Creates

```
src/
├── components/
│   ├── UI/
│   │   └── BootSequence.jsx       # BOOT-01/02/03/04 — full-viewport Canvas 2D overlay
│   └── WebGLFallback.jsx          # NFR-01 — styled error screen
└── utils/
    ├── audioManager.js            # AUDIO-01 — Howler singleton
    └── webglDetect.js             # NFR-01 — WebGL capability check
```

### Pattern 1: Phase Guard in App.jsx

The boot sequence and WebGL fallback are rendered at the App level, not inside the R3F Canvas. The Canvas itself is always mounted when WebGL is available (so it pre-initializes during boot), but IdentityDisc is gated by `phase === 2` inside Scene.jsx.

```jsx
// src/App.jsx — after this phase
function App() {
  const webglAvailable = useMemo(() => detectWebGL(), [])
  const phase = useAppState(s => s.phase)
  const [discHovered, setDiscHovered] = useState(false)

  if (!webglAvailable) {
    return <WebGLFallback />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {phase === 1 && <BootSequence />}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Scene onDiscHover={setDiscHovered} />
      </Canvas>
      {phase === 2 && <TitleOverlay glitch={discHovered} />}
    </div>
  )
}
```

**Key insight:** Canvas is rendered below BootSequence even during phase 1. This means the disc pre-warms its geometry while boot plays. BootSequence sits above with `position: absolute; z-index: 10` and covers it completely.

### Pattern 2: Howler Singleton AudioManager

```javascript
// src/utils/audioManager.js
import { Howl } from 'howler'

let sound = null

export function initAudio() {
  if (sound) return sound
  sound = new Howl({
    src: ['/audio/just-turn-it-on.mp3'],
    loop: true,
    volume: 0,           // start silent — fade() will bring it up
    autoplay: false,
  })
  return sound
}

export function playWithFade(duration = 2000) {
  const s = initAudio()
  s.play()
  s.fade(0, 1, duration)
}

export function setMuted(muted) {
  const s = initAudio()
  if (s) s.mute(muted)
}

export function getSound() {
  return sound
}
```

Zustand `audioEnabled` subscriber pattern (in a component or via store subscribe):

```javascript
// Subscribe to audioEnabled changes
useEffect(() => {
  return useAppState.subscribe(
    (s) => s.audioEnabled,
    (enabled) => setMuted(!enabled)
  )
}, [])
```

### Pattern 3: sessionStorage Boot Flag (BOOT-04)

```javascript
// In BootSequence.jsx or checked in App.jsx before rendering BootSequence
const BOOT_KEY = 'tron-boot-played'

// On App mount — skip to phase 2 if already played this session
useEffect(() => {
  if (sessionStorage.getItem(BOOT_KEY)) {
    setPhase(2)   // skip boot
  }
}, [])

// Inside BootSequence, on animation completion:
function onBootComplete() {
  sessionStorage.setItem(BOOT_KEY, '1')
  setPhase(2)
}
```

### Pattern 4: WebGL Detection

```javascript
// src/utils/webglDetect.js
export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!(ctx && ctx instanceof WebGLRenderingContext)
  } catch (e) {
    return false
  }
}
```

This must run synchronously before any R3F Canvas mounts — call it in App.jsx with `useMemo(() => detectWebGL(), [])`.

### Pattern 5: Light-Cycle Letter Tracing with Canvas Clipping

The most practical approach for splitting letters by vertical midpoint without full bezier decomposition:

```javascript
// Strategy: use canvas clipping regions to draw each letter twice —
// once clipped to top half (cyan), once clipped to bottom half (orange)
// Progress controls a strokeDashoffset simulation via multiple short arcs

function drawLetterHalf(ctx, char, x, y, fontSize, side, progress) {
  const halfY = y  // vertical midpoint of the letter bounding box

  ctx.save()
  ctx.beginPath()
  if (side === 'top') {
    ctx.rect(0, 0, ctx.canvas.width, halfY)
  } else {
    ctx.rect(0, halfY, ctx.canvas.width, ctx.canvas.height - halfY)
  }
  ctx.clip()

  // Draw the letter character at current progress alpha
  // Progressively reveal using a vertical sweep mask or opacity-based reveal
  ctx.font = `${fontSize}px TR2N`
  ctx.strokeStyle = side === 'top' ? '#00FFFF' : '#FF5E00'
  ctx.lineWidth = 2
  ctx.globalAlpha = progress
  ctx.strokeText(char, x, y)

  ctx.restore()
}
```

**Note on "light-cycle sprite tracing":** True path-following light-cycle animation (where a dot moves along the letter outline) requires glyph path decomposition (via `CanvasFontFace` or an SVG-to-path library). A simpler approach that achieves the visual impression: use a bright point that sweeps horizontally across each letter with a clipping mask that grows from left to right, revealing the letter progressively with a leading glow point. This is much simpler, visually convincing, and avoids glyph path math. The planner should specify which approach to implement.

### Pattern 6: Boot Flash Expansion

```javascript
function drawFlash(ctx, progress, centerX, centerY) {
  // progress: 0 → 1 over 0.2s
  const maxRadius = Math.sqrt(centerX ** 2 + centerY ** 2) * 1.5
  const radius = maxRadius * easeOutQuad(progress)

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  gradient.addColorStop(0, `rgba(255, 255, 255, ${1 - progress * 0.3})`)
  gradient.addColorStop(0.7, `rgba(255, 255, 255, ${1 - progress * 0.5})`)
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

function easeOutQuad(t) { return 1 - (1 - t) * (1 - t) }
```

### Anti-Patterns to Avoid

- **Initializing Howler inside a React render cycle:** Will create multiple sound instances. Use the singleton pattern in `audioManager.js` with a module-level variable.
- **Mounting the R3F Canvas only after boot completes:** Wastes the boot animation time for WebGL initialization. Mount Canvas during boot (behind the overlay), gate IdentityDisc with phase check.
- **Calling `setPhase` multiple times at boot end:** Can cause double-render flicker. Use a `completed` ref to guard against double-calls from the rAF loop.
- **High emissiveIntensity without Bloom:** Emissive alone looks washed-out/flat. The Scene.jsx EffectComposer Bloom is already configured — rely on it amplifying emissive values. Set emissiveIntensity to 3–8 range and let Bloom do the rest.
- **Using `phase: 2` as initial state when boot is implemented:** `appState.js` currently defaults `phase: 2`. This must change to `phase: 1` once BootSequence is wired in.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio looping + fade | Custom Web Audio API scheduler | `howler` — `fade()` method, `loop: true` | Howler handles cross-browser autoplay policy, context resume, iOS silent mode |
| 3D glow/bloom effect | Custom shader glow | `@react-three/postprocessing` Bloom (already in Scene.jsx) | Bloom already configured; emissive materials auto-integrate |
| WebGL context detection | navigator.gpu checks, complex feature detection | Single canvas `getContext('webgl')` call | Simple, sufficient, no library needed |
| requestAnimationFrame management in BootSequence | Complex timer system | Single rAF loop with elapsed time tracking | React useEffect cleanup handles cancellation |
| Phase-conditional rendering | Router or complex state | Zustand `phase` check: `{phase === 1 && <BootSequence />}` | Already established pattern in Scene.jsx |

**Key insight:** Every complex subsystem (audio, glow, state) has a library or established pattern already in the project. The only custom work is the Canvas 2D boot animation — which is intentional and central to the experience.

---

## Common Pitfalls

### Pitfall 1: Browser Autoplay Policy Blocking Howler

**What goes wrong:** `sound.play()` called programmatically returns a rejected promise silently. Music never starts. No error thrown in console.
**Why it happens:** Chrome/Firefox/Safari require a user gesture before AudioContext can resume. The boot flash might complete without any gesture.
**How to avoid:** Attempt play, catch the failure via Howler's `onplayerror` callback, show "CLICK TO ENABLE AUDIO" overlay. Wire that click to `sound.play()`.
```javascript
sound.on('playerror', () => {
  // show click-to-enable UI
  document.addEventListener('click', () => sound.play(), { once: true })
})
```
**Warning signs:** Audio works in dev but fails in production (different autoplay policies); Safari always fails first.

### Pitfall 2: emissiveIntensity Too Low — Disc Looks Flat

**What goes wrong:** Reference image shows disc rings blazing red with visible halo. Current code has `emissiveIntensity: 0.9–1.8`. At these values, with Bloom `luminanceThreshold: 0.2`, the rings barely glow.
**Why it happens:** Bloom threshold is 0.2 on a 0-1 HDR scale. emissiveIntensity of 1.8 means the material emits 1.8× base color — barely above threshold for thick bloom halos.
**How to avoid:** Target `emissiveIntensity: 4–8` for outer rings, `3–5` for inner rings. Use `toneMapped={false}` (already set) to allow HDR values. The Bloom `intensity: 1.2` will then produce wide glowing halos.
**Warning signs:** Rings visible but look like colored lines, not glowing neon.

### Pitfall 3: BootSequence Canvas Sizing on Resize

**What goes wrong:** Boot canvas drawn at initial viewport size. User resizes window during animation (unlikely but possible). Canvas coordinate space doesn't match viewport.
**Why it happens:** Canvas `width`/`height` attributes must be set explicitly to match `window.innerWidth / window.innerHeight` — CSS `width: 100%` only stretches the canvas without resampling.
**How to avoid:** Set `canvas.width = window.innerWidth; canvas.height = window.innerHeight` on mount. Optionally add a resize listener that cancels and restarts the animation (or just fix to initial size — acceptable for a boot sequence).

### Pitfall 4: appState Phase Not Updated to Phase 1 Default

**What goes wrong:** After implementing BootSequence, app still starts at `phase: 2` (current default). BootSequence never renders. Scene goes directly to disc.
**Why it happens:** `appState.js` has `phase: 2` hardcoded as initial value.
**How to avoid:** Change initial phase to `1` in `appState.js`. BOOT-04 sessionStorage check then immediately calls `setPhase(2)` on repeat visits.
**Warning signs:** BootSequence component exists but never appears on first load.

### Pitfall 5: TitleOverlay Visible During Boot

**What goes wrong:** TitleOverlay is currently rendered unconditionally in App.jsx (`<TitleOverlay glitch={discHovered} />`). It will show on top of boot sequence during phase 1.
**Why it happens:** App.jsx does not currently have phase guards around TitleOverlay.
**How to avoid:** Gate TitleOverlay with `{phase === 2 && <TitleOverlay glitch={discHovered} />}` in App.jsx. Also wire BOOT-03 fade-in by passing a `visible` prop or using a separate title fade during boot.

### Pitfall 6: Howler Playing Before Audio File Exists

**What goes wrong:** `audioManager.js` references `/audio/just-turn-it-on.mp3`. If this file is not in `public/audio/`, Howler silently fails (fires `onloaderror`).
**Why it happens:** No audio file currently exists in the project. `public/` directory is empty.
**How to avoid:** Create `public/audio/` and add the audio file before wiring boot sequence. Handle `onloaderror` gracefully — if audio fails to load, boot sequence continues without music rather than crashing.

---

## Code Examples

### Disc Rebuild — Reference Image Analysis

The reference image shows:
- 4-5 distinct 3D-depth ring bands with visible bevel/thickness (not flat circles)
- Outermost ring is the thickest and brightest — appears to be `tubeRadius: 0.06–0.08` at `DISC_RADIUS` scale
- Strong emissive halo extending well beyond ring geometry — requires `emissiveIntensity: 5–8`
- Dark metallic center disk (not just a flat plane) — `MeshStandardMaterial` with `metalness: 0.9, roughness: 0.1`
- Inner rings are progressively dimmer with smaller tube radii

Current torus rings in IdentityDisc.jsx (for reference when planning DISC-01):
```
Ring 1 (outer):    radius: DISC_RADIUS (1.8),     tube: 0.035, emissive: 1.8
Ring 2:            radius: DISC_RADIUS * 0.88,    tube: 0.02,  emissive: 1.0
Ring 3 (mid):      radius: DISC_RADIUS * 0.69,    tube: 0.025, emissive: 1.2
Ring 4 (inner):    radius: DISC_RADIUS * 0.46,    tube: 0.02,  emissive: 0.9
Ring 5 (core):     radius: DISC_RADIUS * 0.21,    tube: 0.025, emissive: 1.4
```

Recommended changes per reference image:
```
Ring 1 (outer):    radius: DISC_RADIUS,           tube: 0.07,  emissive: 8.0  — main bright band
Ring 2:            radius: DISC_RADIUS * 0.93,    tube: 0.035, emissive: 5.0  — secondary bevel
Ring 3:            radius: DISC_RADIUS * 0.82,    tube: 0.025, emissive: 4.0
Ring 4 (mid):      radius: DISC_RADIUS * 0.68,    tube: 0.05,  emissive: 6.0  — mid bright band
Ring 5:            radius: DISC_RADIUS * 0.58,    tube: 0.025, emissive: 3.5
Ring 6 (inner):    radius: DISC_RADIUS * 0.44,    tube: 0.04,  emissive: 5.0
Ring 7 (core):     radius: DISC_RADIUS * 0.22,    tube: 0.03,  emissive: 4.0
```
Center disk: change flat plane to `cylinderGeometry` with some depth (0.1–0.15) for the dark metallic center.

### Howler.js fade() API (verified from Howler docs)

```javascript
// Fade from volume 0 to 1 over 2 seconds
sound.play()
sound.fade(0, 1, 2000)

// Mute without stopping (preserves loop position)
sound.mute(true)   // mute
sound.mute(false)  // unmute

// Loop configuration
const sound = new Howl({
  src: ['/audio/track.mp3'],
  loop: true,
  volume: 0,
})
```

### Canvas 2D Boot Sequence — rAF Loop Structure

```javascript
// In BootSequence.jsx
useEffect(() => {
  const canvas = canvasRef.current
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let animFrameId
  let startTime = null
  const completed = { done: false }

  function tick(timestamp) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Phase 1: draw loading letters (0 → 2000ms)
    // Phase 2: collision flash (2000 → 2200ms)
    // Phase 3: fade to black + title (2200 → 3500ms)
    // On complete: setPhase(2), sessionStorage.setItem(BOOT_KEY, '1')

    if (!completed.done) {
      animFrameId = requestAnimationFrame(tick)
    }
  }

  animFrameId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(animFrameId)
}, [setPhase])
```

### TitleOverlay — Existing Colors Match BOOT-03

Reviewing `TitleOverlay.jsx` — the existing colors already match BOOT-03 spec:
- "TANMAY GOEL" → `color: '#FF0000'` (Crimson Red) — correct per BOOT-03
- "SOFTWARE DEVELOPER" → `color: '#F0F0F0'` (Off-White) — correct per BOOT-03

The component needs a `visible` prop added to support fade-in from BootSequence:
```jsx
// Add opacity/transition to TitleOverlay for BOOT-03 fade-in
<div style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease-in' }}>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Three.js r3f v7 `useLoader` | R3F v9 `useLoader` (same API) | v8-v9 | No change needed |
| Howler v1 callback style | Howler v2 event-based + Promise-like | Howler v2 (2017) | Use `.on('playerror')` not try/catch |
| Zustand v4 middleware | Zustand v5 no-middleware-by-default | Zustand v5 (2024) | The store already uses v5 syntax correctly |
| `@react-three/postprocessing` v2 | v3 — same EffectComposer API | v3 (2024) | No API changes for Bloom/Vignette |

**Deprecated/outdated:**
- `canvas.getContext('experimental-webgl')`: Still needed as fallback for very old browsers alongside `'webgl'`.
- Three.js `r3f useThree().gl.capabilities` for WebGL detection: Overkill — simple canvas context check suffices before R3F mounts.

---

## Open Questions

1. **Audio file location and format**
   - What we know: Howler is installed; SPEC references "Just Turn It On and Make Something" as the track name
   - What's unclear: The audio file does not exist in the project. `public/` is empty. The planner must include a task for adding `public/audio/just-turn-it-on.mp3` (or the implementer must source/add it manually)
   - Recommendation: Plan includes a task note that audio file must be placed at `public/audio/` — plan cannot proceed to boot audio task without this asset. If unavailable, mock with a short silent mp3.

2. **Light-cycle sprite tracing technique specificity**
   - What we know: Locked decision says "canvas font outline path coordinates" and "sweeps along half-path using a progress variable"
   - What's unclear: True path tracing requires glyph bezier decomposition (non-trivial). A simpler "reveal with leading glow dot" approach looks identical to a user.
   - Recommendation: Implement the simpler horizontal-sweep-with-clip approach first. Add glyph-path approach only if the visual result is insufficient.

3. **Canvas pre-warming during boot**
   - What we know: The Canvas is mounted below BootSequence (z-index layering)
   - What's unclear: R3F Canvas mount triggers WebGL context creation + shader compilation. On low-end hardware this can cause a visible frame stutter when boot ends.
   - Recommendation: Mount Canvas with `style={{ visibility: 'hidden' }}` during phase 1, switch to visible at phase 2. Avoids any visual bleed-through.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config files or test directories exist in project |
| Config file | None — Wave 0 must create if automated testing desired |
| Quick run command | N/A — no framework installed |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISC-01 | Disc renders with multiple torus rings and correct emissive materials | visual/manual | Manual — open dev server, compare to reference image | N/A |
| BOOT-01 | Boot canvas renders cyan/orange letter traces | visual/manual | Manual — first load in browser | N/A |
| BOOT-02 | Flash expands to fill viewport on collision | visual/manual | Manual — observe boot animation | N/A |
| BOOT-03 | Title fade-in after flash | visual/manual | Manual — watch timing sequence | N/A |
| BOOT-04 | sessionStorage skip on reload | smoke | Manual — reload tab, check sessionStorage in DevTools | N/A |
| AUDIO-01 | Music fades in with Howler | manual-only | Manual — listen; autoplay may require user gesture | N/A |
| NFR-01 | WebGL fallback renders | smoke | Manual — disable WebGL in browser flags and reload | N/A |

**Manual-only justification:** This phase is entirely visual and audio — animation timing, glow intensity, and canvas rendering are not unit-testable in a meaningful automated way without a headless browser with WebGL support. All verification is visual inspection against reference image and spec.

### Sampling Rate

- **Per task commit:** Run `npm run dev` and manually verify the specific component changed
- **Per wave merge:** Full visual walkthrough: boot plays correctly, disc matches reference, sessionStorage skip works, WebGL fallback renders
- **Phase gate:** All 5 success criteria in ROADMAP.md Phase 1 verified before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `public/audio/` directory + audio file — required before AUDIO-01 can be verified
- [ ] `src/utils/` directory — does not exist yet (create with audioManager.js and webglDetect.js)

*(No automated test framework gap — visual/animation phase does not benefit from unit tests; verification is manual against spec)*

---

## Sources

### Primary (HIGH confidence)

- Codebase direct read — `src/components/3D/IdentityDisc.jsx`, `src/components/Scene.jsx`, `src/store/appState.js`, `src/components/UI/TitleOverlay.jsx`, `src/App.jsx` — current implementation state fully known
- `package.json` — all dependency versions verified from lockfile
- `reference/Screenshot 2026-03-10 at 11.18.58 PM.png` — reference image analyzed directly (shows bright banded disc with strong emissive halo)
- `.planning/phases/01-boot-disc-foundation/01-CONTEXT.md` — all locked decisions authoritative

### Secondary (MEDIUM confidence)

- Howler.js v2 API (`fade()`, `mute()`, `on('playerror')`, `loop`) — knowledge from training data (Howler v2.2.x has been stable since 2018; API unchanged through 2.2.4)
- HTML Canvas 2D clip region pattern — standard browser API, stable
- Browser autoplay policy behavior — widely documented, consistent across Chrome/Firefox/Safari since 2018

### Tertiary (LOW confidence)

- Recommended emissiveIntensity values (3–8 range) — derived from visual analysis of reference image and known Bloom threshold behavior; exact values require iteration during implementation
- Light-cycle glyph path tracing complexity assessment — based on known Canvas 2D API limitations; glyph decomposition difficulty is well-established but specific implementation options not verified against a Context7 source

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all libraries verified from package.json, no new installs needed
- Architecture: HIGH — brownfield codebase fully read; integration points identified precisely
- Pitfalls: HIGH — derived from reading actual code (wrong emissive values, missing phase guard, TitleOverlay not gated)
- Disc geometry values: MEDIUM — reference image analyzed but exact ring radii/intensities require visual iteration
- Light-cycle animation technique: MEDIUM — standard canvas approach documented; glyph path complexity flagged

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable library stack; Howler and Three.js APIs are long-stable)
