# Technology Stack

**Analysis Date:** 2026-03-17

## Languages

**Primary:**
- JavaScript (JSX) - Application code, components, configuration

**Secondary:**
- HTML5 - Document markup in `index.html`
- CSS3 - Styling via Tailwind CSS and CSS Modules

## Runtime

**Environment:**
- Node.js 22.18.0 (current development environment)
- npm 10.9.3 (package manager)

**Package Manager:**
- npm (verified in package-lock.json v3)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.0 - UI component framework and state management
- Vite 7.3.1 - Build tool and development server

**3D & WebGL:**
- Three.js 0.183.2 - 3D rendering engine and WebGL abstraction
- @react-three/fiber 9.5.0 - React renderer for Three.js scenes
- @react-three/drei 10.7.7 - Reusable Three.js components (OrbitControls, billboards, text geometry)
- @react-three/postprocessing 3.0.4 - Post-processing effects (bloom, vignette, glow)

**Animation & Motion:**
- GSAP 3.14.2 - High-performance animation library for camera transitions and UI lerping

**State Management:**
- Zustand 5.0.11 - Lightweight global state management (phase, camera, audio, UI visibility)

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- @tailwindcss/vite 4.2.1 - Vite plugin integration for Tailwind

**Audio:**
- Howler.js 2.2.4 - Web audio API abstraction for background music and sound effects

## Key Dependencies

**Critical:**
- react-dom 19.2.0 - React DOM rendering (required peer dependency)
- three (0.183.2) - Foundation for all 3D rendering; upgrading requires testing WebGL compatibility
- zustand (5.0.11) - Single source of truth for phase state and camera/audio control

**Build & Development:**
- @vitejs/plugin-react 5.1.1 - Fast Refresh and JSX handling in Vite
- eslint 9.39.1 - Code quality and linting
- eslint-plugin-react-hooks 7.0.1 - React Hooks rule enforcement
- eslint-plugin-react-refresh 0.4.24 - React refresh compatibility checks

## Configuration

**Build Configuration:**
- `vite.config.js` - Vite build configuration with React and Tailwind plugins
- `eslint.config.js` - ESLint configuration with React, React Hooks, and refresh rules
- `package.json` - Project metadata and script commands

**Environment:**
- No `.env` files present - Configuration is static/hardcoded in config files
- No environment-based secrets detected
- All content configuration lives in `src/data/` (projects.js, skills.js, contact.js)

**Build Scripts:**
```bash
npm run dev      # Start Vite development server with hot module replacement
npm run build    # Production build to `dist/` directory
npm run preview  # Preview production build locally
npm run lint     # Run ESLint code quality checks
```

## Platform Requirements

**Development:**
- Node.js 18.0.0+ recommended (currently using 22.18.0)
- Modern browser with WebGL support (Chrome, Firefox, Safari, Edge)
- UNIX-like shell for npm scripts

**Production:**
- Static hosting platform (configured for Vercel deployment)
- No server-side rendering or backend required
- Browser WebGL capability required; graceful degradation for unsupported browsers
- Modern browsers: Chrome/Edge 90+, Firefox 88+, Safari 14+

## Fonts & Assets

**Custom Fonts:**
- `src/assets/fonts/Tron-JOAa.ttf` - TR2N font for headers (Tron-themed typography)
- Google Fonts: Roboto Mono (preloaded in `index.html` for terminal/code text)

**Asset Pipeline:**
- Fonts preloaded in `index.html` with crossorigin attribute
- Static assets served from `public/` directory (empty in current state)
- Font files bundled during build via Vite

## Performance Optimizations

**Current Implementation:**
- Canvas rendering with `dpr: [1, 2]` for device pixel ratio handling
- Three.js antialias enabled in Canvas configuration
- Lazy loading of components via React phase-based architecture

**Target Metrics:**
- 60 FPS rendering on modern browsers
- <3 second initial load time
- Mobile graceful degradation for <768px viewports

---

*Stack analysis: 2026-03-17*
