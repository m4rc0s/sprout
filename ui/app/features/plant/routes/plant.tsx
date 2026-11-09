import { lazy, Suspense, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import { AppShell } from "@astryxdesign/core/AppShell";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Code } from "@astryxdesign/core/Code";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Kbd } from "@astryxdesign/core/Kbd";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { Selector } from "@astryxdesign/core/Selector";
import { Spinner } from "@astryxdesign/core/Spinner";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TopNav, TopNavHeading } from "@astryxdesign/core/TopNav";
import { VStack } from "@astryxdesign/core/VStack";
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

export default function PlantRoute() {
  const [params] = useSearchParams();
  const scenario = params.get("cenario");
  const api = useMemo(() => createMockApi({ scenario: parseScenario(scenario) }), [scenario]);

  return (
    <ApiProvider value={api}>
      <AppShell
        topNav={<TopNav heading={<TopNavHeading heading="Sprout" />} />}
        banner={
          <Banner
            status="info"
            title="Protótipo"
            description="Os dados são simulados e nada é criado no seu computador."
            collapsible={false}
            container="section"
          />
        }
        contentPadding={4}
      >
        <Layout content={<LayoutContent><PlantScreen /></LayoutContent>} />
      </AppShell>
    </ApiProvider>
  );
}

/** "Plantar e assistir": cole a ideia, plante e acompanhe o agente na mesma tela. */
export function PlantScreen() {
  const { state, plant, reset, transport, busy, showForm, noAgentByChoice } = usePlantFlow();
  const form = usePlantForm(plant);
  const agentHeadingRef = useRef<HTMLDivElement>(null);
  const leaveTerminal = useCallback(() => agentHeadingRef.current?.focus(), []);

  return (
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
                  {/* Ctrl+Enter envia: o evento de teclado sobe do textarea até este wrapper. */}
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
            {/* Recebe o foco quando o usuário sai do terminal (Ctrl+Shift+Espaço). */}
            <div ref={agentHeadingRef} id="agent-heading" tabIndex={-1}>
              <Heading level={2}>Agente</Heading>
            </div>
          </HStack>

          {state.phase === "idle" ? (
            <Text type="supporting">O progresso e o terminal do agente aparecem aqui depois de plantar.</Text>
          ) : null}
          {busy ? <Spinner size="md" label="Plantando…" /> : null}

          {state.log.length > 0 ? (
            <VStack gap={1} as="ol" aria-label="Progresso do plantio" aria-live="polite">
              {state.log.map((entry, index) => (
                <HStack as="li" key={index} gap={2} align="center">
                  <StatusDot variant={LEVEL_DOT[entry.level]} label={LEVEL_LABEL[entry.level]} />
                  <Text type="code">[{LEVEL_LABEL[entry.level]}]</Text>
                  <Text>{entry.line}</Text>
                </HStack>
              ))}
            </VStack>
          ) : null}

          {state.phase === "no-agent" ? (
            <Banner
              status={noAgentByChoice ? "info" : "warning"}
              title={
                noAgentByChoice
                  ? "Projeto criado sem agente, como você escolheu."
                  : "Projeto criado, mas o Herdr não está disponível."
              }
              description="Abra o projeto no terminal para continuar."
              collapsible={false}
            />
          ) : null}

          {transport ? (
            <VStack gap={2}>
              <Card variant="muted" padding={2}>
                <Suspense fallback={<Text>Abrindo terminal…</Text>}>
                  <TerminalView transport={transport} onExit={leaveTerminal} />
                </Suspense>
              </Card>
              <Text type="supporting">
                <Kbd keys="ctrl+shift+space" /> sai do terminal.
              </Text>
            </VStack>
          ) : null}
        </VStack>
      </Card>
    </Grid>
  );
}
