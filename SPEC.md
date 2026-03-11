# Product Requirements Document: "Digital Dominion" — Tron-Themed 3D Portfolio

**Author:** Tanmay Goel
**Role:** Software Developer (CS at UIUC)
**Platform:** Desktop & Mobile Web (Single Page Application)

---

## 1. Product Overview & Objective

"Digital Dominion" is a highly immersive, 3D-navigable personal portfolio website inspired by the visual language of the Tron universe. The objective is to demonstrate advanced frontend engineering capabilities (WebGL, 3D spatial logic, complex state management) while clearly presenting the candidate's projects, skills, and background to technical recruiters and hiring managers.

---

## 2. Technical Stack

| Category | Technology | Purpose |
|---|---|---|
| Core Framework | React (Vite) | UI state management and component architecture |
| 3D Engine | Three.js + React Three Fiber (R3F) | WebGL rendering, 3D object generation, scene management |
| 3D Helpers | @react-three/drei | OrbitControls, billboarding, text geometry |
| Animation | GSAP | High-performance lerping for camera and UI transitions |
| Postprocessing | @react-three/postprocessing | Bloom, vignette, and glow effects for neon aesthetics |
| Data Viz | HTML Canvas (2D) | Network graph visualization in the Skills sector |
| Audio | Howler.js | Looping background Tron theme music |
| State Management | Zustand | Global app state (phase, camera, audio, UI visibility) |
| Styling | Tailwind CSS + CSS Modules | 2D overlay UI and HUD elements |

---

## 3. Design System & Aesthetics

### Color Palette
| Name | Hex | Usage |
|---|---|---|
| Void Black | `#000000` | Primary background environment |
| Neon Cyan | `#00FFFF` | Grid, main UI elements, project accent |
| Neon Orange | `#FF5E00` | Project accent, highlight states |
| Crimson Red | `#FF0000` | Identity Disc, "TANMAY GOEL" typography |
| White/Off-White | `#F0F0F0` | "SOFTWARE DEVELOPER" subtitle, terminal text |

> Each project monolith gets a distinct accent color drawn from the palette above. Assigned per project in the data config (see Section 7.1).

### Typography
- **Display / Headers:** TR2N — used for "TANMAY GOEL" and sector titles. Font file: `Tron-JOAa.ttf` (bundled in project root, move to `src/assets/fonts/` during setup)
- **Terminal / Code:** Roboto Mono (Google Fonts) — used for subtitles, code snippets, data streams, ASCII text, and UI details

---

## 4. Application Architecture & Phase Flow

The app is a Single Page Application with distinct "Phases" controlled by camera position and scene visibility — not standard page routing.

```
Phase 1: Boot Sequence (Loading)
    ↓ [auto-completes]
Phase 2: Main Hub (Disc at center)
    ↓ [onClick: disc]
Phase 3: "black" Transition (one-time)
    ↓ [auto-completes]
Phase 4: Grid World & 3D Gateways (main nav)
    ↓ [onClick: pane]
Phase 5: Sector Dive (About / Skills / Projects)
    ↑ [onClick: top-left HUD disc — return to Phase 4]
```

---

## 5. Functional Requirements

### FR1: Boot Sequence (Phase 1 — Loading State)

**FR1.0** The boot sequence plays **only on the user's first visit**. Store a flag in `sessionStorage` on completion. On subsequent page loads within the same session (reloads, new tabs), skip directly to **Phase 2** (Identity Disc).

**FR1.1** On initial load, display a pure black (`#000000`) viewport with no other elements visible.

**FR1.2** Two Tron light-cycle **sprites** enter the screen and trace out the word **"LOADING"** using their light trails, in a geometric/Tron-style font. The letter rendering is split between the two racers:
- **Cyan racer** (enters from top-left): Draws only the **top half** of each letter, moving at strict 90-degree angles
- **Orange racer** (enters from bottom-right): Draws only the **bottom half** of each letter, moving at strict 90-degree angles
- A **small visible gap** runs horizontally through the center of all letters — the seam between the two racers' work
- Both racers work simultaneously, tracing their respective halves as they traverse the screen

**FR1.3** Upon completing "LOADING", both racers **reverse direction** and accelerate toward each other, closing the gap and meeting at the **horizontal center of the letters**.

**FR1.4** The collision triggers a **bright flash of light**:
- Starts as a point at the collision site
- Scales to fill the viewport in **0.2 seconds**
- Fades to a **black screen**

**FR1.5** From the black screen:
- The track **"Just Turn It On and Make Something"** (open-source) **fades in**
- **"TANMAY GOEL"** (Red, TR2N font) and **"SOFTWARE DEVELOPER"** (White, Roboto Mono) **fade in** at center screen
- Scene transitions into **Phase 2** (Identity Disc renders behind the text, which is already in position)

