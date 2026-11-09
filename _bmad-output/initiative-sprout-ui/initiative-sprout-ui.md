---
tracker_id: ""
type: initiative
title: "From a pasted idea to a live agent, on one screen"
parent: none
sources: ["docs/plans/sprout-ui-reference.md"]
companions: ["_bmad-output/initiative-sprout-ui/ux-plant-and-watch/DESIGN.md", "_bmad-output/initiative-sprout-ui/ux-plant-and-watch/EXPERIENCE.md"]
after: []
risk: medium
---

# From a pasted idea to a live agent, on one screen

## Description

Sprout is a command-line tool: planting a project means remembering flags, and watching the agent means switching to Herdr. This initiative adds a local web UI, started with `sprout ui`, whose single MVP screen, "Plantar e assistir", takes a long markdown text, plants a project from it, starts an agent in plan mode on that text and shows the agent's terminal beside the plant log, so the user can answer it without leaving the screen. It is built on the unstyled app shell already in `ui/`, which talks to Sprout only through an interface a mock and the real server both implement. Source: the committed plan `docs/plans/sprout-ui-reference.md` and the decisions made in the planning session.

## Outcome

For a developer with an idea written as text, going from "pasted" to "an agent is planning on it, and I can talk to it" takes one screen and about 15 seconds; the signal is a measured run on the user's machine with Herdr running.

## Requirements

- R1 (plan: o momento uau): One command, `sprout ui`, opens the UI on this machine; a visitor without the run's token, or from a foreign origin or host, is refused. Shown by a refusal without the token and another from a foreign origin.
- R2 (plan: o momento uau): The user pastes markdown of any length, picks a destination and gets a new project there with no flags. Shown by the destination holding a git repository with the pasted text saved as the project's spec and an initial commit.
- R3 (plan: Fatia 1): Destination and name are suggested from the text's title and stay editable; an empty, relative, parent-traversing or already-occupied destination is explained in the screen's words before any file is created. Shown by no directory created for each refused destination.
- R4 (plan: Fatia 1): While planting, each step appears as it happens, in order; a failure states what went wrong and how to fix it. Shown by the log matching what `sprout plant` prints, and the occupied-destination case ending with a message that names the destination.
- R5 (plan: o momento uau): After planting with an agent enabled, an agent starts on its own in plan mode on the project's spec; the user can choose auto, claude, agy, codex, or none (repository only, no agent). Shown by the agent appearing in the agent list with the project's directory as its working directory, and by "none" leaving no agent.
- R6 (plan: Fatia 3): The agent's terminal is shown on the same screen as the plant, without leaving it, and follows what the agent prints within about one second. Shown by a line printed by the agent appearing in the embedded terminal within about one second.
- R7 (plan: Fatia 3): The user types in the embedded terminal and the agent receives it, including Enter, arrow keys, Tab, Esc and Ctrl-C. Shown by an answer typed in the UI reaching the agent and the agent replying.
- R8 (plan: Fatia 1 e 3): When Herdr is missing, when the agent is not found in time, or when its pane closes, the screen says what happened and how to continue instead of failing silently, and the created project is never hidden. Shown by each of the three situations producing a distinct message.
- R9 (plan: o momento uau): From clicking Plant to seeing the agent's terminal with output takes about 15 seconds on the user's machine with Herdr running. Shown by a measured run.
- R10 (plan: Etapas BMad, UX): The screen is fully operable by keyboard and its progress is announced to assistive technology; motion respects reduced-motion. Shown by completing plant-and-watch without a mouse, and by no animation under reduced-motion.

## Constraints

