# Random Spot Walk — LLM Agent Guide

Mobile-first GPS-tracked random-destination walking game. State machine:
setup → walking → completed. React 19, Vite 8, TypeScript, Zustand v5, Leaflet.
No backend — localStorage persistence.

**How to use:** Read this index, then open only the doc(s) whose tags match
your task. Do not load all docs at once.

## Doc index

| File | Tags |
|---|---|
| docs/product/overview.md | identity, state-machine, tech-stack, setup-commands, node-version |
| docs/product/scope.md | game-flow, screens, data-models, features, ui-ux, difficulty, radius, timer, gamification |
| docs/technical/architecture.md | project-structure, stores, hooks, components, state-management, tech-decisions |
| docs/technical/gotchas.md | strictmode, map-click, leaflet, gps, verbatimmodulesyntax, store-coordination, pitfalls |
| docs/technical/storage.md | localstorage, persistence, schema, active-walk, setup-draft, keys |
| docs/technical/flows.md | user-flows, store-coordination, walk-lifecycle, streak-logic, arrival-detection |
| docs/reference/edits.md | cheat-sheet, where-to-edit, lookup |

## Maintenance rules for LLMs

- New doc? Add its row to the table with relevant tags. Place under the
  matching subdirectory (product/technical/reference).
- Doc grew past ~150 lines or covers 3+ distinct topics? Split it, update table.
- Deleted a doc? Remove its row; check other docs for stale cross-references.
- Code changed significantly? Review gotchas.md and edits.md for staleness.
- Cross-reference format between docs: `→ [short description](../path)`