---

### FR2: Main Hub — The Identity Disc (Phase 2)

**FR2.1** Render a **3D Identity Disc** centered at world origin `(0, 0, 0)`:
- Dark metallic body texture
- Glowing **Crimson Red** rings
- Slow idle rotation on its Y-axis

**FR2.2** Render 2D text overlays:
- **"TANMAY GOEL"** — Red (`#FF0000`), TR2N font, positioned above the disc
- **"SOFTWARE DEVELOPER"** — Off-White (`#F0F0F0`), Roboto Mono font, positioned below the disc

**FR2.3 — Hover State:** On cursor hover over the disc:
- The outer red ring **spins rapidly** on the Z-axis
- **Red circuit-line energy particles** shoot outward from the disc into the black void
- The particles **briefly illuminate a faint isometric grid floor** beneath, which fades when the cursor leaves
- **"TANMAY GOEL"** text **glitches** — cycling through random hex strings and binary sequences before snapping back

---

### FR3: "Shatter & Dock" Transition (Phase 3)

Triggered by `onClick` on the central Identity Disc.

**FR3.1 — Audio:** The track **"Last Stop by Karl Casey"** (open-source) is already playing (started in FR1.6) and continues looping for the rest of the session. A **mute/unmute toggle** (small speaker icon) is rendered in the HUD  in the bottom-right corner, allowing the user to control audio at any time.

**FR3.2 — Disc Docks:** The central disc:
- Rapidly **scales down by ~80%**
- **Lerps to the top-left corner** of the screen with a spinning wind-down animation
- Settles into a **slow, persistent idle rotation** — this is now the global Home button
- The **"TANMAY GOEL"** text snaps into place beside the disc in the top-left HUD

**FR3.3 — Social Links:** Fade in three glowing circular icon nodes in the **bottom-right corner**: GitHub, LinkedIn, Email

**FR3.4 — Grid Powers On:** The faint hover-state grid permanently locks in and illuminates:
- Glowing **Neon Cyan** isometric wireframe on the XZ plane
- Grid extends along the Z-axis away from the camera
- Terminates at a **horizon line** located ~2/3 of the way up the viewport
- Apply a **neon cyan bloom/lens flare effect** at the horizon line
- The grid transitions from 2D illusion to a true **navigable 3D world**

---

### FR4: 3D Grid World & Gateway Panes (Phase 4)

**FR4.1 — Gateways:** Render **three semi-transparent holographic glass panes** rising from the grid floor, arranged in a **triangle formation**:
- Pane 1: `>_ ABOUT_ME`
- Pane 2: `>_ SKILLS`
- Pane 3: `>_ PROJECTS`

**FR4.2 — Orbital Navigation:** Enable free camera movement using `OrbitControls` (from Drei):
- User can pan **360 degrees horizontally** around the center triangle
- Restrict vertical angle to prevent seeing **under the grid** — exact upper limit to be tuned during development
- The three panes are always the focal center

**FR4.3 — Billboarding:** All three panes continuously **Y-axis rotate to face the camera** at all times, regardless of camera position.

**FR4.4 — Pane Idle State:**
- Each pane displays chaotic, **flat 2D art styled to look like 3D geometric wireframes** (different per pane) — rendered as textures/shaders on the pane face, not actual 3D geometry
- Distorted **ASCII/hex text** streams across the surface

**FR4.5 — Pane Hover State:**
- Wireframes **snap into a clean, symmetrical structure**
- ASCII text **decrypts** to reveal the pane label: `>_ ABOUT_ME`, `>_ SKILLS`, `>_ PROJECTS`
- A **light pulse ripples outward across the grid floor** from the pane base

---

### FR5: Sector Dives (Phase 5 — Content Views)

Triggered by `onClick` on a decrypted gateway pane.

On sector dive:
- Non-selected panes fade out and hide
- The horizon line fades
- Navigation HUD (top-left disc + name) remains visible and functional

---

#### FR5.1 — Projects Sector

**FR5.1.1** Camera lerps **through** the selected pane (fly-through transition).

**FR5.1.2** The grid floor remains rendered. **Three large 3D rectangular monoliths** rise from the grid, one per project. Each monolith:
- Has a **glowing emissive edge** in its assigned accent color
- Displays the **project name** on its face
- Displays a **one-line description** beneath the project name
- Displays **tech stack tags** along the base

**FR5.1.3 — Hover State:** On cursor hover, the monolith performs a slow **vertical bob/float animation** with a brightening of its emissive edge glow.

**FR5.1.4 — Active Project Treatment:** The monolith with `active: true` is visually distinguished:
- Uses **Crimson Red (`#FF0000`)** accent color instead of Neon Orange
- Displays a small **"IN PROGRESS"** tag above the project name
- Other (non-active) monoliths use **Neon Orange (`#FF5E00`)**

