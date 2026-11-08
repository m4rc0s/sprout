import { describe, expect, test } from "bun:test";
import { extractTitle, slugify, suggestDest, validateDest } from "./suggest";

describe("extractTitle", () => {
  test("usa o primeiro título markdown", () => {
    expect(extractTitle("intro\n# App de Tarefas\nresto")).toBe("App de Tarefas");
  });
  test("sem título, usa a primeira linha não vazia", () => {
    expect(extractTitle("\n\n  crie um bot de discord\nmais")).toBe("crie um bot de discord");
  });
  test("texto vazio", () => {
    expect(extractTitle("   \n")).toBe("");
  });
});

describe("slugify", () => {
  test("remove acentos, pontuação e junta com _", () => {
    expect(slugify("Gestão de Pagamentos: v2!")).toBe("gestao_de_pagamentos_v2");
  });
  test("limita a 32 caracteres sem cortar palavra", () => {
    const slug = slugify("sistema integrado de gestão financeira para escritórios contábeis");
    expect(slug.length).toBeLessThanOrEqual(32);
    expect(slug.endsWith("_")).toBe(false);
  });
  test("não termina em palavra de ligação", () => {
    expect(slugify("app de")).toBe("app");
  });
});

describe("suggestDest", () => {
  test("monta o caminho sob ~/workspace", () => {
    expect(suggestDest("# Meu App\ntexto")).toBe("~/workspace/meu_app");
  });
  test("sem título, não sugere nada", () => {
    expect(suggestDest("")).toBe("");
  });
});

describe("validateDest", () => {
  test("aceita absoluto e ~/", () => {
    expect(validateDest("/home/u/app")).toBeNull();
    expect(validateDest("~/workspace/app")).toBeNull();
  });
  test("rejeita vazio, relativo e ..", () => {
    expect(validateDest("  ")).toBe("empty");
    expect(validateDest("app")).toBe("relative");
    expect(validateDest("~/a/../b")).toBe("traversal");
  });
});
