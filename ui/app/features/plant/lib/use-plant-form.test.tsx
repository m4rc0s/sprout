import { describe, expect, mock, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { usePlantForm } from "./use-plant-form";

describe("usePlantForm", () => {
  test("sugere o destino a partir do título enquanto o usuário digita", () => {
    const { result } = renderHook(() => usePlantForm(mock()));
    act(() => result.current.setText("# Meu App"));
    expect(result.current.dest).toBe("~/workspace/meu_app");
  });

  test("não envia sem texto e explica o motivo só depois da tentativa", () => {
    const onSubmit = mock();
    const { result } = renderHook(() => usePlantForm(onSubmit));
    expect(result.current.textMessage).toBeNull();
    let sent = true;
    act(() => {
      sent = result.current.submit();
    });
    expect(sent).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.textMessage).toBe("Cole ou escreva a ideia do projeto.");
  });

  test("não envia com destino relativo", () => {
    const onSubmit = mock();
    const { result } = renderHook(() => usePlantForm(onSubmit));
    act(() => {
      result.current.setText("# App");
      result.current.setDest("meu_app");
    });
    act(() => {
      result.current.submit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.destMessage).toMatch(/caminho absoluto/i);
  });

  test("depois que o usuário edita o destino, o título deixa de mudá-lo", () => {
    const { result } = renderHook(() => usePlantForm(mock()));
    act(() => {
      result.current.setText("# App");
      result.current.setDest("~/outro/lugar");
    });
    act(() => result.current.setText("# Outro Título"));
    expect(result.current.dest).toBe("~/outro/lugar");
  });

  test("envia texto, destino e agente escolhidos", () => {
    const onSubmit = mock();
    const { result } = renderHook(() => usePlantForm(onSubmit));
    act(() => {
      result.current.setText("# Meu App");
      result.current.setAgent("codex");
    });
    act(() => {
      result.current.submit();
    });
    expect(onSubmit).toHaveBeenCalledWith({ text: "# Meu App", dest: "~/workspace/meu_app", agent: "codex" });
  });
});
