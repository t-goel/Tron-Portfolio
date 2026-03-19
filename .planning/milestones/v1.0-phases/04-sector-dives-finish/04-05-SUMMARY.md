---
plan: 04-05
phase: 04-sector-dives-finish
status: complete
---

# Plan 04-05: Populate Real Project & Contact Data

## What Was Built

Replaced all `TBD` placeholder values in the two portfolio data files with real content provided by the user.

## Key Files

### Modified
- `src/data/projects.js` — 3 real projects with names, taglines, tech stacks, GitHub URLs, and active flags
- `src/data/contact.js` — GitHub, LinkedIn, and email set to real values

## Summary

| Field | Before | After |
|-------|--------|-------|
| TBD strings in projects.js | 12 | 0 |
| TBD strings in contact.js | 3 | 0 |
| Production build | ✓ | ✓ |

### Projects Added
1. **Pacman-Q-Learning** — Pygame Pac-Man with Q-learning ghosts (archived)
2. **MacroAnalyzer** — NLP financial sentiment analysis (archived)
3. **Sylli** — RAG study app on AWS (active, IN PROGRESS badge)

### Contact
- GitHub: https://github.com/t-goel
- LinkedIn: https://www.linkedin.com/in/tim-goel/
- Email: timgoelny@gmail.com

## Deviations
None.

## Self-Check: PASSED
- Zero TBD strings in both data files ✓
- All GitHub URLs start with https:// ✓
- Production build succeeds ✓
- Exactly 3 projects exported ✓
- contact.js exports github, linkedin, email ✓
