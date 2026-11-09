import { useEffect, useRef } from "react";
import type { TerminalTransport } from "~/features/plant/api/types";
import { resolveCssColor } from "~/shared/lib/css-color";
import "@xterm/xterm/css/xterm.css";

interface TerminalViewProps {
  /** Canal com o terminal do agente (simulado ou real). */
  transport: TerminalTransport;
  /** Nome acessível do terminal. */
  label?: string;
  /** Chamado quando o usuário usa Ctrl+Shift+Espaço para sair do terminal (sem encaminhar a tecla ao agente). */
  onExit?: () => void;
}

/**
 * Terminal embutido (xterm). Mostra a saída do agente e envia o que o usuário digita.
 * Carregado sob demanda (`React.lazy`) porque o xterm é pesado.
 */
export default function TerminalView({ transport, label = "Terminal do agente", onExit }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      if (disposed) return;

      const color = (token: string) => resolveCssColor(token);
      const terminal = new Terminal({
        convertEol: true,
        cursorBlink: true,
        rows: 18,
        fontFamily: getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "monospace",
        fontSize: 13,
        theme: {
          background: color("--terminal-bg"),
          foreground: color("--terminal-fg"),
          cursor: color("--color-cyan"),
          black: color("--terminal-ansi-black"),
          red: color("--terminal-ansi-red"),
          green: color("--terminal-ansi-green"),
          yellow: color("--terminal-ansi-yellow"),
          blue: color("--terminal-ansi-blue"),
          magenta: color("--terminal-ansi-magenta"),
          cyan: color("--terminal-ansi-cyan"),
          white: color("--terminal-ansi-white"),
        },
      });
      // Sem uma saída, o terminal prenderia o teclado (Tab e Esc vão para o agente).
      terminal.attachCustomKeyEventHandler((event) => {
        if (event.type === "keydown" && event.ctrlKey && event.shiftKey && event.code === "Space") {
          event.preventDefault();
          terminal.blur();
          onExit?.();
          return false;
        }
        return true;
      });
      const fit = new FitAddon();
      terminal.loadAddon(fit);
      terminal.open(container);
      fit.fit();

      const unsubscribe = transport.subscribe((chunk) => terminal.write(chunk));
      const input = terminal.onData((data) => transport.send(data));
      const onResize = () => fit.fit();
      window.addEventListener("resize", onResize);

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        input.dispose();
        unsubscribe();
        terminal.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [transport, onExit]);

  return <div ref={containerRef} role="region" aria-label={label} />;
}
