---
name: Sprout
description: Local web UI for planting a project from pasted text and watching its agent work. A HUD / sci-fi FUI identity, dark only, adapted so the long markdown field and the log stay readable.
status: draft
updated: 2026-11-08
colors:
  # Source of truth: the palette the user pasted. Hex is only the spec's format;
  # tokens.css defines the OKLCH equivalents and components never hardcode a color.
  bg: '#0A0F1C'
  cyan: '#00FFFF'
  blue: '#0080FF'
  alert: '#FF0000'
  ok: '#00FF00'
  danger-text: '#FF4D4D'
  # [ASSUMPTION] Everything below is derived by Sally, not given by the user.
  surface: '#0A1B27'           # bg with 5% cyan: panel fill
  line: '#00FFFF80'            # cyan at 50%: borders of fields and buttons (4.4:1, passes 3:1)
  line-soft: '#00FFFF4D'       # cyan at 30%: decorative panel edges only (2.3:1, never a control boundary)
  grid: '#00FFFF0A'            # cyan at 4%: page grid, decorative
  text: '#E6EEF7'              # near-white with a cool tint: long text, field content
  text-muted: '#00FFFFB3'      # cyan at 70%: labels and hints (7.4:1)
  terminal-bg: '#0A0F1C'
  terminal-fg: '#E6EEF7'
typography:
  # One family everywhere, as in the user's brief. Bundled locally if the architecture allows; fallback ui-monospace.
  display:
    fontFamily: 'JetBrains Mono'
    fontSize: 30px
    fontWeight: '500'
    lineHeight: '1.2'
  title:
    fontFamily: 'JetBrains Mono'
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.3'
  body:
    fontFamily: 'JetBrains Mono'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: 'JetBrains Mono'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.1em
  terminal:
    fontFamily: 'JetBrains Mono'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  # Wireframe look: no rounding. Only the status dot is a circle.
  none: 0px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '6': 24px
  '8': 32px
  panel-padding: 24px
  grid-cell: 50px
components:
  panel:
    background: '{colors.surface}'
    border: '1px solid {colors.line-soft}'
    radius: '{rounded.none}'
    padding: '{spacing.panel-padding}'
  field:
    background: 'transparent'
    foreground: '{colors.text}'
    border: '1px solid {colors.line}'
    radius: '{rounded.none}'
  field-label:
    foreground: '{colors.text-muted}'
    typography: '{typography.label}'
  button-primary:
    background: '{colors.cyan}'
    foreground: '{colors.bg}'
    border: '1px solid {colors.cyan}'
    radius: '{rounded.none}'
  button-secondary:
    background: 'transparent'
    foreground: '{colors.cyan}'
    border: '1px solid {colors.line}'
    radius: '{rounded.none}'
  button-danger:
    background: 'transparent'
    foreground: '{colors.danger-text}'
    border: '1px solid {colors.alert}'
    radius: '{rounded.none}'
  status-dot:
    background: '{colors.cyan}'
    radius: '{rounded.full}'
  log-line:
    foreground: '{colors.text}'
    typography: '{typography.body}'
  terminal:
    background: '{colors.terminal-bg}'
    foreground: '{colors.terminal-fg}'
    border: '1px solid {colors.line}'
    typography: '{typography.terminal}'
---

## Brand & Style

Sprout looks like the instrument panel of a small ship: thin cyan lines on a deep navy field, technical, a little cinematic, quiet until something happens. The style comes from movie FUI (fantasy user interfaces) and is the identity the user chose to explore; this spine adapts it to a tool where people write long text and read logs.

The rule that does the adapting: **neon is for chrome and state, never for reading.** Borders, labels, focus, the primary action and status carry the glow and the cyan; anything the user reads for more than a line (the markdown field, the log, the terminal) is set in a calm near-white. Boldness is spent in one place, the moment the agent comes alive, so the rest stays still.

[ASSUMPTION] HUD is the identity, not just a reference; dark only; the style's own warning against reading-heavy content is handled by the rule above. To confirm with the user.

## Colors

- **Cyan `{colors.cyan}`** is the one brand color: primary action fill, borders, focus ring, labels, the status dot. Contrast on `{colors.bg}` is 15.3:1.
- **Blue `{colors.blue}`** is secondary: the `[aviso]` level and quiet emphasis. Text contrast 5.0:1 (4.6:1 on `{colors.surface}`), so only at body size or larger.
- **Alert `{colors.alert}`** is for borders and icons of errors and destructive actions. As text it only just passes (4.8:1); error text uses `{colors.danger-text}` (5.9:1).
- **Ok `{colors.ok}`** is the semantic "worked" and "growth" color: `[ok]` lines, success states, the sprout glyph. It is not a second brand color. [ASSUMPTION] To confirm.
- **Text `{colors.text}`** is the reading color for the field, log and terminal. [ASSUMPTION] Derived: the user's palette has no neutral.
- **Lines.** `{colors.line}` (cyan 50%, 4.4:1) outlines every control. `{colors.line-soft}` (cyan 30%, 2.3:1) is only for decorative panel edges and corner brackets, because a control boundary needs 3:1. `{colors.grid}` is the page grid and is decorative.

