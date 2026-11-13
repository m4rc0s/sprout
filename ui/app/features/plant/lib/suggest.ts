const STOP_WORDS = new Set([
  "de", "do", "da", "dos", "das", "no", "na", "nos", "nas", "em", "para", "com", "por",
  "the", "a", "an", "of", "in", "on", "for", "with", "to", "and", "e",
]);

const MAX_SLUG_LENGTH = 32;

/** Primeiro título markdown (`# ...`) ou, na falta, a primeira linha não vazia. */
export function extractTitle(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const heading = lines.find((l) => l.startsWith("# "));
  const first = heading ? heading.slice(2) : lines.find((l) => l.length > 0) ?? "";
  return first.trim().slice(0, 60);
}

/** Slug em snake_case, ASCII, até 32 caracteres, sem palavras de ligação no fim. */
export function slugify(title: string): string {
  const words = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean);

  const picked: string[] = [];
  let length = 0;
  for (const word of words) {
    const added = word.length + (picked.length > 0 ? 1 : 0);
    if (length + added > MAX_SLUG_LENGTH && picked.length > 0) break;
    picked.push(word);
    length += added;
  }
  while (picked.length > 1 && STOP_WORDS.has(picked[picked.length - 1]!)) picked.pop();
  return picked.join("_");
}

/** Destino sugerido a partir do texto, ou string vazia se não houver título. */
export function suggestDest(text: string, base = "~/workspace"): string {
  const slug = slugify(extractTitle(text));
  return slug ? `${base}/${slug}` : "";
}

export type DestIssue = "empty" | "relative" | "traversal";

/** Valida o destino no cliente; o servidor repete a validação. */
export function validateDest(dest: string): DestIssue | null {
  const value = dest.trim();
  if (!value) return "empty";
  if (value.split("/").includes("..")) return "traversal";
  if (!value.startsWith("/") && !value.startsWith("~/")) return "relative";
  return null;
}
