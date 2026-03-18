# Testing Patterns

**Analysis Date:** 2026-03-17

## Test Framework

**Status:** Not Configured

**Runner:** None installed
- No Jest, Vitest, or other test runner in `package.json`
- No test configuration files (`jest.config.js`, `vitest.config.js`)

**Assertion Library:** None installed
- No testing libraries (e.g., `@testing-library/react`, `@testing-library/jest-dom`)

## Test File Organization

**Location:** No test files found in codebase
- Glob search for `*.test.*`, `*.spec.*` returned no matches
- No `tests/`, `__tests__/`, or `spec/` directories

**Recommendation for Future Implementation:**
- Co-locate tests with components: `components/3D/IdentityDisc.jsx` → `components/3D/IdentityDisc.test.jsx`
- Data files and utilities: `data/skills.js` → `data/skills.test.js`
- Store tests: `store/appState.test.js`

## Testing Strategy (Not Yet Implemented)

### Recommended Setup

**For unit tests (components, utilities):**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Config file structure:**
- `vitest.config.js` for Vitest configuration (recommended over Jest for Vite projects)

### Test Categories to Cover

**React Components:**
- Render tests (component mounts without errors)
- Props tests (components accept and respond to props)
- State tests (useState hooks update correctly)
- Event handler tests (onClick, onHover callbacks fire)
- Conditional rendering (phase-based visibility)

**Three.js Components:**
- Geometry generation (canvas texture creation for `IdentityDisc`)
- Ref management (useRef correctly captures mesh references)
- Animation frame logic (useFrame updates positions/rotations correctly)
- useMemo dependencies (expensive computations cached properly)

**Zustand Store:**
- State initialization (correct default values)
- State updates (setters modify state correctly)
- Selectors (subscriptions return correct slices)
- Action calls (toggleAudio flips audioEnabled)

**Utilities and Helpers:**
- `createDiscTexture()` returns valid Three.js Texture
- Helper functions (`drawRing`, `drawArc`, `drawTick`) accept correct params

## Test Structure (Proposed)

**Basic test suite pattern:**
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TitleOverlay from './TitleOverlay'

describe('TitleOverlay', () => {
  it('renders title with glitch prop', () => {
    render(<TitleOverlay glitch={false} />)
    expect(screen.getByText('TANMAY GOEL')).toBeInTheDocument()
  })

  it('applies glitch effect when glitch=true', async () => {
    const { rerender } = render(<TitleOverlay glitch={false} />)
    rerender(<TitleOverlay glitch={true} />)
    // Wait for glitch animation
    await vi.waitFor(() => {
      // Assert glitched characters appear
    })
  })

  it('clears interval on unmount', () => {
    const { unmount } = render(<TitleOverlay glitch={true} />)
    unmount()
    // Verify no memory leaks
  })
})
```

**Store test pattern:**
```javascript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useAppState from './appState'

describe('useAppState', () => {
  it('initializes with correct defaults', () => {
    const { result } = renderHook(() => useAppState())
    expect(result.current.phase).toBe(2)
    expect(result.current.audioEnabled).toBe(true)
    expect(result.current.hudVisible).toBe(false)
  })

  it('updates phase when setPhase is called', () => {
    const { result } = renderHook(() => useAppState())
    act(() => {
      result.current.setPhase(3)
    })
    expect(result.current.phase).toBe(3)
  })

  it('toggles audio state', () => {
    const { result } = renderHook(() => useAppState())
    const initial = result.current.audioEnabled
    act(() => {
      result.current.toggleAudio()
    })
    expect(result.current.audioEnabled).toBe(!initial)
  })
})
```

## Mocking Strategy

**What to Mock:**
- Three.js modules (THREE, @react-three/fiber) in non-Three.js-focused tests
- Browser APIs: `document.createElement`, `canvas.getContext` (for texture generation tests)
- `useFrame` hook (mock time progression for animation tests)
- Event handlers (vi.fn() for `onClick`, `onHover`)

**What NOT to Mock:**
- Zustand store (test the real store, not a mock)
- DOM rendering (use @testing-library/react, not shallow rendering)
- Component logic (test behavior, not implementation details)

**Example mock for Three.js:**
```javascript
vi.mock('three', () => ({
  Vector3: vi.fn((x, y, z) => ({ x, y, z })),
  CanvasTexture: vi.fn(() => ({ needsUpdate: true })),
  // Mock other THREE exports as needed
}))
```

## Fixtures and Test Data

**Location (Proposed):**
- `src/__tests__/fixtures/` — shared test data
- Example: `src/__tests__/fixtures/mockProjects.js` containing sample project objects

**Pattern:**
```javascript
// src/__tests__/fixtures/mockProjects.js
export const mockProject = {
  id: 'test-project-1',
  name: 'Test Project',
  tagline: 'A test',
  techStack: ['React', 'Three.js'],
  accentColor: '#FF0000',
  githubUrl: 'https://github.com/test',
  active: true,
  position: [0, 0, 0],
}

export const mockProjects = [mockProject, { ...mockProject, id: 'test-project-2' }]
```

## Coverage Requirements

**Not Yet Enforced:**
- No coverage threshold configured
- Recommended targets:
  - Statements: 80%+
  - Branches: 75%+
  - Functions: 80%+
  - Lines: 80%+

**View Coverage (Once Configured):**
```bash
npm run test:coverage
# Opens coverage/index.html in browser
```

## Test Commands (To Be Added to package.json)

**Recommended npm scripts:**
```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest --coverage",
  "test:ui": "vitest --ui"
}
```

## Test Types

**Unit Tests (Priority: High):**
- **Zustand store:** State initialization, setters, selectors
- **Utility functions:** `createDiscTexture()`, texture generation helpers
- **Data modules:** `projects.js`, `skills.js`, `contact.js` exports correct shape

**Integration Tests (Priority: Medium):**
- **App.jsx:** Canvas mounts, Scene component receives props, phase changes trigger phase visibility
- **Phase transitions:** Setting phase in store affects which components render
- **Event flow:** Hovering disc → `onDiscHover` callback → TitleOverlay glitch effect

**Component Tests (Priority: High):**
- **TitleOverlay:** Renders title, glitch effect toggles on prop change, cleanup on unmount
- **IdentityDisc:** Mesh refs initialized, particle animations work, hover state managed
- **Scene:** Conditionally renders phases based on store state

**Three.js-Specific Tests (Priority: Medium):**
- **Texture generation:** Canvas texture creation in `createDiscTexture()` produces valid Three.js Texture
- **Geometry:** Grid geometry construction returns correct point count and BufferGeometry
- **Animation:** useFrame callback updates positions/rotations correctly with delta time

**E2E Tests (Priority: Low - Not Recommended for WebGL):**
- WebGL canvas interactions are difficult to test with traditional E2E tools
- Alternative: Visual regression testing (Percy, Chromatic) if available

## Current Testing Gaps

**No Tests Implemented:**
- 0% coverage across entire codebase
- No test utilities or helpers
- No CI/CD testing pipeline configured
- No mocking infrastructure

**High-Risk Areas Without Tests:**
- `IdentityDisc.jsx` — Complex Three.js animation logic, particle system
- `createDiscTexture()` — Canvas drawing with 200+ lines
- `useAppState` — Central state management
- `TitleOverlay.jsx` — Glitch effect animation with interval management

**Recommended First Tests:**
1. Zustand store (easiest to test, highest impact)
2. Data module exports (trivial tests, good for setup)
3. TitleOverlay component (UI logic is testable)
4. Utility functions (no dependencies)
5. Three.js components (requires mocking, lower priority)

---

*Testing analysis: 2026-03-17*
