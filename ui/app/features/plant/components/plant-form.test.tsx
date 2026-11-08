import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlantForm } from "./plant-form";

describe("PlantForm", () => {
  test("sugere o destino a partir do título enquanto o usuário digita", async () => {
    const user = userEvent.setup();
    render(<PlantForm onSubmit={mock()} />);
    await user.type(screen.getByLabelText(/descreva o projeto/i), "# Meu App");
    expect(screen.getByLabelText("Destino")).toHaveValue("~/workspace/meu_app");
  });

  test("não envia sem texto e mostra o motivo", async () => {
    const user = userEvent.setup();
    const onSubmit = mock();
    render(<PlantForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Plantar" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Cole ou escreva a ideia do projeto.")).toBeInTheDocument();
  });

  test("não envia com destino relativo", async () => {
    const user = userEvent.setup();
    const onSubmit = mock();
    render(<PlantForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/descreva o projeto/i), "# App");
    await user.clear(screen.getByLabelText("Destino"));
    await user.type(screen.getByLabelText("Destino"), "meu_app");
    await user.click(screen.getByRole("button", { name: "Plantar" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/caminho absoluto/i)).toBeInTheDocument();
  });

  test("envia texto, destino e agente escolhidos", async () => {
    const user = userEvent.setup();
    const onSubmit = mock();
    render(<PlantForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/descreva o projeto/i), "# Meu App");
    await user.selectOptions(screen.getByLabelText("Agente"), "codex");
    await user.click(screen.getByRole("button", { name: "Plantar" }));
    expect(onSubmit).toHaveBeenCalledWith({
      text: "# Meu App",
      dest: "~/workspace/meu_app",
      agent: "codex",
    });
  });

  test("desabilita os campos enquanto planta", () => {
    render(<PlantForm disabled onSubmit={mock()} />);
    expect(screen.getByRole("button", { name: "Plantar" })).toBeDisabled();
    expect(screen.getByLabelText("Destino")).toBeDisabled();
  });
});
