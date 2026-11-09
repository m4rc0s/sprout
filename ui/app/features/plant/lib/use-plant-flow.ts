import { useMemo, useReducer, useRef } from "react";
import { useSproutApi } from "~/features/plant/api/api-context";
import type { LogLevel, PlantRequest } from "~/features/plant/api/types";

export type Phase = "idle" | "planting" | "running" | "no-agent" | "failed";

export interface LogEntry {
  level: LogLevel;
  line: string;
}

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

/** Fluxo "Plantar e assistir": estado, ação de plantar e o canal do terminal. Independe da aparência. */
export function usePlantFlow() {
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

  const transport = useMemo(() => (state.paneId ? api.terminal(state.paneId) : null), [api, state.paneId]);

  return {
    state,
    plant,
    reset: () => dispatch({ type: "reset" }),
    transport,
    busy: state.phase === "planting",
    showForm: state.phase === "idle" || state.phase === "failed",
    noAgentByChoice: state.request?.agent === "nenhum",
  };
}
