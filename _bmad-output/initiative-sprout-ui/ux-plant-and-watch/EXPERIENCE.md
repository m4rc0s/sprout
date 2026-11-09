---
name: Sprout
status: draft
sources:
  - ../initiative-sprout-ui.md
updated: 2026-11-08
---

# Sprout, Plantar e assistir — Experience Spine

## Foundation

Local web app, desktop browser first, started with `sprout ui` and served on this machine only. One screen for the MVP, "Plantar e assistir". The UI is a React Router 7 single-page app already scaffolded in `ui/`; it reaches Sprout only through the `SproutApi` interface, so the same screen runs on simulated data (`?cenario=ok|erro|sem-herdr`) or on the real server. The UI system is Astryx as shipped (neutral theme, mode follows the system); `DESIGN.md` records that there is no brand layer, so this spine owns behavior and wording only.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| Plantar e assistir | `sprout ui` opens it; it is the only route | Paste the idea, plant it, watch and talk to the agent |

The screen has a header (name, and a notice line when data is simulated) and two regions:

| Region | Holds | Notes |
|---|---|---|
| **Projeto** (left) | The form, then, after planting, a one-line summary of what was sent and a "Plantar outro" action | The form is replaced by the summary so the user's attention moves right |
| **Agente** (right) | The plant log above the live terminal | Log first, terminal appears when the agent is found |

Every stated need has a place: pasting and choosing (Projeto), seeing progress and failure (Agente log), talking to the agent (Agente terminal). Out of this spine, phase 2: recent projects, session list and actions, handoff and task tabs.

→ The components of each region are listed in `DESIGN.md`. Spine wins on conflict.

## Voice and Tone

Portuguese (pt-BR), short, active, specific. Controls say what happens; errors say what went wrong and what to do next. No apologies, no exclamation marks, no emoji.

| Do | Don't |
|---|---|
| "Descreva o projeto em markdown" | "Digite aqui seu texto incrível" |
| "Plantar" | "Enviar" |
| "Destino sugerido a partir do título do texto." | "Preencha o campo corretamente." |
| "O destino ~/workspace/app já existe e não está vazio. Escolha outro diretório." | "Erro ao criar projeto." |
| "Projeto criado, mas o Herdr não está disponível. Abra o projeto no terminal para continuar." | "Algo deu errado." |
| "Spec enviada para ~/workspace/app (agente: auto)." | "Sucesso!" |

## Component Patterns

Behavioral. Components and their props are in `DESIGN.md` and the Astryx docs.

| Component | Behavior |
|---|---|
| Markdown field (`TextArea`) | Any length. The description shows the character count. `Ctrl+Enter` submits. [ASSUMPTION] Dropping a `.md` file is wanted but not built in the Astryx screen yet. |
| Destination field (`TextInput`) | Suggested from the first `#` title (else the first line), as `~/workspace/<slug>`. Follows the title until the user edits it; after an edit it stays. Validated on submit: empty, relative, `..` and (real server) occupied are refused with a message that names the problem and the fix. |
| Agent select (`Selector`) | `auto`, `claude`, `agy`, `codex`, and `nenhum` (create the repository only). Default `auto`. |
| Plantar button | One primary `Button`. Shows its loading state while planting. Pressing it with an invalid form focuses the first invalid field; nothing is sent. |
| Plant log | Lines appear in the order the steps happen, each with its text marker and a `StatusDot`. Announced politely to assistive technology. |
| Terminal | Shows the agent's output and sends what the user types, including Enter, arrows, Tab, Esc and Ctrl-C. Output follows the agent within about one second. Has a visible exit hint (see Interaction Primitives). |
| Summary (Projeto, after planting) | One line with destination and agent, plus "Plantar outro", shown only when no plant is running. |

## State Patterns

| State | Where | Treatment |
|---|---|---|
| Empty | Projeto and Agente | Form ready; Agente says "O progresso e o terminal do agente aparecem aqui depois de plantar." |
| Planting | Projeto summary, Agente log | Form replaced by the summary; a `Spinner` with "Plantando…" and the log filling line by line |
| Agent starting | Agente | Last log line says the agent was started; "Abrindo terminal…" until the agent is found, with a time limit |
| Live | Agente | Terminal shown under the finished log; a pulsing `StatusDot` marks the running agent |
| Destination occupied | Projeto | Form returns with the error above it naming the destination; the text the user pasted is kept |
| Herdr missing | Agente | Log ends with an `[aviso]` line; message says the project was created and how to continue in a terminal; no terminal is shown |
| Agent not found in time | Agente | Message says the project exists but no agent appeared, with the way to start one; log stays |
| Pane closed | Agente | Terminal replaced by "O agente terminou ou o painel foi fechado." and the way to resume; log stays |
| Unexpected failure | Projeto | The error text from the failing step, shown as is under `[erro]`; the pasted text is kept |

