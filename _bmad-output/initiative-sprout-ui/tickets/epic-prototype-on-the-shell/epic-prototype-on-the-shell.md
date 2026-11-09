---
tracker_id: ""
type: epic
title: "A screen you can judge before it is real"
parent: initiative-sprout-ui
covers: ["R3", "R10"]
sources: []
companions: []
after: []
risk: low
refined: false
---

# A screen you can judge before it is real

## Description

The shell in `ui/` (commit `2c53524`) already runs the plant-and-watch flow on a mock. This epic gives it its look and its finished behavior: the UX spines from the Sally run (`DESIGN.md`, `EXPERIENCE.md`) are approved, the screen is built with the Astryx design system as shipped, and every state of the flow can be reached by the user through the scenario switch (`?cenario=`), so the proposal can be judged before any server exists. The real server and Herdr arrive in the next epic, which replaces the mock behind the same `SproutApi` interface.

## Outcome

For the user, the plant-and-watch screen can be opened and walked through in every state on simulated data, and the verdict "this is the flow and the look I want" or a list of changes is the signal.

## Done when

- `DESIGN.md` and `EXPERIENCE.md` are approved and the screen is built only from Astryx components, with no Sprout-owned colors, type or spacing.
- The scenarios `ok`, `erro` and `sem-herdr` each show their states, with the text and recovery the experience spine defines.
- Destination and name suggestions and the refusals of an invalid destination behave as R3 states, on the screen.
- The form, the log and every state are operable by keyboard and announced to assistive technology, with motion off under reduced-motion (the screen's part of R10).
- Typecheck, tests and build are green, the work is committed on `feat/sprout-ui` and opens with `bun run dev`, and the user has judged it.

## Boundaries

- Belongs to the next epic: the server, `sprout ui`, the real plant, the agent lookup, the live terminal transport, keyboard input inside the terminal (R7) and the token check (R1).
- Touch point: `ui/` shell — page, `SproutApi` interface and mock are used here; owner: this epic
- Must not change: the `SproutApi` contract, except to add what the screen proves it lacks, recorded for epic 2.

## References

- parent — `_bmad-output/initiative-sprout-ui/initiative-sprout-ui.md`, Requirements R3, R10 and Constraints C3, C6
- design — `_bmad-output/initiative-sprout-ui/ux-plant-and-watch/DESIGN.md` (adopted, run in progress)
- design — `_bmad-output/initiative-sprout-ui/ux-plant-and-watch/EXPERIENCE.md` (adopted, run in progress)

## Notes

- Decision: refinement waits for the Sally run to finish; her spines settle most of what the stories need (2026-11-08).
