---
name: Sprout
description: Sprout's UI is an Agentic Workspace Shell inspired by Perplexity.ai, built exclusively on the Astryx design system as shipped, supporting logged-in home, open agents, and multi-workspace projects.
status: final
updated: 2026-11-09
ui-system: Astryx (@astryxdesign/core, official themes), mode selectable (system, light, dark)
components:
  app-chrome: AppShell with SideNav (collapsible, "+ Novo", Agentes Abertos, Projetos multinível com múltiplos Workspaces, Recentes, Perfil do Usuário), TopNav with ThemePicker and breadcrumb, and Banner in the banner slot
  zero-state-layout: Center, VStack (maxWidth 780), Card (padding 6)
  execution-layout: VStack, Card variant muted (summary header), Grid (two columns: Progress Ledger and Sandbox Terminal, minWidth 440, gap 6)
  agent-terminal-layout: VStack, Card variant muted (agent status bar), Card (terminal frame, padding 4)
  panel: Card (padding 6); terminal frame: Card variant muted (padding 2)
  heading: Heading level 1 (landing hero) and level 2 (panels)
  field-text: TextArea (markdown) and TextInput (destination)
  field-choice: Selector (agent)
  action-primary: Button variant primary, size lg, isLoading while planting
  action-secondary: Button variant secondary ("Plantar outro", "Voltar ao Composer")
  status-level: StatusDot (accent, success, warning, error) beside a text marker
  progress: Spinner
  notice: Banner (info, warning, error), collapsible false
  inline-code: Code
  shortcut-hint: Kbd
  profile: Avatar, Badge
---

## Brand & Style

Sprout's identity is Astryx itself, adopting the **Agentic Workspace Shell** pattern (inspired by Perplexity.ai): a persistent collapsible rail on the left, an unencumbered central workspace, and a dynamic three-view lifecycle:
1. **Home Logada Composer (Zero-State):** A clean, centered, focused prompt area with embedded contextual parameters (destination directory and agent choice), with active project and workspace context.
2. **Active Agentic Execution Split:** A top summary card, an orderly progress ledger on the left, and a live interactive sandbox terminal (xterm) on the right during plant operations.
3. **Agent Terminal Inspection View:** Instant access to any open agent running in Herdr from the left sidebar, displaying its live interactive xterm session without disturbing other workspaces.

There is no custom brand stylesheet: all layout and visual hierarchy is composed directly from Astryx components, themes, and tokens.

## Colors

All colors come from Astryx theme tokens (`--color-background-*`, `--color-text-*`, `--color-border-*`, semantic status colors). The user can switch between official themes (`neutral`, `butter`, `chocolate`, `gothic`, `matcha`, `stone`, `y2k`) and modes (`system`, `light`, `dark`) using `ThemePicker`.

The terminal (xterm) dynamically resolves Astryx tokens at runtime to match the active theme: background `--color-background-muted`, text `--color-text-primary`, and the ANSI colors from `--color-text-red`, `-green`, `-yellow`, `-blue`, `-purple`, `-cyan` and `-gray`.

## Typography

Theme-defined font stack via `Heading`, `Text` and `Code`. The terminal uses the system monospace stack.

## Layout & Spacing

`AppShell` provides the application shell with:
- `sideNav`: Astryx `SideNav` (collapsible and resizable) carrying the application brand (`SideNavHeading`), primary action (`Button` "+ Novo"), open agent sessions with live status dots, hierarchical project tree (projects containing multiple workspaces), recent session history, and user profile (`Avatar` Marcos Araujo).
- `topNav`: Astryx `TopNav` carrying active project/workspace breadcrumbs and `ThemePicker` on the trailing end.
- `banner`: Top-level system notices (e.g. simulated prototype notification).
- `content`: Adaptive content area hosting the Composer, the Execution Split Canvas, or the Agent Terminal View.

Spacing uses the Astryx step scale (`gap`, `padding` props). The interface is desktop-first and collapses gracefully.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Compose screens from Astryx components and templates | Write a Sprout stylesheet, `style={}` or `className` to change how Astryx components look |
| Use the component's own props (`variant`, `size`, `status`, `isLoading`) | Reach into `xstyle` or StyleX to restyle a component |
| Change theme or mode only through Astryx's `Theme` | Define colors, fonts, radii or spacing of Sprout's own |
| Read Astryx tokens when something outside Astryx (the terminal) needs a color | Hardcode a hex, rgb or hsl value |
| Pair every status color with a text marker | Rely on color alone |
