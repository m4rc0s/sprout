import { createContext, useContext } from "react";
import type { SproutApi } from "./types";

const ApiContext = createContext<SproutApi | null>(null);

export const ApiProvider = ApiContext.Provider;

/** Acesso à API do Sprout (simulada no protótipo, real depois). */
export function useSproutApi(): SproutApi {
  const api = useContext(ApiContext);
  if (!api) throw new Error("useSproutApi precisa estar dentro de <ApiProvider>.");
  return api;
}
