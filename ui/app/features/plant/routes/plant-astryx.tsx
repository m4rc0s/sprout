import { lazy, Suspense, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import { Theme } from "@astryxdesign/core/theme";
import { matchaTheme } from "@astryxdesign/theme-matcha/built";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Code } from "@astryxdesign/core/Code";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Kbd } from "@astryxdesign/core/Kbd";
import { Selector } from "@astryxdesign/core/Selector";
import { Spinner } from "@astryxdesign/core/Spinner";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-matcha/theme.css";
import "./plant-astryx.css";
import { ApiProvider } from "~/features/plant/api/api-context";
import { createMockApi, parseScenario } from "~/features/plant/api/mock-api";
import type { AgentChoice, LogLevel } from "~/features/plant/api/types";
import { AGENT_OPTIONS, usePlantForm } from "~/features/plant/lib/use-plant-form";
import { usePlantFlow } from "~/features/plant/lib/use-plant-flow";

// O xterm só é carregado quando existe um agente para mostrar.
const TerminalView = lazy(() => import("~/features/terminal/terminal-view"));

const LEVEL_DOT: Record<LogLevel, "accent" | "success" | "warning" | "error"> = {
  info: "accent",
  ok: "success",
  warn: "warning",
  error: "error",
};
const LEVEL_LABEL: Record<LogLevel, string> = { info: "info", ok: "ok", warn: "aviso", error: "erro" };

/** Mesmo fluxo "Plantar e assistir", montado com componentes do Astryx (tema matcha). */
export default function PlantAstryxRoute() {
  const [params] = useSearchParams();
  const scenario = params.get("cenario");
  const mode = params.get("modo") === "escuro" ? "dark" : "light";
  const api = useMemo(() => createMockApi({ scenario: parseScenario(scenario) }), [scenario]);

  return (
    <Theme theme={matchaTheme} mode={mode}>
      <ApiProvider value={api}>
        <div className="astryx-page">
          <div className="astryx-container">
            <PlantScreen mode={mode} />
          </div>
        </div>
      </ApiProvider>
    </Theme>
  );
}

