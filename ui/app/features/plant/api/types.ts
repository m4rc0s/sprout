/** Agentes que o `sprout plant` aceita em `--agent`. */
/** `nenhum`: cria só o repositório, sem iniciar agente. */
export type AgentChoice = "auto" | "claude" | "agy" | "codex" | "nenhum";

export interface PlantRequest {
  /** Texto markdown com a ideia do projeto (salvo como spec). */
  text: string;
  /** Diretório de destino, absoluto ou iniciando em `~/`. */
  dest: string;
  /** Nome de exibição opcional; padrão: nome do diretório. */
  name?: string;
  agent: AgentChoice;
}

export type LogLevel = "info" | "ok" | "warn" | "error";

/** Eventos emitidos durante o plantio, na ordem em que ocorrem. */
export type PlantEvent =
  | { type: "log"; level: LogLevel; line: string }
  /** `paneId` é null quando o projeto foi criado mas não há agente no Herdr. */
  | { type: "done"; dest: string; paneId: string | null }
  | { type: "error"; message: string };

/** Canal bidirecional com o terminal de um agente. */
export interface TerminalTransport {
  /** Recebe saída (ANSI) do agente. Retorna a função de cancelamento. */
  subscribe(onData: (chunk: string) => void): () => void;
  /** Envia teclas/texto digitados pelo usuário ao agente. */
  send(input: string): void;
}

/**
 * Contrato entre a UI e o Sprout. O protótipo usa a implementação simulada;
 * a versão real (HTTP + WebSocket) implementa a mesma interface.
 */
export interface SproutApi {
  kind: "mock" | "http";
  plant(request: PlantRequest, signal?: AbortSignal): AsyncIterable<PlantEvent>;
  terminal(paneId: string): TerminalTransport;
}

export type {
  AgentSession,
  Workspace,
  Project,
  RecentSession,
} from "./workspace-data";
