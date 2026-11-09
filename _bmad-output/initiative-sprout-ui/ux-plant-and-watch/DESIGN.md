---
name: Sprout
description: Sprout's UI is the Astryx design system exactly as shipped. There is no brand layer: no color, type, spacing or shape is defined by Sprout.
status: final
updated: 2026-11-08
ui-system: Astryx (@astryxdesign/core, @astryxdesign/theme-neutral), mode follows the system
components:
  app-chrome: AppShell with TopNav (TopNavHeading "Sprout") and a Banner in the banner slot
  page-layout: Layout, LayoutContent, Grid (two columns, minWidth 440, gap 6)
  panel: Card (padding 6); terminal frame: Card variant muted (padding 2)
  heading: Heading level 2
  field-text: TextArea (markdown) and TextInput (destination)
  field-choice: Selector (agent)
  action-primary: Button variant primary, size lg, isLoading while planting
  action-secondary: Button variant secondary ("Plantar outro")
  status-level: StatusDot (accent, success, warning, error) beside a text marker
  progress: Spinner
  notice: Banner (info, warning, error), collapsible false
  inline-code: Code
  shortcut-hint: Kbd
---

## Brand & Style

Sprout's identity is Astryx itself, used as it came into the world: the neutral theme, light or dark following the system, components exactly as documented. This is a deliberate choice by the user (2026-11-08), made after the HUD and Organic Biophilic styles were prototyped on the same screen and dropped. Sprout adds nothing on top, so the product looks and behaves like every Astryx product and inherits its accessibility work.

When a visual need is not covered, the answer is a different Astryx component, theme or template, or a gap report (`astryx gap-report`), never a Sprout-owned override.

## Colors

All colors come from the Astryx theme tokens (`--color-background-*`, `--color-text-*`, `--color-border-*`, semantic status colors). Sprout defines none. Status is carried by Astryx's `StatusDot` and `Banner` variants and always paired with a text marker, so color is never the only signal.

The one non-Astryx visual is the terminal (xterm). It reads Astryx tokens at runtime, so it follows theme and mode: background `--color-background-muted`, text `--color-text-primary`, and the ANSI colors from `--color-text-red`, `-green`, `-yellow`, `-blue`, `-purple`, `-cyan` and `-gray`.

## Typography

The theme's own type scale and font stack, through `Heading`, `Text` and `Code`. The terminal uses the system monospace stack. The theme's web font file is not loaded (it fetches from a third party at runtime, and Sprout is a local tool that may run offline), so the theme's fallback stack applies.

## Layout & Spacing

`AppShell` provides the chrome; `Layout` and `Grid` place content. Two columns, **Projeto** and **Agente**, collapse to one column when the width cannot hold 440px per column. Spacing uses the Astryx step scale only (`gap`, `padding` props). The screen is desktop first.

## Elevation & Depth

Inherited from the theme. No elevation is set by Sprout.

## Shapes

Inherited from the theme (radius tokens). The terminal frame is a muted `Card`, so its corners match the other panels.

## Components

The table in the frontmatter maps every screen element to an Astryx component. Behavior is in `EXPERIENCE.md`; component API comes from `astryx component <Name>`, which is the source of truth for props and accessibility.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Compose screens from Astryx components and templates | Write a Sprout stylesheet, `style={}` or `className` to change how Astryx components look |
| Use the component's own props (`variant`, `size`, `status`, `isLoading`) | Reach into `xstyle` or StyleX to restyle a component |
| Change theme or mode only through Astryx's `Theme` | Define colors, fonts, radii or spacing of Sprout's own |
| Read Astryx tokens when something outside Astryx (the terminal) needs a color | Hardcode a hex, rgb or hsl value |
| Pair every status color with a text marker | Rely on color alone |
| Look a component up with the Astryx CLI before using it | Guess props from memory |
| Report a missing capability with `astryx gap-report` | Patch around it locally |