function PlantScreen({ mode }: { mode: "light" | "dark" }) {
  const { state, plant, reset, transport, busy, showForm, noAgentByChoice } = usePlantFlow();
  const form = usePlantForm(plant);
  const agentHeadingRef = useRef<HTMLDivElement>(null);
  const leaveTerminal = useCallback(() => agentHeadingRef.current?.focus(), []);

  // O terminal é uma ilha escura nos dois modos; as cores vêm de tokens do Astryx.
  const terminalTokens = {
    "--terminal-bg": mode === "dark" ? "var(--color-background-muted)" : "var(--color-background-inverted)",
    "--terminal-fg": "var(--color-on-dark)",
    "--terminal-cursor": "var(--color-icon-cyan)",
    "--terminal-ansi-black": "var(--color-icon-secondary)",
    "--terminal-ansi-red": "var(--color-icon-error)",
    "--terminal-ansi-green": "var(--color-icon-success)",
    "--terminal-ansi-yellow": "var(--color-icon-warning)",
    "--terminal-ansi-blue": "var(--color-icon-info)",
    "--terminal-ansi-magenta": "var(--color-icon-purple)",
    "--terminal-ansi-cyan": "var(--color-icon-cyan)",
    "--terminal-ansi-white": "var(--color-on-dark)",
  } as React.CSSProperties;

  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Heading level={1}>Sprout</Heading>
        <Banner
          status="info"
          title="Protótipo com Astryx (tema matcha)"
          description="Os dados são simulados e nada é criado no seu computador."
          collapsible={false}
        />
        <HStack gap={4}>
          <Button label="HUD" variant="ghost" size="sm" href="/" />
          <Button label="Orgânico" variant="ghost" size="sm" href="/?tema=organico" />
          <Button label="Astryx escuro" variant="ghost" size="sm" href="/astryx?modo=escuro" />
        </HStack>
      </VStack>

      <Grid columns={{ minWidth: 440 }} gap={6}>
        <Card padding={6}>
          <VStack gap={4}>
            <Heading level={2}>Projeto</Heading>
            {showForm ? (
              <>
                {state.error ? <Banner status="error" title={state.error} collapsible={false} /> : null}
                <form
                  aria-label="Novo projeto"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    form.submit();
                  }}
                >
                  <VStack gap={4}>
                    {/* Ctrl+Enter envia: o evento de teclado sobe do textarea até este wrapper */}
                    <div
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                          event.preventDefault();
                          form.submit();
                        }
                      }}
                    >
                      <TextArea
                        label="Descreva o projeto em markdown"
                        value={form.text}
                        rows={14}
                        width="100%"
                        isDisabled={busy}
                        description={`${form.text.length} caracteres.`}
                        status={form.textMessage ? { type: "error", message: form.textMessage } : undefined}
                        onChange={(value) => form.setText(value)}
                      />
                    </div>
                    <TextInput
                      label="Destino"
                      value={form.dest}
                      width="100%"
                      isDisabled={busy}
                      description="Sugerido a partir do título do texto."
                      status={form.destMessage ? { type: "error", message: form.destMessage } : undefined}
                      onChange={(value) => form.setDest(value)}
                    />
                    <Selector
                      label="Agente"
                      options={AGENT_OPTIONS}
                      value={form.agent}
                      width="100%"
                      isDisabled={busy}
                      onChange={(value) => form.setAgent(value as AgentChoice)}
                    />
                    <Button label="Plantar" variant="primary" type="submit" size="lg" isLoading={busy} />
                  </VStack>
                </form>
              </>
            ) : (
              <VStack gap={3}>
                <Text>
                  Spec enviada para <Code>{state.request?.dest}</Code> (agente: {state.request?.agent}).
                </Text>
                {!busy ? <Button label="Plantar outro" variant="secondary" onClick={reset} /> : null}
              </VStack>
            )}
          </VStack>
        </Card>

        <Card padding={6}>
          <VStack gap={4}>
            <HStack gap={2} align="center">
              {state.phase === "running" ? <StatusDot variant="success" label="Agente em execução" isPulsing /> : null}
              {/* O Heading do Astryx não aceita tabIndex; o wrapper recebe o foco ao sair do terminal. */}
              <div ref={agentHeadingRef} id="agent-heading" tabIndex={-1} style={{ outline: "none" }}>
                <Heading level={2}>Agente</Heading>
              </div>
            </HStack>

            {state.phase === "idle" ? (
              <Text type="supporting">O progresso e o terminal do agente aparecem aqui depois de plantar.</Text>
            ) : null}
            {busy ? <Spinner size="md" label="Plantando…" /> : null}

            {state.log.length > 0 ? (
              <ol className="astryx-log" aria-label="Progresso do plantio" aria-live="polite">
                {state.log.map((entry, index) => (
                  <li key={index}>
                    <HStack gap={2} align="center">
                      <StatusDot variant={LEVEL_DOT[entry.level]} label={LEVEL_LABEL[entry.level]} />
                      <Text type="code">[{LEVEL_LABEL[entry.level]}]</Text>
                      <Text>{entry.line}</Text>
                    </HStack>
                  </li>
                ))}
              </ol>
            ) : null}

            {state.phase === "no-agent" ? (
              <Banner
                status={noAgentByChoice ? "info" : "warning"}
                title={noAgentByChoice ? "Projeto criado sem agente, como você escolheu." : "Projeto criado, mas o Herdr não está disponível."}
                description="Abra o projeto no terminal para continuar."
                collapsible={false}
              />
            ) : null}

            {transport ? (
              <VStack gap={2}>
                <div className="astryx-terminal" style={terminalTokens}>
                  <Suspense fallback={<Text>Abrindo terminal…</Text>}>
                    <TerminalView transport={transport} onExit={leaveTerminal} />
                  </Suspense>
                </div>
                <Text type="supporting">
                  <Kbd keys="ctrl+shift+space" /> sai do terminal.
                </Text>
              </VStack>
            ) : null}
          </VStack>
        </Card>
      </Grid>
    </VStack>
  );
}