**FR5.1.5 — Click Behavior:** Clicking a monolith **opens the project's GitHub repository** in a new tab. There is no camera fly-in or overlay panel — the click is a direct external link.

**FR5.1.6 — Data-Driven Architecture:** All monolith content is sourced from a single config file (`src/data/projects.js`) to make adding, removing, or editing projects trivial without touching component code. Structure:

```js
// src/data/projects.js
export const projects = [
  {
    id: 'project-1',
    name: 'Project Name',
    tagline: 'One-line description of what it does.',
    techStack: ['React', 'Python', 'FastAPI'],
    accentColor: '#FF5E00',  // Neon Orange (auto-overridden to #FF0000 if active)
    githubUrl: 'https://github.com/...',
    active: false,           // set true for current project
    position: [x, y, z],    // 3D world position on the grid
  },
  // add more projects here
]
```

---

#### FR5.2 — About Me Sector

**FR5.2.1** Camera **flies into** the pane, which **expands to fill the entire viewport** (100vw × 100vh).

**FR5.2.2** The 3D background receives a **heavy Gaussian blur**.

**FR5.2.3** A **2D terminal interface** renders inside, auto-typing the bio as bash commands:

```
$ whoami
> tanmay_goel

$ cat background.txt
> CS student at UIUC. I love to build and explore using AI tools —
> finding new ways to apply them to real problems is what gets me going.

$ cat interests.txt
> The intersection of Computer Science, Economics, and AI.
> How intelligent systems can model and interact with complex, human-driven systems.

$ cat looking_for.txt
> Opportunities to learn, explore, and build things that matter.
> Open to internships, research roles, and collaboration.

$ ls contact/
> github/   linkedin/   email/

$ cat contact/github
> [clickable glowing link]

$ cat contact/linkedin
> [clickable glowing link]

$ cat contact/email
> [clickable glowing link]
```

> Exact wording is approximate — polish during implementation.

---

#### FR5.3 — Skills Sector

**FR5.3.1** Camera **flies into** the pane, which **expands to fill the entire viewport** (100vw × 100vh), identical to the About Me transition.

**FR5.3.2** The 3D background receives a **heavy Gaussian blur** (same treatment as About Me).

**FR5.3.3** A **2D network graph** renders as a full-viewport overlay on a black background with a **two-tier hierarchical structure**:

- **Category nodes (Tier 1):** Larger glowing nodes scattered across the viewport in a loosely organic layout. Each node displays its label and uses its assigned color from the skills data config. Connected to each other by faint glowing lines to form a constellation-like network.
- **Skill nodes (Tier 2):** Smaller nodes representing individual skills. Hidden by default.

**FR5.3.4 — Default State:** Only **Tier 1 category nodes** are visible and labeled, connected by faint lines. Tier 2 nodes are hidden.

**FR5.3.5 — Click on Category Node:** Clicking a category node triggers a **light-racer expansion animation**:
- Cyan light trails shoot outward from the clicked node along branching paths
- Each trail terminates by spawning a **new Tier 2 skill node** at its endpoint
- Connecting lines remain visible between the parent and each child node
- Clicking the same category node again **collapses** it — child nodes retract back along the trails and disappear

**FR5.3.6 — Hover on any node:** Highlights the node and all its connected edges with a brightness pulse. Displays the node label if not already visible.

**FR5.3.7 — Node Layout:** Category nodes use pre-defined positions spread across the viewport to prevent overlap. Child nodes spawn in a radial pattern around their parent, with enough spacing to remain readable.

---

### FR6: Global Navigation — The Escape Hatch

**FR6.1** The top-left HUD (**small red disc + "TANMAY GOEL" text**) is **always fixed, always visible, and always clickable** during Phase 4 and Phase 5.

**FR6.2** Clicking the HUD triggers:
- A **high-speed reverse camera lerp** back to the Phase 4 default camera position (facing the three gateway panes)
- All sector content fades out
- All three panes fade back in
- The horizon line and grid re-appear

---

## 6. Non-Functional Requirements (NFR)

**NFR1 — Performance:** The WebGL canvas must maintain a stable **60 FPS** on modern desktop browsers. Use instanced meshes for grid lines and explosion particles to reduce draw calls.

**NFR2 — Mobile Graceful Degradation:** On viewports < 768px:
- The **boot sequence (Phase 1)** scales down to fit mobile viewports — light-cycle sprites and "LOADING" text are proportionally sized
- Disable Phase 4 orbital controls
- Stack the three gateway panes **vertically** in a scrollable 2D overlay
- Keep a simplified, static 3D grid looping in the background
- All sector content (About, Skills, Projects) still accessible via tap

