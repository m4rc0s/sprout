import { GlobalRegistrator } from "@happy-dom/global-registrator";

/**
 * Registra o DOM do happy-dom nos globais para os testes de componente.
 * Os globais de rede nativos do Bun são restaurados logo depois, para que os
 * testes do servidor (fetch/Request/Response reais) convivam com os de UI.
 */
const nativeNetworkGlobals = {
  fetch: globalThis.fetch,
  Request: globalThis.Request,
  Response: globalThis.Response,
  Headers: globalThis.Headers,
  FormData: globalThis.FormData,
  File: globalThis.File,
  Blob: globalThis.Blob,
  AbortController: globalThis.AbortController,
  AbortSignal: globalThis.AbortSignal,
  WebSocket: globalThis.WebSocket,
} as const;

GlobalRegistrator.register();

for (const [name, implementation] of Object.entries(nativeNetworkGlobals)) {
  Object.defineProperty(globalThis, name, { value: implementation, writable: true, configurable: true });
}
