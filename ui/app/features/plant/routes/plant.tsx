import { lazy, Suspense, useMemo, useReducer, useRef } from "react";
import { useSearchParams } from "react-router";
import { AppShell } from "~/shared/layout/app-shell";
import { ApiProvider, useSproutApi } from "~/features/plant/api/api-context";
import { createMockApi, parseScenario } from "~/features/plant/api/mock-api";
import type { PlantRequest } from "~/features/plant/api/types";
import { PlantForm } from "~/features/plant/components/plant-form";
import { PlantLog, type LogEntry } from "~/features/plant/components/plant-log";

// O xterm só é carregado quando existe um agente para mostrar.
const TerminalView = lazy(() => import("~/features/terminal/terminal-view"));

type Phase = "idle" | "planting" | "running" | "no-agent" | "failed";

interface State {
  phase: Phase;
  log: LogEntry[];
  request: PlantRequest | null;
  paneId: string | null;
  error: string | null;
}

type Action =
  | { type: "start"; request: PlantRequest }
  | { type: "log"; entry: LogEntry }
  | { type: "done"; paneId: string | null }
  | { type: "fail"; message: string }
  | { type: "reset" };

const initial: State = { phase: "idle", log: [], request: null, paneId: null, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...initial, phase: "planting", request: action.request };
    case "log":
      return { ...state, log: [...state.log, action.entry] };
    case "done":
      return { ...state, phase: action.paneId ? "running" : "no-agent", paneId: action.paneId };
    case "fail":
      return { ...state, phase: "failed", error: action.message };
    case "reset":
      return initial;
  }
}

export default function PlantRoute() {
  const [params] = useSearchParams();
  const scenario = params.get("cenario");
  const api = useMemo(() => createMockApi({ scenario: parseScenario(scenario) }), [scenario]);

  return (
    <ApiProvider value={api}>
      <AppShell notice="Protótipo: os dados são simulados e nada é criado no seu computador.">
        <PlantScreen />
      </AppShell>
    </ApiProvider>
  );
}

/** "Plantar e assistir": cole a ideia, plante e acompanhe o agente na mesma tela. */
function PlantScreen() {
  const api = useSproutApi();
  const [state, dispatch] = useReducer(reducer, initial);
  const abortRef = useRef<AbortController | null>(null);

  const plant = async (request: PlantRequest) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: "start", request });

    try {
      for await (const event of api.plant(request, controller.signal)) {
        if (controller.signal.aborted) return;
        if (event.type === "log") dispatch({ type: "log", entry: { level: event.level, line: event.line } });
        else if (event.type === "done") dispatch({ type: "done", paneId: event.paneId });
        else dispatch({ type: "fail", message: event.message });
      }
    } catch (error) {
      dispatch({ type: "fail", message: error instanceof Error ? error.message : "Falha inesperada ao plantar." });
    }
  };

  const transport = useMemo(
    () => (state.paneId ? api.terminal(state.paneId) : null),
    [api, state.paneId],
  );

  const busy = state.phase === "planting";
  const showForm = state.phase === "idle" || state.phase === "failed";

  return (
    <>
      <section aria-labelledby="project-heading">
        <h2 id="project-heading">Projeto</h2>
        {showForm ? (
          <>
            {state.error ? <p role="alert">{state.error}</p> : null}
            <PlantForm disabled={busy} onSubmit={plant} />
          </>
        ) : (
          <>
            <p>
              Spec enviada para <code>{state.request?.dest}</code> (agente: {state.request?.agent}).
            </p>
            {!busy ? (
              <button type="button" onClick={() => dispatch({ type: "reset" })}>
                Plantar outro
              </button>
            ) : null}
          </>
        )}
      </section>

      <section aria-labelledby="agent-heading">
        <h2 id="agent-heading">Agente</h2>
        {state.phase === "idle" ? <p>O progresso e o terminal do agente aparecem aqui depois de plantar.</p> : null}
        {state.log.length > 0 ? <PlantLog entries={state.log} /> : null}
        {state.phase === "no-agent" ? (
          <p role="status">Projeto criado, mas o Herdr não está disponível. Abra o projeto no terminal para continuar.</p>
        ) : null}
        {transport ? (
          <Suspense fallback={<p>Abrindo terminal…</p>}>
            <TerminalView transport={transport} />
          </Suspense>
        ) : null}
      </section>
    </>
  );
}
