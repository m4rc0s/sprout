import { useRef, useState } from "react";
import { suggestDest, validateDest, type DestIssue } from "~/features/plant/lib/suggest";
import type { AgentChoice, PlantRequest } from "~/features/plant/api/types";

const AGENTS: AgentChoice[] = ["auto", "claude", "agy", "codex"];

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
      <p>
        <label htmlFor="project-text">Descreva o projeto em markdown</label>
        <br />
        <textarea
          id="project-text"
          ref={textRef}
          rows={14}
          cols={60}
          value={text}
          disabled={disabled}
          aria-invalid={submitted && textIssue ? true : undefined}
          aria-describedby="project-text-hint"
          onChange={(event) => setText(event.target.value)}
          onDrop={handleDrop}
        />
        <br />
        <small id="project-text-hint">
          {submitted && textIssue ? textIssue : `${text.length} caracteres. Você também pode arrastar um arquivo .md.`}
        </small>
      </p>

      <p>
        <label htmlFor="project-dest">Destino</label>
        <br />
        <input
          id="project-dest"
          type="text"
          size={50}
          value={dest}
          disabled={disabled}
          aria-invalid={submitted && destIssue ? true : undefined}
          aria-describedby="project-dest-hint"
          onChange={(event) => setDestOverride(event.target.value)}
        />
        <br />
        <small id="project-dest-hint">
          {submitted && destIssue ? DEST_MESSAGES[destIssue] : "Sugerido a partir do título do texto."}
        </small>
      </p>

      <p>
        <label htmlFor="project-agent">Agente</label>
        <br />
        <select
          id="project-agent"
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
      </p>

      <button type="submit" disabled={disabled}>
        Plantar
      </button>
    </form>
  );
}
