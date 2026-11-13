import { describe, expect, test } from "bun:test";
import { createMockApi, parseScenario } from "./mock-api";
import type { PlantEvent, PlantRequest } from "./types";

const request: PlantRequest = { text: "# App", dest: "~/workspace/app", agent: "auto" };

async function collect(iterable: AsyncIterable<PlantEvent>): Promise<PlantEvent[]> {
  const events: PlantEvent[] = [];
  for await (const event of iterable) events.push(event);
  return events;
}

describe("createMockApi.plant", () => {
  test("cenário ok termina com um pane de agente", async () => {
    const events = await collect(createMockApi({ delayMs: 0 }).plant(request));
    const last = events.at(-1);
    expect(last).toEqual({ type: "done", dest: request.dest, paneId: "mock:p1" });
    expect(events.some((e) => e.type === "log" && e.line.includes("Initial Commit"))).toBe(true);
  });

  test("cenário erro falha com mensagem sobre o destino", async () => {
    const events = await collect(createMockApi({ scenario: "erro", delayMs: 0 }).plant(request));
    const last = events.at(-1);
    expect(last?.type).toBe("error");
    expect(last?.type === "error" && last.message).toContain(request.dest);
  });

  test("cenário sem-herdr cria o projeto mas devolve paneId nulo", async () => {
    const events = await collect(createMockApi({ scenario: "sem-herdr", delayMs: 0 }).plant(request));
    expect(events.at(-1)).toEqual({ type: "done", dest: request.dest, paneId: null });
    expect(events.some((e) => e.type === "log" && e.level === "warn")).toBe(true);
  });

  test("agente nenhum cria o projeto e não devolve pane", async () => {
    const events = await collect(createMockApi({ delayMs: 0 }).plant({ ...request, agent: "nenhum" }));
    expect(events.at(-1)).toEqual({ type: "done", dest: request.dest, paneId: null });
    expect(events.some((e) => e.type === "log" && e.line.includes("nenhum"))).toBe(true);
  });

  test("abortar interrompe a emissão de passos", async () => {
    const controller = new AbortController();
    controller.abort();
    const events = await collect(createMockApi({ delayMs: 0 }).plant(request, controller.signal));
    expect(events.length).toBeLessThanOrEqual(1);
  });
});

describe("createMockApi.terminal", () => {
  test("ecoa o que é digitado e responde ao Enter", async () => {
    const transport = createMockApi({ delayMs: 0 }).terminal("mock:p1");
    const chunks: string[] = [];
    const stop = transport.subscribe((c) => chunks.push(c));
    await new Promise((r) => setTimeout(r, 20));
    transport.send("s");
    transport.send("\r");
    await new Promise((r) => setTimeout(r, 20));
    stop();
    const output = chunks.join("");
    expect(output).toContain("Plano proposto");
    expect(output).toContain("Combinado");
  });

  test("backspace apaga o último caractere digitado", () => {
    const transport = createMockApi({ delayMs: 0 }).terminal("mock:p1");
    const chunks: string[] = [];
    transport.subscribe((c) => chunks.push(c));
    transport.send("ab\u007f");
    expect(chunks.join("")).toContain("\b \b");
  });
});

describe("parseScenario", () => {
  test("valores desconhecidos viram ok", () => {
    expect(parseScenario(null)).toBe("ok");
    expect(parseScenario("xyz")).toBe("ok");
    expect(parseScenario("erro")).toBe("erro");
  });
});
