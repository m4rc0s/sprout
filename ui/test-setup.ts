import { afterEach, expect } from "bun:test";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// No happy-dom, Animation.cancel() rejeita a promise finished com AbortError.
// No DOM real do navegador, o cancelamento na desmontagem do componente é tratado.
if (typeof window !== "undefined" && window.Animation) {
  const originalCancel = window.Animation.prototype.cancel;
  window.Animation.prototype.cancel = function () {
    try {
      originalCancel.call(this);
    } catch {
      /* ignore */
    }
    this.finished?.catch(() => {});
  };
}

afterEach(() => {
  cleanup();
});