- C1 (plan: Arquitetura de alto nível): Every change to Sprout state (create the project, start the agent) goes through the `sprout` CLI; the UI server does not reimplement it. It reads from Herdr, git and `.sprout` files.
- C2 (plan: Segurança): Local only: bound to 127.0.0.1, per-run token, Origin and Host validated, user text never interpolated into a command line, request payloads validated against a schema, destination paths validated.
- C3 (UX decision 2026-11-08): The visual identity is the Astryx design system as shipped (neutral theme, mode follows the system): Sprout defines no color, type, spacing or radius of its own, the screen is built from Astryx components and tokens, never hardcoded colors or Sprout-owned stylesheets, and WCAG AA and reduced motion come from Astryx components.
- C4 (plan: Regras mantidas do catálogo): Performance: independent I/O in parallel, no barrel files, heavy modules (the terminal) loaded on demand, state derived at render, no effect-based syncing.
- C5 (plan: Regras mantidas do catálogo; agent configs of ft_bpo_shell): Git: branch only, never `main`, Conventional Commits in English, tests and typecheck green before each commit, merge only with the user's explicit approval.
- C6 (planning session, shell first): The screen talks to Sprout only through the `SproutApi` interface; the mock (scenarios `ok`, `erro`, `sem-herdr` via `?cenario=`) and the real implementation are interchangeable, and the prototype lives inside the product's structure, not beside it.
- C7 (UX decision 2026-11-08): Stack fixed and only ratified by the architecture spine: Bun, TypeScript, React 19, React Router 7 SPA, Vite, Astryx (core and theme-neutral, StyleX as peer), zod, `bun test`; the terminal is xterm in mirror-plus-keyboard form (`herdr pane read --ansi`, `send-text`, `send-keys`). Tailwind, Radix, shadcn and lucide-react are not used.

## Done when

- On the user's machine with Herdr running, pasting a long markdown and clicking Plant creates the repository and shows the agent's terminal with output in about 15 seconds (R2, R5, R6, R9).
- A reply typed in the embedded terminal reaches the agent and its answer appears (R7).
- The occupied-destination, missing-Herdr and agent-not-found cases each show an actionable message and nothing created is hidden (R3, R4, R8).
- Requests without the token, or from a foreign origin, are refused (R1).
- `DESIGN.md` and `EXPERIENCE.md` are approved and the screen is built only from Astryx components, with no Sprout-owned styling (R10, C3).
- Typecheck, tests and build are green on the branch, and the user has validated the flow in real Herdr.

## Boundaries

Out of this initiative, dated 2026-11-08: recent projects, the session list and its management (resume, new, stop, remove), handoff and task tabs, keyboard shortcuts, the autopilot panel, agent telemetry, config editing, a PTY-based terminal, and remote or multi-user access. Phase 2 picks them up.

- Touch point: `bin/sprout` — `sprout plant` is used as is; a new `sprout ui` subcommand is added; owner: this initiative
- Touch point: Herdr CLI — `agent list`, `pane read`, `pane send-text`, `pane send-keys`; owner: Herdr
- Touch point: `ui/` shell — the page, the `SproutApi` interface and its mock already exist; owner: this initiative
- Must not change: what `sprout plant` creates and prints when run from the command line
- Tracer path: paste text → plant request → project created and agent started → agent found by its directory → terminal output streams in → typed reply reaches the agent.

## References

- plan — `docs/plans/sprout-ui-reference.md`, Parte B (MVP) and Parte A (rules and security)
- design — `_bmad-output/initiative-sprout-ui/ux-plant-and-watch/DESIGN.md` (adopted, run in progress)
- design — `_bmad-output/initiative-sprout-ui/ux-plant-and-watch/EXPERIENCE.md` (adopted, run in progress)
- shell — `ui/` on branch `feat/sprout-ui` (`ui/app/features/plant/api/types.ts` is the `SproutApi` contract)

## Notes

- Assumption: `sprout plant` runs correctly when started by a server process with no TTY and stdin closed; the tracer slice proves it first.
- Assumption: the agent started by `plant` is found by matching the agent list's working directory to the destination.
- Assumption: the 15-second target is measured on the user's machine with Herdr already running and a local destination.
- Decision: the visual identity is Astryx as shipped; the HUD and Organic Biophilic styles were prototyped and dropped (2026-11-08).
- Open question: does `_bmad/` go into git or into `.gitignore`. Waits on: the user.
- Decision: sliced into two epics, prototype first then real, because the prototype is an early-usable part with a distinct outcome the user wants to judge first (2026-11-08).
- Decision: no platform-baseline epic; the app shell was delivered before the initiative (commit `2c53524`, branch `feat/sprout-ui`) (2026-11-08).
- Decision: R10 is shared; epic 1 delivers the form, log and state accessibility, epic 2 delivers keyboard input inside the terminal (R7) (2026-11-08).
- Decision: the shared `SproutApi` contract lives in code (`ui/app/features/plant/api/types.ts`); an architecture spine run is offered but not required to proceed (2026-11-08).
