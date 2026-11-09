import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
// A ordem importa: reset, componentes e tema (camadas do Astryx).
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-neutral/theme.css";

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
  // Tema neutral do Astryx como veio; o modo segue o sistema.
  return (
    <Theme theme={neutralTheme}>
      <Outlet />
    </Theme>
  );
}

/** Exibido pelo modo SPA enquanto o cliente hidrata. */
export function HydrateFallback() {
  return <p>Carregando…</p>;
}
