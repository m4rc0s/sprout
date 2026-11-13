import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
// Ordem das camadas do Astryx: reset, componentes e, por último, os temas (módulo gerado pelo CLI).
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "../astryx-themes";
import "~/shared/theme/sprout-shell.css";
import { ThemeSettingsProvider } from "~/shared/theme/theme-settings";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sprout</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <ThemeSettingsProvider>
      <Outlet />
    </ThemeSettingsProvider>
  );
}

/** Exibido pelo modo SPA enquanto o cliente hidrata. */
export function HydrateFallback() {
  return <p>Carregando…</p>;
}
