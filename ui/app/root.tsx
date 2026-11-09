import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "~/shared/styles/tokens.css";
import "~/shared/styles/hud.css";
import "~/tailwind.css";

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
  return <Outlet />;
}

/** Exibido pelo modo SPA enquanto o cliente hidrata. */
export function HydrateFallback() {
  return <p>Carregando…</p>;
}
