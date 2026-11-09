import type { ReactNode } from "react";
import { Wave } from "~/shared/ui/wave";

export type ThemeName = "hud" | "organico";

interface AppShellProps {
  /** Texto de aviso quando os dados são simulados (protótipo). */
  notice?: string;
  /** Tema ativo; só serve para marcar o link atual no seletor do protótipo. */
  theme?: ThemeName;
  children: ReactNode;
}

/** Estrutura da aplicação: cabeçalho, aviso opcional e área principal. */
export function AppShell({ notice, theme = "hud", children }: AppShellProps) {
  return (
    <div>
      <header className="app-header">
        <span className="blob" aria-hidden="true" />
        <h1 className="readout">Sprout</h1>
        {notice ? (
          <p role="status" className="label">
            {notice}
          </p>
        ) : null}
        <nav className="theme-switch" aria-label="Tema do protótipo">
          <a href="?tema=hud" aria-current={theme === "hud" ? "page" : undefined}>
            HUD
          </a>
          <a href="?tema=organico" aria-current={theme === "organico" ? "page" : undefined}>
            Orgânico
          </a>
          <a href="/astryx">Astryx</a>
        </nav>
        <Wave />
      </header>
      <main className="screen">{children}</main>
    </div>
  );
}
