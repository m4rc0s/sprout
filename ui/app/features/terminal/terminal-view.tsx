import { useEffect, useRef } from "react";
import type { TerminalTransport } from "~/features/plant/api/types";
import "@xterm/xterm/css/xterm.css";

interface TerminalViewProps {
  /** Canal com o terminal do agente (simulado ou real). */
  transport: TerminalTransport;
  /** Nome acessível do terminal. */
  label?: string;
}

/**
 * Terminal embutido (xterm). Mostra a saída do agente e envia o que o usuário digita.
 * Carregado sob demanda (`React.lazy`) porque o xterm é pesado.
 */
export default function TerminalView({ transport, label = "Terminal do agente" }: TerminalViewProps) {
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

      const terminal = new Terminal({ convertEol: true, cursorBlink: true, rows: 18 });
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
  }, [transport]);

  return <div ref={containerRef} role="region" aria-label={label} />;
}
