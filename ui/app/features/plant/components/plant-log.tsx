import type { LogLevel } from "~/features/plant/api/types";

export interface LogEntry {
  level: LogLevel;
  line: string;
}

interface PlantLogProps {
  entries: LogEntry[];
}

const LEVEL_LABEL: Record<LogLevel, string> = {
  info: "info",
  ok: "ok",
  warn: "aviso",
  error: "erro",
};

/** Progresso do plantio, uma linha por passo, anunciado para leitores de tela. */
export function PlantLog({ entries }: PlantLogProps) {
  return (
    <ol className="log" aria-label="Progresso do plantio" aria-live="polite">
      {entries.map((entry, index) => (
        <li key={index} data-level={entry.level}>
          <span className="log-marker">[{LEVEL_LABEL[entry.level]}]</span>
          {entry.line}
        </li>
      ))}
    </ol>
  );
}
