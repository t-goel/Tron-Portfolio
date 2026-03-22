# Projects Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current left-border card list in `ProjectsSector.jsx` with a terminal data-readout layout where project rows are revealed by a sweeping cyan scan bar animation on mount.

**Architecture:** A single-file rewrite of `ProjectsSector.jsx`. CSS `@keyframes` are injected once into `document.head` via a module-level guard. The scan bar and row reveals are two independent CSS animations whose delays are manually tuned to appear synchronized — no JS timers or scroll-linking involved.

**Tech Stack:** React (JSX), inline styles, CSS `@keyframes` injected via `document.head`, `src/data/projects.js` (unchanged)

---

### Task 1: Inject keyframes and verify they land in the DOM

**Files:**
- Modify: `src/components/UI/ProjectsSector.jsx`

The component uses inline styles only — there is no stylesheet or CSS module. Keyframes must be injected into `document.head` at module load time. A module-level flag prevents duplicate injection on HMR remounts.

- [ ] **Step 1: Replace the entire file with the keyframe-injection scaffold**

Open `src/components/UI/ProjectsSector.jsx` and replace its contents with:

```jsx
import { useState, useEffect } from 'react'
import { projects } from '../../data/projects'

// Inject @keyframes once per page load (module-level guard survives HMR remounts)
let styleInjected = false
function injectStyles() {
  if (styleInjected) return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes scanDown {
      0%   { top: 0%;   opacity: 1; }
      92%  { top: 100%; opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes revealRow {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

export default function ProjectsSector() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    injectStyles()
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 30,
      pointerEvents: 'none',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease-in',
    }}>
      <div style={{ pointerEvents: 'auto', overflowY: 'auto', overflowX: 'hidden', height: '100%' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
          <p style={{ color: '#00FFFF', fontFamily: 'Roboto Mono', fontSize: 12 }}>SCAFFOLD OK</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Open the dev server and verify the scaffold renders**

```bash
npm run dev
```

Navigate to the site, enter the grid, click the PROJECTS pane. You should see a blurred dark overlay with "SCAFFOLD OK" in cyan. Open DevTools → Elements → `<head>` and confirm a `<style>` tag containing `scanDown` and `revealRow` is present. Refresh — confirm only one `<style>` tag exists (no duplicates).

- [ ] **Step 3: Commit**

```bash
git add src/components/UI/ProjectsSector.jsx
git commit -m "feat: projects page — inject keyframes scaffold"
```

---

### Task 2: Add the scan bar and column header

**Files:**
- Modify: `src/components/UI/ProjectsSector.jsx`

The inner column needs `position: relative` so the absolutely-positioned scan bar is constrained to it.

- [ ] **Step 1: Replace the inner column with the scan bar + header**

Replace the `<div style={{ maxWidth: 720 ... }}>` block (and its children) with:

```jsx
<div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px', position: 'relative' }}>

  {/* Scan bar — purely decorative, sweeps top→bottom then fades */}
  <div style={{
    position: 'absolute',
    left: 0, right: 0,
    height: 3,
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.7) 30%, #00FFFF 50%, rgba(0,255,255,0.7) 70%, transparent 100%)',
    boxShadow: '0 0 18px 6px rgba(0,255,255,0.3)',
    top: 0,
    animation: 'scanDown 1.4s cubic-bezier(0.4,0,0.6,1) 0.3s forwards',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 2,
  }} />

  {/* Column header */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Roboto Mono', monospace",
    fontSize: 10,
    color: 'rgba(0,255,255,0.25)',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(0,255,255,0.1)',
    paddingBottom: 10,
    marginBottom: 4,
    opacity: 0,
    animation: 'revealRow 0.2s ease-out 0.3s forwards',
  }}>
    <span>ID / NAME</span>
    <span>STACK / STATUS</span>
  </div>