**NFR3 — Load Time:** Target < 3 second initial load as a general goal. All 3D assets are loaded eagerly on initial page load — the boot sequence animation provides sufficient cover time. If loading exceeds the boot animation duration, address during implementation.

**NFR4 — SEO & Social Preview:** Include Open Graph meta tags so the link previews correctly when shared:
- **OG Image:** Static image of "TANMAY GOEL" / "SOFTWARE DEVELOPER" in TR2N / Roboto Mono on black background, matching the Phase 2 visual
- **OG Title:** "Tanmay Goel — Software Developer"
- **OG Description:** "CS at UIUC. Building at the intersection of Computer Science, Economics, and AI."

**NFR5 — Favicon:** A glowing **Crimson Red** bordered **"T"** in the TR2N font, on a black background.

**NFR6 — WebGL Fallback:** On page load, detect WebGL support. If unavailable, display a styled error message: *"This experience requires WebGL. Please use a modern browser."* Include direct links to GitHub, LinkedIn, and email so the user can still reach the author.

---

## 7. Content Specification

### 7.1 Projects (`src/data/projects.js`)

Three monoliths. Content is data-driven and easily swappable via the config file. One monolith represents the **currently active project** (Red accent + "IN PROGRESS" tag — see FR5.1.4). The other two are completed showcase projects (Orange accent). Template:

```js
export const projects = [
  {
    id: 'project-1',
    name: 'TBD',
    tagline: 'TBD',
    techStack: ['TBD'],
    accentColor: '#FF5E00',
    githubUrl: 'TBD',
    active: true,            // currently working on this project
    position: [-4, 0, 0],
  },
  {
    id: 'project-2',
    name: 'TBD',
    tagline: 'TBD',
    techStack: ['TBD'],
    accentColor: '#00FFFF',
    githubUrl: 'TBD',
    position: [0, 0, 0],
  },
  {
    id: 'project-3',
    name: 'TBD',
    tagline: 'TBD',
    techStack: ['TBD'],
    accentColor: '#FF0000',
    githubUrl: 'TBD',
    position: [4, 0, 0],
  },
]
```

### 7.2 About Me
Core content confirmed:
- CS at UIUC
- Loves to build and explore using AI tools
- Looking for opportunities to learn and explore
- Contact links (GitHub, LinkedIn, Email) rendered as clickable glowing terminal links at end of output

### 7.3 Skills Graph (`src/data/skills.js`)

~31 skills across 5 categories. Two-tier structure. Template:

```js
export const skillCategories = [
  {
    id: 'languages',
    label: 'Languages',
    color: '#00FFFF',
    skills: ['Python', 'JavaScript/TypeScript', 'C', 'C++', 'Java', 'HTML/CSS', 'Kotlin', 'R', 'Verilog', 'MIPS Assembly'],
  },
  {
    id: 'frameworks',
    label: 'Frameworks & Libraries',
    color: '#FF5E00',
    skills: ['React', 'Next.js', 'FastAPI', 'PyTorch', 'NumPy', 'Pandas', 'Selenium', 'Gymnasium', 'HuggingFace'],
  },
  {
    id: 'tools',
    label: 'Tools & Platforms',
    color: '#00FFFF',
    skills: ['Git', 'Docker', 'AWS', 'Vercel', 'Linux', 'PostgreSQL'],
  },
  {
    id: 'ai-tools',
    label: 'AI Coding Tools',
    color: '#FF5E00',
    skills: ['Claude Code', 'Cursor/Antigravity'],
  },
  {
    id: 'certifications',
    label: 'Certifications',
    color: '#FF0000',
    skills: [
      'AWS Cloud Practitioner',
      'PCEP – Python Entry-Level Programmer',
      'Databricks – AI Agent Fundamentals',
      'Databricks – Generative AI Fundamentals',
    ],
  },
]
```

### 7.4 Contact Links
To be added to `src/data/contact.js`. Appears in top-right HUD icons and About Me terminal.

```js
export const contact = {
  github: 'TBD',
  linkedin: 'TBD',
  email: 'TBD',
}
```

---

## 8. Deployment

- **Host:** Vercel
- **Build:** Static SPA export via Vite (`vite build`)
- **Domain:** Custom domain (author-owned), configured through Vercel DNS settings

---

## 9. Open Questions

1. ~~**Skills List:**~~ ✅ Resolved — 5 categories, ~31 skills total. See Section 7.3.
2. **Contact Links:** DEFERRED — GitHub URL, LinkedIn URL, and email address for `src/data/contact.js` and the top-right HUD. Risk: placeholder links will be visible if deployed before filling in.
3. **Project Data:** All 3 project entries in `src/data/projects.js` are still TBD — to be populated during/after development.
