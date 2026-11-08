import type {
  PlantEvent,
  PlantRequest,
  SproutApi,
  TerminalTransport,
} from "./types";

/** Cenários do protótipo, escolhidos por `?cenario=` na URL. */
export type MockScenario = "ok" | "erro" | "sem-herdr";

export interface MockOptions {
  scenario?: MockScenario;
  /** Pausa entre eventos, em ms. 0 nos testes. */
  delayMs?: number;
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (ms <= 0) return resolve();
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });

export function parseScenario(value: string | null): MockScenario {
  return value === "erro" || value === "sem-herdr" ? value : "ok";
}

/** Passos que o `sprout plant` imprime de verdade, em ordem. */
function plantSteps(request: PlantRequest): PlantEvent[] {
  const name = request.name?.trim() || request.dest.split("/").filter(Boolean).pop() || "projeto";
  return [
    { type: "log", level: "info", line: `Plantando ${name} em ${request.dest}` },
    { type: "log", level: "ok", line: "Git Init: repositório criado na branch main" },
    { type: "log", level: "ok", line: "Spec Ingest: salva em .sprout/spec.md" },
    { type: "log", level: "ok", line: "Created: README.md" },
    { type: "log", level: "ok", line: "Config: configuração do Sprout criada" },
    { type: "log", level: "ok", line: "Initial Commit: criado na branch main" },
  ];
}

export function createMockApi(options: MockOptions = {}): SproutApi {
  const scenario = options.scenario ?? "ok";
  const delayMs = options.delayMs ?? 450;

  return {
    kind: "mock",

    async *plant(request, signal) {
      const steps = plantSteps(request);
      const [first, ...rest] = steps;
      yield first!;
      await wait(delayMs, signal);

      if (scenario === "erro") {
        yield {
          type: "error",
          message: `O destino ${request.dest} já existe e não está vazio. Escolha outro diretório.`,
        };
        return;
      }

      for (const step of rest) {
        if (signal?.aborted) return;
        yield step;
        await wait(delayMs, signal);
      }

      if (scenario === "sem-herdr") {
        yield {
          type: "log",
          level: "warn",
          line: "Herdr não encontrado: o projeto foi criado, mas nenhum agente foi iniciado.",
        };
        yield { type: "done", dest: request.dest, paneId: null };
        return;
      }

      yield { type: "log", level: "ok", line: "Herdr: workspace criado" };
      await wait(delayMs, signal);
      yield { type: "log", level: "ok", line: `Agente ${request.agent === "auto" ? "claude" : request.agent} iniciado em plan mode` };
      await wait(delayMs, signal);
      yield { type: "done", dest: request.dest, paneId: "mock:p1" };
    },

    terminal(): TerminalTransport {
      return createMockTerminal(delayMs);
    },
  };
}

const ESC = "\u001b";
const dim = (s: string) => `${ESC}[2m${s}${ESC}[0m`;
const bold = (s: string) => `${ESC}[1m${s}${ESC}[0m`;

/** Agente simulado: lê a spec, propõe um plano e responde ao que o usuário digitar. */
function createMockTerminal(delayMs: number): TerminalTransport {
  const listeners = new Set<(chunk: string) => void>();
  let typed = "";
  let started = false;

  const emit = (chunk: string) => listeners.forEach((l) => l(chunk));
  const emitLines = async (lines: string[]) => {
    for (const line of lines) {
      emit(`${line}\r\n`);
      await wait(delayMs / 2);
    }
  };

  const boot = async () => {
    await emitLines([
      bold("Agente em plan mode"),
      dim("Lendo .sprout/spec.md…"),
      "",
      "Resumo do que entendi:",
      "  - projeto novo, sem código ainda",
      "  - primeira entrega: fluxo principal ponta a ponta",
      "",
      "Plano proposto:",
      "  1. Modelar as entidades principais",
      "  2. Esqueleto do app e rotas",
      "  3. Primeira tela com dados simulados",
      "",
    ]);
    emit("Posso seguir com esse plano? (s/n) ");
  };

  return {
    subscribe(onData) {
      listeners.add(onData);
      if (!started) {
        started = true;
        void boot();
      }
      return () => listeners.delete(onData);
    },

    send(input) {
      for (const char of input) {
        if (char === "\r") {
          const answer = typed.trim().toLowerCase();
          typed = "";
          emit("\r\n");
          void emitLines(
            answer.startsWith("s")
              ? ["Combinado. Começando pelo passo 1 (simulação).", ""]
              : ["Tudo bem. O que você quer mudar no plano? (simulação)", ""],
          );
        } else if (char === "\u007f") {
          if (typed.length > 0) {
            typed = typed.slice(0, -1);
            emit("\b \b");
          }
        } else if (char >= " ") {
          typed += char;
          emit(char);
        }
      }
    },
  };
}
