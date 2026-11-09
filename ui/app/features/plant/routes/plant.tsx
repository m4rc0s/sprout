import { lazy, Suspense, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import "~/shared/styles/tokens.css";
import "~/shared/styles/app.css";
import { AppShell } from "~/shared/layout/app-shell";
import { ApiProvider } from "~/features/plant/api/api-context";
import { createMockApi, parseScenario } from "~/features/plant/api/mock-api";
import { PlantForm } from "~/features/plant/components/plant-form";
import { PlantLog } from "~/features/plant/components/plant-log";
import { usePlantFlow } from "~/features/plant/lib/use-plant-flow";
import { SproutGlyph } from "~/shared/ui/sprout-glyph";

// O xterm só é carregado quando existe um agente para mostrar.
const TerminalView = lazy(() => import("~/features/terminal/terminal-view"));

export default function PlantRoute() {
  const [params] = useSearchParams();
  const scenario = params.get("cenario");
  const theme = params.get("tema") === "organico" ? "organico" : "hud";
  const api = useMemo(() => createMockApi({ scenario: parseScenario(scenario) }), [scenario]);

  return (
    <ApiProvider value={api}>
      <AppShell theme={theme} notice="Protótipo: os dados são simulados e nada é criado no seu computador.">
        <PlantScreen />
      </AppShell>
    </ApiProvider>
  );
}

/** "Plantar e assistir" nos temas HUD e Orgânico (CSS próprio + tokens). */
function PlantScreen() {
  const { state, plant, reset, transport, busy, showForm, noAgentByChoice } = usePlantFlow();
  const agentHeadingRef = useRef<HTMLHeadingElement>(null);
  const leaveTerminal = useCallback(() => agentHeadingRef.current?.focus(), []);

  return (
    <>
      <section className="panel" aria-labelledby="project-heading">
        <h2 id="project-heading">Projeto</h2>
        {showForm ? (
          <>
            {state.error ? (
              <p role="alert" className="notice-error">
                <span className="log-marker">[erro]</span>
                {state.error}
              </p>
            ) : null}
            <PlantForm disabled={busy} onSubmit={plant} />
          </>
        ) : (
          <div className="stack">
            <p>
              Spec enviada para <code>{state.request?.dest}</code> (agente: {state.request?.agent}).
            </p>
            {!busy ? (
              <button type="button" className="button" onClick={reset}>
                Plantar outro
              </button>
            ) : null}
          </div>
        )}
      </section>

      <section className="panel" aria-labelledby="agent-heading">
        {busy ? <span className="scan" aria-hidden="true" /> : null}
        <h2 id="agent-heading" ref={agentHeadingRef} tabIndex={-1}>
          {state.phase === "running" ? <span className="status-dot" aria-hidden="true" /> : null}
          Agente
        </h2>
        {busy ? <SproutGlyph /> : null}
        {state.phase === "idle" ? (
          <p className="hint">O progresso e o terminal do agente aparecem aqui depois de plantar.</p>
        ) : null}
        {state.log.length > 0 ? <PlantLog entries={state.log} /> : null}
        {state.phase === "no-agent" ? (
          <p role="status">
            {noAgentByChoice
              ? "Projeto criado sem agente, como você escolheu. Abra o projeto no terminal para continuar."
              : "Projeto criado, mas o Herdr não está disponível. Abra o projeto no terminal para continuar."}
          </p>
        ) : null}
        {transport ? (
          <>
            <div className="terminal-frame">
              <Suspense fallback={<p>Abrindo terminal…</p>}>
                <TerminalView transport={transport} onExit={leaveTerminal} />
              </Suspense>
            </div>
            <p className="hint">Ctrl+Shift+Espaço sai do terminal.</p>
          </>
        ) : null}
      </section>
    </>
  );
}
