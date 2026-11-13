import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { defaultThemeSlug, themes, type ThemeSlug } from "../../../astryx-themes";

export type { ThemeSlug } from "../../../astryx-themes";

export type ThemeMode = "system" | "light" | "dark";

/** Temas do Astryx que só existem escuros (README do theme-gothic: "single-mode theme"). */
const DARK_ONLY: ReadonlySet<ThemeSlug> = new Set<ThemeSlug>(["gothic"]);

const THEME_KEY = "sprout.ui.theme";
const MODE_KEY = "sprout.ui.mode";

export const THEME_SLUGS = Object.keys(themes) as ThemeSlug[];

export function isThemeSlug(value: string | null | undefined): value is ThemeSlug {
  return !!value && value in themes;
}

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function isDarkOnly(slug: ThemeSlug): boolean {
  return DARK_ONLY.has(slug);
}

/** Modo que o Astryx realmente recebe: um tema só escuro ignora a escolha do usuário. */
export function effectiveModeFor(slug: ThemeSlug, mode: ThemeMode): ThemeMode {
  return isDarkOnly(slug) ? "dark" : mode;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // modo privado ou armazenamento bloqueado
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* conveniência por visitante: segue sem persistir */
  }
}

/** Ordem: URL (?tema=, ?modo=) depois armazenamento local, senão o padrão do Astryx. */
export function readInitialSettings(search: string): { slug: ThemeSlug; mode: ThemeMode } {
  const params = new URLSearchParams(search);
  const urlSlug = params.get("tema");
  const urlMode = params.get("modo");
  const storedSlug = readStorage(THEME_KEY);
  const storedMode = readStorage(MODE_KEY);
  return {
    slug: isThemeSlug(urlSlug) ? urlSlug : isThemeSlug(storedSlug) ? storedSlug : defaultThemeSlug,
    mode: isThemeMode(urlMode) ? urlMode : isThemeMode(storedMode) ? storedMode : "dark",
  };
}

interface ThemeSettings {
  slug: ThemeSlug;
  /** Escolha do usuário (pode ser ignorada por um tema só escuro). */
  mode: ThemeMode;
  /** Modo aplicado de fato. */
  effectiveMode: ThemeMode;
  setSlug: (slug: ThemeSlug) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeSettingsContext = createContext<ThemeSettings | null>(null);

/** Aplica o tema escolhido com o `Theme` do Astryx e expõe a escolha para o seletor. */
export function ThemeSettingsProvider({ children, search }: { children: ReactNode; search?: string }) {
  const [state, setState] = useState(() =>
    readInitialSettings(search ?? (typeof window === "undefined" ? "" : window.location.search)),
  );

  const setSlug = useCallback((slug: ThemeSlug) => {
    writeStorage(THEME_KEY, slug);
    setState((current) => ({ ...current, slug }));
  }, []);
  const setMode = useCallback((mode: ThemeMode) => {
    writeStorage(MODE_KEY, mode);
    setState((current) => ({ ...current, mode }));
  }, []);

  const effectiveMode = effectiveModeFor(state.slug, state.mode);
  const value = useMemo<ThemeSettings>(
    () => ({ slug: state.slug, mode: state.mode, effectiveMode, setSlug, setMode }),
    [state.slug, state.mode, effectiveMode, setSlug, setMode],
  );

  return (
    <ThemeSettingsContext.Provider value={value}>
      <Theme theme={themes[state.slug]} mode={effectiveMode}>
        {children}
      </Theme>
    </ThemeSettingsContext.Provider>
  );
}

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  slug: defaultThemeSlug,
  mode: "dark",
  effectiveMode: "dark",
  setSlug: () => {},
  setMode: () => {},
};

export function useThemeSettings(): ThemeSettings {
  const context = useContext(ThemeSettingsContext);
  return context ?? DEFAULT_THEME_SETTINGS;
}
