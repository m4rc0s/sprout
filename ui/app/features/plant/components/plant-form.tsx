import { useRef, useState } from "react";
import { suggestDest, validateDest, type DestIssue } from "~/features/plant/lib/suggest";
import type { AgentChoice, PlantRequest } from "~/features/plant/api/types";

const AGENTS: AgentChoice[] = ["auto", "claude", "agy", "codex", "nenhum"];

const DEST_MESSAGES: Record<DestIssue, string> = {
  empty: "Informe o diretório de destino.",
  relative: "Use um caminho absoluto ou iniciando em ~/.",
  traversal: "O caminho não pode conter “..”.",
};

interface PlantFormProps {
  disabled?: boolean;
  onSubmit: (request: PlantRequest) => void;
}

/** Texto do projeto, destino sugerido, agente e o botão que planta. */
export function PlantForm({ disabled = false, onSubmit }: PlantFormProps) {
  const [text, setText] = useState("");
  const [destOverride, setDestOverride] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentChoice>("auto");
  const [submitted, setSubmitted] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Derivado na renderização: enquanto o usuário não edita o destino, ele segue o título.
  const dest = destOverride ?? suggestDest(text);
  const textIssue = text.trim() ? null : "Cole ou escreva a ideia do projeto.";
  const destIssue = validateDest(dest);
  const valid = !textIssue && !destIssue;

  const handleDrop = async (event: React.DragEvent<HTMLTextAreaElement>) => {
    const file = event.dataTransfer.files[0];
    if (!file || !/\.(md|markdown|txt)$/i.test(file.name)) return;
    event.preventDefault();
    setText(await file.text());
  };

  return (
    <form
      aria-label="Novo projeto"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (!valid) {
          textRef.current?.focus();
          return;
        }
        onSubmit({ text, dest: dest.trim(), agent });
      }}
    >
      <div className="stack">
        <label className="label" htmlFor="project-text">Descreva o projeto em markdown</label>
        <textarea
          id="project-text"
          className="field"
          ref={textRef}
          rows={14}
          value={text}
          disabled={disabled}
          aria-invalid={submitted && textIssue ? true : undefined}
          aria-describedby="project-text-hint"
          onChange={(event) => setText(event.target.value)}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <small id="project-text-hint" className={submitted && textIssue ? "field-message" : "hint"}>
          {submitted && textIssue ? `[erro] ${textIssue}` : `${text.length} caracteres. Você também pode arrastar um arquivo .md.`}
        </small>

        <label className="label" htmlFor="project-dest">Destino</label>
        <input
          id="project-dest"
          className="field"
          type="text"
          value={dest}
          disabled={disabled}
          aria-invalid={submitted && destIssue ? true : undefined}
          aria-describedby="project-dest-hint"
          onChange={(event) => setDestOverride(event.target.value)}
        />
        <small id="project-dest-hint" className={submitted && destIssue ? "field-message" : "hint"}>
          {submitted && destIssue ? `[erro] ${DEST_MESSAGES[destIssue]}` : "Sugerido a partir do título do texto."}
        </small>

        <label className="label" htmlFor="project-agent">Agente</label>
        <select
          id="project-agent"
          className="field"
          value={agent}
          disabled={disabled}
          onChange={(event) => setAgent(event.target.value as AgentChoice)}
        >
          {AGENTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button type="submit" className="button button--primary" disabled={disabled}>
          Plantar
        </button>
      </div>
    </form>
  );
}
