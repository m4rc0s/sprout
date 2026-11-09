import { useRef } from "react";
import { AGENT_OPTIONS, usePlantForm } from "~/features/plant/lib/use-plant-form";
import type { AgentChoice, PlantRequest } from "~/features/plant/api/types";

interface PlantFormProps {
  disabled?: boolean;
  onSubmit: (request: PlantRequest) => void;
}

/** Texto do projeto, destino sugerido, agente e o botão que planta. */
export function PlantForm({ disabled = false, onSubmit }: PlantFormProps) {
  const form = usePlantForm(onSubmit);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = async (event: React.DragEvent<HTMLTextAreaElement>) => {
    const file = event.dataTransfer.files[0];
    if (!file || !/\.(md|markdown|txt)$/i.test(file.name)) return;
    event.preventDefault();
    form.setText(await file.text());
  };

  return (
    <form
      aria-label="Novo projeto"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.submit()) textRef.current?.focus();
      }}
    >
      <div className="stack">
        <label className="label" htmlFor="project-text">Descreva o projeto em markdown</label>
        <textarea
          id="project-text"
          className="field"
          ref={textRef}
          rows={14}
          value={form.text}
          disabled={disabled}
          aria-invalid={form.textMessage ? true : undefined}
          aria-describedby="project-text-hint"
          onChange={(event) => form.setText(event.target.value)}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <small id="project-text-hint" className={form.textMessage ? "field-message" : "hint"}>
          {form.textMessage ? `[erro] ${form.textMessage}` : `${form.text.length} caracteres. Você também pode arrastar um arquivo .md.`}
        </small>

        <label className="label" htmlFor="project-dest">Destino</label>
        <input
          id="project-dest"
          className="field"
          type="text"
          value={form.dest}
          disabled={disabled}
          aria-invalid={form.destMessage ? true : undefined}
          aria-describedby="project-dest-hint"
          onChange={(event) => form.setDest(event.target.value)}
        />
        <small id="project-dest-hint" className={form.destMessage ? "field-message" : "hint"}>
          {form.destMessage ? `[erro] ${form.destMessage}` : "Sugerido a partir do título do texto."}
        </small>

        <label className="label" htmlFor="project-agent">Agente</label>
        <select
          id="project-agent"
          className="field"
          value={form.agent}
          disabled={disabled}
          onChange={(event) => form.setAgent(event.target.value as AgentChoice)}
        >
          {AGENT_OPTIONS.map((option) => (
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
