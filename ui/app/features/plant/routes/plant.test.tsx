import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiProvider } from "~/features/plant/api/api-context";
import { createMockApi } from "~/features/plant/api/mock-api";
import { PlantScreen } from "./plant";

function renderScreen(scenario: "ok" | "erro" | "sem-herdr" = "ok") {
  return render(
    <ApiProvider value={createMockApi({ scenario, delayMs: 0 })}>
      <PlantScreen />
    </ApiProvider>,
  );
}

describe("PlantScreen (componentes do Astryx)", () => {
  test("começa com o formulário e o estado vazio do agente", () => {
    renderScreen();
    expect(screen.getByLabelText(/descreva o projeto/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plantar" })).toBeInTheDocument();
    expect(screen.getByText(/aparecem aqui depois de plantar/i)).toBeInTheDocument();
  });

  test("planta: mostra a spec enviada e o log do plantio", async () => {
    const user = userEvent.setup();
    renderScreen("sem-herdr");
    await user.type(screen.getByLabelText(/descreva o projeto/i), "# Meu App");
    await user.click(screen.getByRole("button", { name: "Plantar" }));
    expect(await screen.findByText(/Spec enviada para/)).toBeInTheDocument();
    expect(await screen.findByText(/Initial Commit/)).toBeInTheDocument();
    expect(await screen.findByText(/Herdr não está disponível/)).toBeInTheDocument();
  });

  test("destino ocupado: volta ao formulário com o erro e o texto preservado", async () => {
    const user = userEvent.setup();
    renderScreen("erro");
    await user.type(screen.getByLabelText(/descreva o projeto/i), "# Meu App");
    await user.click(screen.getByRole("button", { name: "Plantar" }));
    expect(await screen.findByText(/já existe e não está vazio/)).toBeInTheDocument();
    expect(screen.getByLabelText(/descreva o projeto/i)).toHaveValue("# Meu App");
  });

  test("não envia vazio e mostra o motivo", async () => {
    const user = userEvent.setup();
    renderScreen();
    await user.click(screen.getByRole("button", { name: "Plantar" }));
    expect(await screen.findByText("Cole ou escreva a ideia do projeto.")).toBeInTheDocument();
  });
});