Level markers never rely on color alone: every log line starts with a text marker (`[info]`, `[ok]`, `[aviso]`, `[erro]`). The palette has no amber, so `[aviso]` uses blue plus its marker. [ASSUMPTION]

Avoid: more than one brand color, gradients, glow on running text, red text on the navy field.

## Typography

One monospace family, JetBrains Mono, as in the user's brief, with `ui-monospace` as the fallback. Whether the font is bundled or only named is an architecture call (the app may run offline).

- **Display `{typography.display}`** only for single readouts and the page title; the only place text glow is allowed.
- **Body `{typography.body}`** for the markdown field and the log, at line-height 1.6 so long text stays readable.
- **Label `{typography.label}`**: uppercase, wide tracking, `{colors.text-muted}`.
- **Terminal `{typography.terminal}`** inside the embedded terminal.

## Layout & Spacing

Spacing follows a 4-based scale (`{spacing.1}` to `{spacing.8}`); panels pad `{spacing.panel-padding}`. A 50px grid at 4% cyan sits behind the page. Two panels side by side from 1024px up: **Projeto** on the left (about 5/12) and **Agente** on the right (about 7/12, log above terminal). Below 1024px they stack, Projeto first. The screen is desktop first; phones are not a target.

## Elevation & Depth

No shadows and no blur. Depth comes from line weight and glow: the primary button glows on hover (`0 0 16px` cyan at 60%) and display readouts carry a faint text glow. Nothing else glows. No `backdrop-filter`.

## Shapes

Square corners everywhere (`{rounded.none}`); the wireframe look depends on it. Each panel gets exactly one pair of corner brackets (top-left and bottom-right, 16px, `{colors.cyan}`); never stack extra corner decoration. The status dot is the only circle.

## Components

- **Panel.** `{colors.surface}` fill, `{colors.line-soft}` hairline, one pair of corner brackets, a label row on top.
- **Field** (input, textarea, select). Transparent fill, `{colors.line}` border, `{colors.text}` content. Focus: 2px `{colors.cyan}` outline with 4px offset, always visible. Error: border `{colors.alert}` and a message in `{colors.danger-text}` with the `[erro]` marker. The markdown textarea uses body type at line-height 1.6 with no glow. [ASSUMPTION]
- **Button primary.** `{colors.cyan}` fill, `{colors.bg}` text (15.3:1), uppercase, glow on hover and focus. One per view: **Plantar**.
- **Button secondary.** Transparent, `{colors.line}` border, cyan text.
- **Button danger.** Transparent, `{colors.alert}` border, `{colors.danger-text}` text. Not used in the MVP; defined for phase 2 (remove).
- **Status dot.** Cyan circle with a glow that blinks slowly (opacity 1 to 0.4, 2s) while the agent runs; static under reduced motion.
- **Log.** An ordered list in body type; each line has its text marker and a level color on the marker only. Lines append; the log never scrolls by itself while the user is reading above.
- **Terminal.** `{colors.terminal-bg}` with a `{colors.line}` border; its ANSI palette is built from the tokens (cyan, blue, alert, ok and `{colors.text}`) so agent output keeps contrast.
- **Scan line (planting only).** A 1px cyan line sweeping the Agente panel top to bottom, `aria-hidden`, decorative.
- **Sprout glyph (planting only).** A single SVG path (`lucide` style, drawn with `pathLength="1"`) drawing itself in 2s, in `{colors.ok}`. Icons are `lucide-react` only; no emoji anywhere.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Put neon (glow, cyan) on chrome, borders, focus, primary action and state | Put glow or cyan on text people read for more than a line |
| Keep field and button borders at `{colors.line}` (≥3:1) | Use `{colors.line-soft}` as the boundary of a control |
| Start every log line with its text marker | Let color alone say ok, warning or error |
| Use `{colors.danger-text}` for error text | Use `{colors.alert}` as text on `{colors.bg}` |
| One corner-bracket pair per panel | Stack extra corner decoration |
| Blink only the status dot | Blink, scroll or animate readable text |
| Turn every animation off under `prefers-reduced-motion` | Add a ticker or any scrolling text |
| Define colors only in `tokens.css` (OKLCH) | Hardcode a hex, rgb or hsl value in a component |
| Use `lucide-react` icons | Use emoji or other icon sets |
