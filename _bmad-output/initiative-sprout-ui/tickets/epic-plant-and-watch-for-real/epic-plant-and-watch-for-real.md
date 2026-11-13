---
tracker_id: ""
type: epic
title: "Plant and watch on the real Herdr"
parent: initiative-sprout-ui
covers: ["R1", "R2", "R4", "R5", "R6", "R7", "R8", "R9"]
sources: []
companions: []
after: []
risk: high
refined: false
---

# Plant and watch on the real Herdr

## Description

Replaces the mock behind `SproutApi` with a local server that runs `sprout plant`, finds the agent it started by its directory, and mirrors that agent's Herdr pane into the embedded terminal while sending the user's keys back. `sprout ui` starts the server and opens the screen. The least certain parts, `sprout plant` run by a server process with no TTY and the latency of the mirrored terminal, are proved first, before any screen change.

## Outcome

For a developer with an idea written as text, going from pasted to "an agent is planning on it and I can answer it" takes about 15 seconds on their machine with Herdr running; the signal is a measured run by the user.

## Done when

- On the user's machine, pasting a long markdown and clicking Plant creates the repository and shows the agent's terminal with output in about 15 seconds, measured.
- A reply typed in the embedded terminal reaches the agent and its answer appears.
- The occupied destination, missing Herdr, agent not found in time and closed pane each show a distinct, actionable message, and nothing created is hidden.
- A request without the run's token, or from a foreign origin or host, is refused.
- `sprout ui` runs from the installed `sprout`, typecheck, tests and build are green, the work is committed on its branch, and the user has validated it in real Herdr.

## Boundaries

- Belongs to epic 1: the screen's look and states on simulated data (R3, the screen's part of R10).
- Touch point: `bin/sprout` — `sprout plant` is used as is; the `ui` subcommand is added; owner: this epic
- Touch point: Herdr CLI — `agent list`, `pane read`, `pane send-text`, `pane send-keys`; owner: Herdr
- Must not change: what `sprout plant` creates and prints from the command line.

## References

- parent — `_bmad-output/initiative-sprout-ui/initiative-sprout-ui.md`, Requirements R1, R2, R4–R9 and Constraints C1, C2, C4, C5, C7
- plan — `docs/plans/sprout-ui-reference.md`, Parte B, Fatias 1 a 3 and Segurança

## Notes

- Assumption: `sprout plant` runs correctly with no TTY and stdin closed (proved first).
- Decision: refinement and its tracer bullet are planned when epic 1 is approved; the opening story proves plant-without-TTY and terminal latency before any screen change (2026-11-08).
