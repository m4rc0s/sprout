/**
 * Resolve um token CSS (ex.: "--terminal-bg") para "rgb(r g b)", formato que o xterm aceita.
 * Lê no `scope` dado (padrão: <html>), então tokens definidos num wrapper também valem, e
 * funções como light-dark() são resolvidas pelo navegador no contexto real do elemento.
 * Cores que o navegador devolve fora de rgb (ex.: OKLCH) passam por um canvas para converter.
 */
export function resolveCssColor(
  token: string,
  scope: Element = document.documentElement,
  fallback = "rgb(0 0 0)",
): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  scope.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  if (!computed) return fallback;
  if (computed.startsWith("rgb")) return computed;

  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return fallback;
  context.fillStyle = computed;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r} ${g} ${b})`;
}