The created project is never hidden: every failure after the repository exists still says where it is.

## Interaction Primitives

**Keyboard first.** The whole flow works without a mouse.

- `Tab` / `Shift+Tab` follow reading order: field, destination, agent, Plantar.
- `Enter` activates buttons; `Ctrl+Enter` inside the markdown field submits.
- Focus is always visible (`DESIGN.md` focus ring).
- **Leaving the terminal.** The terminal receives Tab, Esc and arrows, so it would trap the keyboard. A chord that is not forwarded to the agent leaves it: `Ctrl+Shift+Space`, with the hint "Ctrl+Shift+Espaço sai do terminal" always shown under it. [ASSUMPTION] The architecture must implement this in the terminal component.
- Drag and drop of a file onto the field is an alternative, never the only way.

**Motion.** Only what Astryx components do (the spinner, the pulsing status dot), which respect reduced motion. Readable text never moves or blinks.

**Banned:** celebratory animations, sound, notifications, hover-only affordances, any modal stack deeper than one level.

## Accessibility Floor

Behavioral. Visual contrast is in `DESIGN.md`.

- WCAG 2.2 AA.
- The log is a labeled ordered list with `aria-live="polite"`; the simulated-data notice is a status region.
- Errors are announced and tied to their field (`aria-invalid`, `aria-describedby`); the first invalid field takes focus on a refused submit.
- Level is conveyed by text marker as well as color.
- The terminal has an accessible name, and the keyboard-exit chord is documented on screen.
- Any icon-only control has an accessible name (`aria-label`). The MVP has none yet (every control carries text), and phase 2 icon buttons must follow this.
- Astryx components meet WCAG AA and reduced motion as documented; Sprout adds no animation of its own.

## Responsive & Platform

| Width | Behavior |
|---|---|
| ≥ 1024px | Two columns: Projeto left, Agente right |
| < 1024px | Stacked: Projeto first, then Agente |

Desktop browsers only; the screen is not designed or tested for phones.

## Inspiration & Anti-patterns

- **Lifted:** terminal multiplexers, for the idea that the terminal is the product's heart and the UI frames it.
- **Rejected — ticker of readable text:** the log must be readable, so it never scrolls on its own.
- **Rejected — celebration on success:** planting is the beginning of the work, not an achievement.
- **Rejected — a wizard:** one screen, one action; no steps to click through.

## Key Flows

### Flow 1 — An idea before the coffee cools (Rafael, developer, 9:02am)

1. Rafael has an idea written in his notes app: three paragraphs on a small invoicing tool. He runs `sprout ui`; the browser opens on "Plantar e assistir".
2. He pastes the text into the field. The destination fills itself: `~/workspace/invoicing_tool`. He leaves the agent on `auto`.
3. He presses **Plantar**. The form folds into "Spec enviada para ~/workspace/invoicing_tool (agente: auto)". On the right, log lines land one by one: repository created, spec saved, first commit, workspace opened, agent started.
4. The terminal opens under the log. The agent is already reading his text.
5. **Climax:** the agent prints its plan and asks "Posso seguir com esse plano? (s/n)". Rafael is still looking at the log line that says the agent started. He clicks into the terminal, types `s`, and the agent answers. He never left the screen, and the coffee is still hot.

Failure: the destination already exists. The form comes back with "O destino ~/workspace/invoicing_tool já existe e não está vazio. Escolha outro diretório.", his text intact; he edits the path and plants again.

### Flow 2 — No Herdr (Rafael, same morning, Herdr not running)

1. He pastes and plants as before.
2. The log shows the repository created and then an `[aviso]` line: Herdr was not found.
3. **Climax:** instead of an empty right panel, the screen says the project exists at `~/workspace/invoicing_tool`, and exactly how to open it in a terminal and start the agent. Nothing he pasted is lost.

## Open Items

- [ASSUMPTION] Behaviors added by Sally and still to confirm with the user: `Ctrl+Enter` to submit, `Ctrl+Shift+Space` to leave the terminal, the `nenhum` agent option.
- For architecture: the terminal component implements the exit chord (done in the prototype); the theme's web font is not loaded.
- For the ticket: the "pane closed" and "agent not found in time" states and the `nenhum` agent option are not worded in R5/R8 yet; Sofia should fold them in when the spines are approved.
