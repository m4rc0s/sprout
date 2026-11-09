/**
 * Resolve um token CSS (ex.: "--terminal-bg", em OKLCH) para "rgb(r g b)",
 * formato que o xterm aceita. O canvas faz a conversão de espaço de cor.
 */
export function resolveCssColor(token: string, fallback = "rgb(0 0 0)"): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (!raw) return fallback;
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return fallback;
  context.fillStyle = raw;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r} ${g} ${b})`;
}
