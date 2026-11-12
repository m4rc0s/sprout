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

  test("renderiza a SideNav no padrão Perplexity com + Novo, Agentes Abertos, Projetos e Usuário", () => {
    renderScreen();
    expect(screen.getByText("Sprout")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Novo" })).toBeInTheDocument();
    expect(screen.getByText("Agentes Abertos")).toBeInTheDocument();
    expect(screen.getByText("agent-sprout")).toBeInTheDocument();
    expect(screen.getByText("Projetos")).toBeInTheDocument();
    expect(screen.getByText("Recentes")).toBeInTheDocument();
    expect(screen.getAllByText("Marcos Araujo").length).toBeGreaterThanOrEqual(1);
  });

  test("selecionar um agente aberto na sidebar abre seu terminal e permite voltar ao Composer", async () => {
    const user = userEvent.setup();
    renderScreen();

    // Clica no agente aberto agent-sprout
    const agentItem = screen.getByText("agent-sprout");
    await user.click(agentItem);

    // O canvas central deve exibir o terminal do agente
    expect(await screen.findByRole("button", { name: "Voltar ao Composer" })).toBeInTheDocument();

    // Clica para voltar ao Composer
    await user.click(screen.getByRole("button", { name: "Voltar ao Composer" }));
    expect(await screen.findByLabelText(/descreva o projeto/i)).toBeInTheDocument();
  });

  test("clicar em + Novo restaura a visão do Composer", async () => {
    const user = userEvent.setup();
    renderScreen();

    // Abre o terminal de um agente
    await user.click(screen.getByText("agent-sprout"));
    expect(await screen.findByRole("button", { name: "Voltar ao Composer" })).toBeInTheDocument();

    // Clica em + Novo na barra lateral
    await user.click(screen.getByRole("button", { name: "+ Novo" }));
    expect(await screen.findByLabelText(/descreva o projeto/i)).toBeInTheDocument();
  });

  test("envia o plantio com Ctrl+Enter dentro do markdown", async () => {
    const user = userEvent.setup();
    renderScreen("sem-herdr");
    const input = screen.getByLabelText(/descreva o projeto/i);
    await user.type(input, "# App via Atalho");
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(await screen.findByText(/Spec enviada para/)).toBeInTheDocument();
  });

  test("botão Plantar outro restaura o Zero-State Composer", async () => {
    const user = userEvent.setup();
    renderScreen("sem-herdr");
    await user.type(screen.getByLabelText(/descreva o projeto/i), "# Meu App");
    await user.click(screen.getByRole("button", { name: "Plantar" }));
    expect(await screen.findByText(/Spec enviada para/)).toBeInTheDocument();

    const resetButton = await screen.findByRole("button", { name: "Plantar outro" });
    await user.click(resetButton);

    expect(await screen.findByLabelText(/descreva o projeto/i)).toBeInTheDocument();
  });

  test("rodapé da SideNav: clica no perfil e abre o Popover conforme Print 3", async () => {
    const user = userEvent.setup();
    renderScreen();

    // Trigger do perfil
    const profileTrigger = screen.getByLabelText(/perfil e configurações de marcos araujo/i);
    expect(profileTrigger).toBeInTheDocument();

    // Clica para abrir o Popover
    await user.click(profileTrigger);

    // Itens do Print 3 devem estar visíveis no Popover
    expect(await screen.findByText("marquinhoa34655")).toBeInTheDocument();
    expect(screen.getByText("marquinhoaraujo@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Anônima")).toBeInTheDocument();
    expect(screen.getByText("Todas as configurações")).toBeInTheDocument();
    expect(screen.getByText(/aparência/i)).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  test("topo da SideNav: possui botões de Notificações, Busca e botão de fechar menu no cabeçalho (padrão finops)", () => {
    renderScreen();

    // Botões de ação no cabeçalho
    expect(screen.getByRole("button", { name: "Notificações" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buscar comandos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recolher menu" })).toBeInTheDocument();
  });

  test("clicar no botão de fechar/recolher menu no topo alterna o estado e exibe botão de expandir no rodapé", async () => {
    const user = userEvent.setup();
    renderScreen();

    const collapseBtn = screen.getByRole("button", { name: "Recolher menu" });
    await user.click(collapseBtn);

    // Quando recolhido, o botão de expandir menu aparece no rodapé
    expect(await screen.findByRole("button", { name: "Expandir menu" })).toBeInTheDocument();

    // Clicar em expandir restaura o menu expandido com o botão de recolher no topo
    await user.click(screen.getByRole("button", { name: "Expandir menu" }));
    expect(await screen.findByRole("button", { name: "Recolher menu" })).toBeInTheDocument();
  });

  test("renderiza rodapé institucional com Termos de Serviço e Aviso de Privacidade no composer", () => {
    renderScreen();
    expect(screen.getByText("Termos de Serviço")).toBeInTheDocument();
    expect(screen.getByText("Aviso de Privacidade")).toBeInTheDocument();
  });
});
