import type { ReactNode } from "react";

interface AppShellProps {
  /** Texto de aviso quando os dados são simulados (protótipo). */
  notice?: string;
  children: ReactNode;
}

/** Estrutura da aplicação: cabeçalho, aviso opcional e área principal. */
export function AppShell({ notice, children }: AppShellProps) {
  return (
    <div>
      <header>
        <h1>Sprout</h1>
        {notice ? <p role="status">{notice}</p> : null}
      </header>
      <main>{children}</main>
    </div>
  );
}