</div>
```

- [ ] **Step 2: Verify in browser**

The dark overlay should now show the column header ("ID / NAME" / "STACK / STATUS") fading in at ~0.3s, and a cyan glow bar sweeping down the column over ~1.4s. Both disappear/stay after completing.

- [ ] **Step 3: Commit**

```bash
git add src/components/UI/ProjectsSector.jsx
git commit -m "feat: projects page — scan bar and column header"
```

---

### Task 3: Render project rows with staggered reveal

**Files:**
- Modify: `src/components/UI/ProjectsSector.jsx`

Projects are sorted active-first before rendering. The index prefix is derived from the project's `id` field (`'project-3'` → `'03'`). Row delays are hardcoded for the 3-row dataset.

- [ ] **Step 1: Add the row delay map and sorted project list, then render rows**

Add these constants just above the `return` statement inside the component function:

```jsx
// Active projects first, preserve relative order within each group
const sorted = [...projects].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))

// Hardcoded reveal delays tuned for 3 rows — extend manually if more projects are added
const ROW_DELAYS = ['0.45s', '0.75s', '1.05s']
```

Then replace the inner column's content (after the column header `</div>`) with the row list:

```jsx
{sorted.map((project, i) => {
  // Derive display index from id: 'project-3' → '03'
  const idNum = project.id.replace('project-', '').padStart(2, '0')
  const delay = ROW_DELAYS[i] ?? `${0.45 + i * 0.3}s`
  const isLast = i === sorted.length - 1

  return (
    <div
      key={project.id}
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(0,255,255,0.08)',
        padding: '16px 0',
        opacity: 0,
        animation: `revealRow 0.25s ease-out ${delay} forwards`,
      }}
    >
      {/* Index line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 10,
            color: 'rgba(0,255,255,0.35)',
            letterSpacing: '0.15em',
            marginRight: 10,
          }}>
            {idNum} &gt;
          </span>
          <span style={{
            fontFamily: "'TR2N', sans-serif",
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: '#F0F0F0',
            letterSpacing: '0.25em',
          }}>
            {project.name}
          </span>
        </div>
        {project.active ? (
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 10,
            color: '#FF0000',
            letterSpacing: '0.1em',
            flexShrink: 0,
            marginLeft: 12,
          }}>
            ● IN PROGRESS
          </span>
        ) : (
          <span style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 10,
            color: 'rgba(0,255,255,0.5)',
            letterSpacing: '0.1em',
            flexShrink: 0,
            marginLeft: 12,
          }}>
            ✓ COMPLETE
          </span>
        )}
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: "'Roboto Mono', monospace",
        fontSize: 12,
        color: 'rgba(240,240,240,0.55)',
        lineHeight: 1.6,
        marginBottom: 10,
      }}>
        {project.tagline}
      </div>

      {/* Tech stack pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {project.techStack.map((tech) => (
          <span key={tech} style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 10,
            border: '1px solid rgba(0,255,255,0.3)',
            background: 'rgba(0,255,255,0.05)',
            borderRadius: 3,
            padding: '2px 8px',
            color: 'rgba(0,255,255,0.8)',
          }}>
            {tech}
          </span>
        ))}
      </div>

      {/* GitHub link */}
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 11,
          color: 'rgba(0,255,255,0.4)',
          textDecoration: 'none',
          letterSpacing: '0.1em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#00FFFF'
          e.currentTarget.style.textShadow = '0 0 10px #00FFFF'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(0,255,255,0.4)'
          e.currentTarget.style.textShadow = 'none'
        }}
      >
        VIEW ON GITHUB ↗
      </a>
    </div>
  )
})}
```

- [ ] **Step 2: Verify full layout in browser**

Open the projects sector. You should see:
1. Overlay fades in (~0.4s)
2. Column header ("ID / NAME" / "STACK / STATUS") appears at 0.3s
3. Cyan scan bar sweeps top-to-bottom over 1.4s
4. SYLLI row appears at ~0.45s, MACROANALYZER at ~0.75s, PACMAN-Q-LEARNING at ~1.05s
5. SYLLI shows `● IN PROGRESS` in red; others show `✓ COMPLETE` in dim cyan
6. Index prefixes: SYLLI = `03 >`, MACROANALYZER = `02 >`, PACMAN = `01 >`
7. Hover on GitHub link glows cyan

- [ ] **Step 3: Verify dismiss still works**

Press ESC — the overlay should unmount and the 3D grid reappear. Click the HUD home button (top-left) — same result.

- [ ] **Step 4: Commit**

```bash
git add src/components/UI/ProjectsSector.jsx
git commit -m "feat: projects page — terminal readout with scan bar reveal"
```
