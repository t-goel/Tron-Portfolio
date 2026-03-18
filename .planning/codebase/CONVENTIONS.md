# Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `IdentityDisc.jsx`, `TitleOverlay.jsx`, `Scene.jsx`)
- Utilities and data modules: camelCase (e.g., `appState.js`, `projects.js`, `skills.js`)
- Entry point: lowercase `main.jsx`, `App.jsx` (main app component)

**Functions:**
- React functional components: PascalCase
- Helper functions: camelCase (e.g., `createDiscTexture`, `drawRing`, `drawTick`)
- Event handlers: prefixed with `handle` in camelCase (e.g., `handlePointerEnter`, `handlePointerLeave`, `handleClick`)
- Callback functions: named descriptively with action verb (e.g., `onDiscHover`, `setDiscHovered`)

**Variables:**
- Local state: camelCase (e.g., `hovered`, `displayName`, `glitchInterval`)
- Constants: UPPER_SNAKE_CASE (e.g., `DISC_RADIUS`, `TEX_SIZE`, `GLITCH_CHARS`, `RED`, `DIM_RED`)
- Ref variables: suffixed with `Ref` (e.g., `discGroupRef`, `detailMeshRef`, `particlesRef`)
- Configuration objects: camelCase with singular/plural nouns (e.g., `skillCategories`, `projects`, `contact`)

**Types:**
- Props objects: destructured directly in function parameters (JSX, not TypeScript)
- Store state shape: simple object keys in camelCase (e.g., `phase`, `audioEnabled`, `hudVisible`)

## Code Style

**Formatting:**
- No Prettier config detected — uses project defaults
- Two-space indentation (standard for Node/React)
- Semicolons: Used throughout
- Quotes: Single quotes for strings in JS, double quotes in JSX attributes

**Linting:**
- ESLint with flat config (`eslint.config.js`)
- Rules enabled:
  - `@eslint/js:recommended` — standard rules
  - `eslint-plugin-react-hooks:flat/recommended` — React Hooks best practices
  - `eslint-plugin-react-refresh/vite` — Vite HMR compatibility
  - Custom: `no-unused-vars` allows unused variables if capitalized (imports like `THREE`)
- No TypeScript — plain JSX with optional type annotations via JSDoc comments (minimal usage)

## Import Organization

**Order:**
1. React imports (`import { useState, useEffect } from 'react'`)
2. Third-party libraries (`import { Canvas } from '@react-three/fiber'`, `import * as THREE from 'three'`)
3. Internal components and modules (relative imports from `./components`, `./store`, `./data`)
4. Styles (if using CSS modules or imports)

**Path Aliases:**
- Not used; imports use relative paths (e.g., `../store/appState`, `./3D/IdentityDisc`)

**Export Pattern:**
- Named exports for utility functions and constants (e.g., `export const projects = [...]`)
- Default exports for React components (e.g., `export default function App()`)
- Zustand stores exported as default (e.g., `export default useAppState`)

## Error Handling

**Patterns:**
- Minimal explicit error handling observed in codebase
- Guard clauses with early returns: `if (!discGroupRef.current) return`
- Optional chaining for callbacks: `onClick?.()`, `onHoverChange?.(true)`
- Fallback null checks in conditionals: `if (particlesRef.current) { ... }`

**No try-catch blocks** — errors propagate to React error boundary (not yet implemented but recommended)

## Logging

**Framework:** `console` (built-in browser API)

**Patterns:**
- Minimal logging in current codebase
- No structured logging framework (Winston, Pino) — use `console.log()`, `console.error()`, `console.warn()` if needed
- Avoid logging in render functions

## Comments

**When to Comment:**
- Describe complex algorithms or non-obvious logic (e.g., particle system physics in `IdentityDisc.jsx`)
- Mark zones and sections in canvas drawing code (e.g., `// === OUTER ZONE ===`, `// === MID ZONE ===`)
- Explain phase numbers in state (e.g., `phase: 2, // Start at Phase 2 (Identity Disc)`)

**JSDoc/TSDoc:**
- Not used systematically (JSX without TypeScript)
- Can add JSDoc comments for complex functions if needed: `/** @param {number} r - Ring radius */`

## Function Design

**Size:**
- Small focused functions preferred (e.g., `drawRing`, `drawArc`, `drawTick`)
- Larger component functions acceptable when managing complex state (e.g., `IdentityDisc.jsx` is 260+ lines but cohesive)

**Parameters:**
- Destructure props in component signatures: `function IdentityDisc({ onClick, onHoverChange })`
- Inline arrow functions for event handlers with callback closures
- Use `useCallback` for event handlers passed to children to prevent unnecessary re-renders

**Return Values:**
- React components return JSX (using fragment `<>` for wrapping when needed)
- Utility functions return computed values (e.g., `createDiscTexture()` returns Three.js Texture)
- Zustand actions return void (implicit state updates via `set`)

## Module Design

**Exports:**
- One React component per file
- Multiple utility/data exports allowed in data files (`src/data/skills.js` exports `skillCategories`)
- Store file exports single Zustand hook (`useAppState`)

**Barrel Files:**
- Not used; no index.js files in component directories
- Import directly from component files (e.g., `import IdentityDisc from './components/3D/IdentityDisc'`)

## Code Organization

**Component Structure:**
- Imports at top
- Constants below imports (e.g., `DISC_RADIUS = 1.8`)
- Helper functions before main component (e.g., `createDiscTexture()` before `IdentityDisc`)
- Hooks (`useState`, `useMemo`, `useCallback`, `useFrame`) declared at component start
- Render return at end

**Store Structure (Zustand):**
- Single `create()` call with object containing state + actions
- State properties first (e.g., `phase`, `audioEnabled`)
- Action methods follow state (e.g., `setPhase`, `toggleAudio`)

## Three.js/R3F Patterns

**Conventions:**
- Refs for Three.js mesh/group access: `useRef()` for `discGroupRef`, `detailMeshRef`
- `useFrame` for animation loops (access `state.clock.elapsedTime`, delta)
- `useMemo` for expensive computations (texture generation, geometry, particle data)
- Inline JSX for R3F primitives (e.g., `<mesh>`, `<group>`, `<lineSegments>`)
- THREE constants imported with namespace: `import * as THREE` → `THREE.Vector3`, `THREE.LinearFilter`

## Zustand Store Patterns

**Usage:**
- Subscribe selectors to specific state slices: `useAppState((s) => s.phase)`
- Actions called directly: `setPhase(3)`, `toggleAudio()`
- No middleware or advanced patterns in current store

## Tailwind CSS

**Styling Approach:**
- Tailwind CSS integrated via `@tailwindcss/vite`
- Inline styles used for positioning/transforms in JS (e.g., `style={{ position: 'absolute', ... }}`)
- CSS variables defined in `:root` for design system colors (`--void-black`, `--neon-cyan`, etc.)
- No CSS Modules detected; Tailwind classes not heavily used in JSX (inline styles preferred for positioning)

---

*Convention analysis: 2026-03-17*
