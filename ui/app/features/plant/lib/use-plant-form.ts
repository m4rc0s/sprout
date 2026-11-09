import { useState } from "react";
import { suggestDest, validateDest, type DestIssue } from "./suggest";
import type { AgentChoice, PlantRequest } from "~/features/plant/api/types";

export const AGENT_OPTIONS: AgentChoice[] = ["auto", "claude", "agy", "codex", "nenhum"];

export const DEST_MESSAGES: Record<DestIssue, string> = {
  empty: "Informe o diretório de destino.",
  relative: "Use um caminho absoluto ou iniciando em ~/.",
  traversal: "O caminho não pode conter “..”.",
};

/** Estado e validação do formulário de plantio, compartilhado por todas as telas. */
export function usePlantForm(onSubmit: (request: PlantRequest) => void) {
  const [text, setText] = useState("");
  const [destOverride, setDestOverride] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentChoice>("auto");
  const [submitted, setSubmitted] = useState(false);

  // Derivado na renderização: enquanto o usuário não edita o destino, ele segue o título.
  const dest = destOverride ?? suggestDest(text);
  const textIssue = text.trim() ? null : "Cole ou escreva a ideia do projeto.";
  const destIssue = validateDest(dest);
  const valid = !textIssue && !destIssue;

  /** Tenta enviar; devolve false quando a validação recusa (o chamador cuida do foco). */
  const submit = (): boolean => {
    setSubmitted(true);
    if (!valid) return false;
    onSubmit({ text, dest: dest.trim(), agent });
    return true;
  };

  return {
    text,
    setText,
    dest,
    setDest: setDestOverride,
    agent,
    setAgent,
    submitted,
    textMessage: submitted ? textIssue : null,
    destMessage: submitted && destIssue ? DEST_MESSAGES[destIssue] : null,
    submit,
  };
}
