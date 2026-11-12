import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AppShell } from "@astryxdesign/core/AppShell";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Code } from "@astryxdesign/core/Code";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Kbd } from "@astryxdesign/core/Kbd";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { Popover } from "@astryxdesign/core/Popover";
import { Selector } from "@astryxdesign/core/Selector";
import {
  SideNav,
  SideNavCollapseButton,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { Spinner } from "@astryxdesign/core/Spinner";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TopNav } from "@astryxdesign/core/TopNav";
import { VStack } from "@astryxdesign/core/VStack";
import { Bell, PanelLeft, Plus, Search, Sparkles } from "lucide-react";
import { ThemePicker } from "~/shared/theme/theme-picker";
import { useThemeSettings, type ThemeMode, type ThemeSlug } from "~/shared/theme/theme-settings";
import { ApiProvider, useSproutApi } from "~/features/plant/api/api-context";
import { createMockApi, parseScenario } from "~/features/plant/api/mock-api";
import type { AgentChoice, LogLevel } from "~/features/plant/api/types";
import {
  INITIAL_PROJECTS,
  INITIAL_RECENT_SESSIONS,
  getOpenAgents,
  type AgentSession,
  type Project,
  type RecentSession,
} from "~/features/plant/api/workspace-data";
import { AGENT_OPTIONS, usePlantForm } from "~/features/plant/lib/use-plant-form";
import { usePlantFlow } from "~/features/plant/lib/use-plant-flow";

// O xterm só é carregado sob demanda
const TerminalView = lazy(() => import("~/features/terminal/terminal-view"));

const LEVEL_DOT: Record<LogLevel, "accent" | "success" | "warning" | "error"> = {
  info: "accent",
  ok: "success",
  warn: "warning",
  error: "error",
};
const LEVEL_LABEL: Record<LogLevel, string> = { info: "info", ok: "ok", warn: "aviso", error: "erro" };

const ICON_PROPS = { size: 16, strokeWidth: 1.75 } as const;

export default function PlantRoute() {
  const [params] = useSearchParams();
  const scenario = params.get("cenario");
  const api = useMemo(() => createMockApi({ scenario: parseScenario(scenario) }), [scenario]);

  return (
    <ApiProvider value={api}>
      <PlantScreen isPrototype={true} />
    </ApiProvider>
  );
}

export interface PlantScreenProps {
  isPrototype?: boolean;
}

type ActiveView = "composer" | "execution" | "agent-terminal";

/** "Plantar e assistir": Home Logada do Sprout no padrão visual do Perplexity. */
export function PlantScreen({ isPrototype = false }: PlantScreenProps) {
  const api = useSproutApi();
  const { state, plant, reset, transport, busy, showForm, noAgentByChoice } = usePlantFlow();
  const form = usePlantForm(plant);
  const { slug, effectiveMode, setSlug, setMode } = useThemeSettings();

  // Estados de navegação do Workspace Shell
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>("sprout");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("feat/sprout-ui");
  const [recentSessions] = useState<RecentSession[]>(INITIAL_RECENT_SESSIONS);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapsible = useMemo(
    () => ({ isCollapsed, onCollapsedChange: setIsCollapsed, hasButton: false }),
    [isCollapsed],
  );

  const [activeView, setActiveView] = useState<ActiveView>("composer");
  const [selectedAgent, setSelectedAgent] = useState<AgentSession | null>(null);

  const agentHeadingRef = useRef<HTMLDivElement>(null);
  const leaveTerminal = useCallback(() => agentHeadingRef.current?.focus(), []);

  // Lista dinâmica de agentes abertos em todos os projetos
  const openAgents = useMemo(() => getOpenAgents(projects), [projects]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0]!,
    [projects, activeProjectId],
  );

  const activeWorkspace = useMemo(
    () =>
      activeProject.workspaces.find((w) => w.id === activeWorkspaceId) ??
      activeProject.workspaces[0]!,
    [activeProject, activeWorkspaceId],
  );

  // Selecionar um agente aberto da lateral para inspecionar no canvas central
  const handleSelectAgent = (agent: AgentSession) => {
    setSelectedAgent(agent);
    setActiveProjectId(agent.projectId);
    setActiveWorkspaceId(agent.workspaceId);
    setActiveView("agent-terminal");
  };

  // Alternar projeto
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const targetProject = projects.find((p) => p.id === projectId);
    if (targetProject && targetProject.workspaces.length > 0) {
      setActiveWorkspaceId(targetProject.workspaces[0]!.id);
    }
  };

  // Alternar workspace dentro do projeto
  const handleSelectWorkspace = (projectId: string, workspaceId: string) => {
    setActiveProjectId(projectId);
    setActiveWorkspaceId(workspaceId);
    const targetProject = projects.find((p) => p.id === projectId);
    const targetWorkspace = targetProject?.workspaces.find((w) => w.id === workspaceId);

    if (targetWorkspace?.activeAgent) {
      setSelectedAgent(targetWorkspace.activeAgent);
      setActiveView("agent-terminal");
    } else {
      setSelectedAgent(null);
      setActiveView("composer");
      if (targetWorkspace) {
        form.setDest(targetWorkspace.path);
      }
    }
  };

  // Ação "+ Novo" (Novo Plantio)
  const handleNewPlant = () => {
    reset();
    setSelectedAgent(null);
    setActiveView("composer");
  };

  // Quando o fluxo de plantio inicia, atualiza a view para execution
  const isExecuting = busy || (!showForm && state.phase !== "idle");
  const currentView: ActiveView = isExecuting ? "execution" : activeView;

  // Canal do terminal do agente selecionado na barra lateral
  const activeAgentTransport = useMemo(() => {
    if (currentView === "agent-terminal" && selectedAgent) {
      return api.terminal(selectedAgent.paneId);
    }
    return null;
  }, [api, currentView, selectedAgent]);

  return (
    <AppShell
      topNav={
        <TopNav
          label="Barra superior do Sprout"
          startContent={
            <HStack gap={2} align="center">
              <Badge
                variant="neutral"
                label={`${activeProject.name} / ${activeWorkspace.name}`}
              />
              {openAgents.length > 0 && (
                <Badge
                  variant="success"
                  label={`${openAgents.length} agente${openAgents.length > 1 ? "s" : ""} ativo${openAgents.length > 1 ? "s" : ""}`}
                />
              )}
            </HStack>
          }
          endContent={<ThemePicker />}
        />
      }
      sideNav={
        <SideNav
          collapsible={collapsible}
          header={
            <SideNavHeading
              heading="Sprout"
              icon={<Sparkles size={20} strokeWidth={1.75} className="text-[var(--color-icon-accent)]" />}
              headerEndContent={
                <HStack gap={0.5} align="center">
                  <IconButton
                    label="Notificações"
                    tooltip="Notificações"
                    variant="ghost"
                    size="sm"
                    icon={<Bell {...ICON_PROPS} />}
                  />
                  <IconButton
                    label="Buscar comandos"
                    tooltip="Buscar (⌘K)"
                    variant="ghost"
                    size="sm"
                    icon={<Search {...ICON_PROPS} />}
                  />
                  <SideNavCollapseButton collapsible={collapsible} size="sm" label="Recolher menu">
                    <PanelLeft {...ICON_PROPS} aria-hidden />
                  </SideNavCollapseButton>
                </HStack>
              }
            />
          }
          topContent={
            <div className="sprout-sidebar-cta">
              <button
                type="button"
                className="sprout-btn-new"
                disabled={busy}
                onClick={handleNewPlant}
                aria-label="+ Novo"
              >
                <Plus size={16} strokeWidth={2} aria-hidden />
                <span>+ Novo</span>
              </button>
            </div>
          }
          footer={
            <UserProfileFooter
              slug={slug}
              effectiveMode={effectiveMode}
              setSlug={setSlug}
              setMode={setMode}
            />
          }
          footerIcons={
            isCollapsed ? (
              <SideNavCollapseButton collapsible={collapsible} label="Expandir menu" />
            ) : undefined
          }
        >
          {/* Seção 1: Agentes Abertos */}
          <SideNavSection title="Agentes Abertos">
            {openAgents.length > 0 ? (
              openAgents.map((agent) => (
                <SideNavItem
                  key={agent.id}
                  label={agent.name}
                  icon="search"
                  endContent={<StatusDot variant="success" isPulsing label="Ativo" />}
                  isSelected={currentView === "agent-terminal" && selectedAgent?.id === agent.id}
                  onClick={() => handleSelectAgent(agent)}
                />
              ))
            ) : (
              <SideNavItem
                label="Nenhum agente aberto"
                isDisabled
                icon="info"
              />
            )}
          </SideNavSection>

          {/* Seção 2: Projetos e seus múltiplos Espaços de Trabalho */}
          <SideNavSection title="Projetos">
            {projects.map((project) => (
              <SideNavItem
                key={project.id}
                label={project.name}
                collapsible={{ defaultIsCollapsed: project.id !== activeProjectId }}
                isSelected={project.id === activeProjectId && currentView === "composer"}
                endContent={
                  <Badge
                    variant="neutral"
                    label={`${project.workspaces.length}`}
                  />
                }
                onClick={() => handleSelectProject(project.id)}
              >
                {project.workspaces.map((ws) => (
                  <SideNavItem
                    key={ws.id}
                    label={ws.name}
                    icon="info"
                    endContent={
                      ws.activeAgent ? (
                        <StatusDot variant="success" isPulsing label="Ativo" />
                      ) : undefined
                    }
                    isSelected={
                      project.id === activeProjectId &&
                      ws.id === activeWorkspaceId &&
                      currentView !== "agent-terminal"
                    }
                    onClick={() => handleSelectWorkspace(project.id, ws.id)}
                  />
                ))}
              </SideNavItem>
            ))}
          </SideNavSection>

          {/* Seção 3: Histórico de Conversa / Recentes */}
          <SideNavSection title="Recentes">
            {recentSessions.map((session) => (
              <SideNavItem
                key={session.id}
                label={session.title}
                icon="clock"
                endContent={
                  <Text size="sm" type="supporting">
                    {session.updatedAt}
                  </Text>
                }
                onClick={() => {
                  handleSelectWorkspace(session.projectId, session.workspaceId);
                }}
              />
            ))}
          </SideNavSection>
        </SideNav>
      }
      banner={
        isPrototype ? (
          <Banner
            status="info"
            title="Protótipo"
            description="Os dados são simulados e nada é criado no seu computador."
            collapsible={false}
            container="section"
          />
        ) : null
      }
      contentPadding={6}
    >
      <Layout
        content={
          <LayoutContent>
            {/* VIEW A: COMPOSER (Home Logada no padrão estético do print) */}
            {currentView === "composer" && (
              <Center axis="horizontal" padding={2}>
                <VStack gap={6} width="100%" maxWidth={780}>
                  <VStack gap={1} align="center">
                    <Heading level={1}>Sprout Workspace</Heading>
                    <Text type="supporting">
                      Projeto: <Code>{activeProject.name}</Code> · Workspace: <Code>{activeWorkspace.name}</Code>
                    </Text>
                    <Text type="supporting">
                      O progresso e o terminal do agente aparecem aqui depois de plantar.
                    </Text>
                  </VStack>

                  <Card padding={6}>
                    <VStack gap={5}>
                      {state.error ? (
                        <Banner status="error" title={state.error} collapsible={false} />
                      ) : null}

                      <form
                        aria-label="Novo projeto"
                        noValidate
                        onSubmit={(event) => {
                          event.preventDefault();
                          form.submit();
                        }}
                      >
                        <VStack gap={5}>
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
                              rows={10}
                              width="100%"
                              isDisabled={busy}
                              description={`${form.text.length} caracteres.`}
                              status={form.textMessage ? { type: "error", message: form.textMessage } : undefined}
                              onChange={(value) => form.setText(value)}
                            />
                          </div>

                          <Grid columns={{ minWidth: 260 }} gap={4}>
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
                          </Grid>

                          <HStack justify="between" align="center">
                            <Text type="supporting">
                              <Kbd keys="ctrl+enter" /> para plantar
                            </Text>
                            <Button
                              label="Plantar"
                              variant="primary"
                              type="submit"
                              size="lg"
                              isLoading={busy}
                            />
                          </HStack>
                        </VStack>
                      </form>
                    </VStack>
                  </Card>

                  <footer className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
                    <HStack justify="center" gap={3}>
                      <Text size="sm" type="supporting">Termos de Serviço</Text>
                      <Text size="sm" type="supporting">·</Text>
                      <Text size="sm" type="supporting">Aviso de Privacidade</Text>
                    </HStack>
                  </footer>
                </VStack>
              </Center>
            )}

            {/* VIEW B: EXECUTION WORKSPACE (Durante o plantio de nova spec) */}
            {currentView === "execution" && (
              <VStack gap={6}>
                <Card variant="muted" padding={4}>
                  <HStack justify="between" align="center">
                    <VStack gap={1}>
                      <HStack gap={2} align="center">
                        <StatusDot
                          variant={
                            state.phase === "running"
                              ? "success"
                              : state.phase === "no-agent"
                              ? "warning"
                              : "accent"
                          }
                          label={
                            state.phase === "running"
                              ? "Agente em execução"
                              : state.phase === "no-agent"
                              ? "Sem agente"
                              : "Plantando projeto"
                          }
                          isPulsing={state.phase === "running"}
                        />
                        <Text weight="bold">
                          {state.phase === "running"
                            ? "Agente em execução"
                            : state.phase === "planting"
                            ? "Plantando projeto…"
                            : "Projeto inicializado"}
                        </Text>
                      </HStack>
                      <Text>
                        Spec enviada para <Code>{state.request?.dest}</Code> (agente: {state.request?.agent}).
                      </Text>
                    </VStack>
                    {!busy ? (
                      <Button label="Plantar outro" variant="secondary" size="md" onClick={handleNewPlant} />
                    ) : null}
                  </HStack>
                </Card>

                <Grid columns={{ minWidth: 440 }} gap={6}>
                  <Card padding={6}>
                    <VStack gap={4}>
                      <HStack justify="between" align="center">
                        <Heading level={2}>Etapas do Plantio</Heading>
                        {busy ? <Spinner size="sm" label="Plantando…" /> : null}
                      </HStack>

                      {state.log.length > 0 ? (
                        <VStack gap={2} as="ol" aria-label="Progresso do plantio" aria-live="polite">
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
                    </VStack>
                  </Card>

                  <Card padding={6}>
                    <VStack gap={4}>
                      <HStack gap={2} align="center">
                        {state.phase === "running" ? (
                          <StatusDot variant="success" label="Agente em execução" isPulsing />
                        ) : null}
                        <div ref={agentHeadingRef} id="agent-heading" tabIndex={-1}>
                          <Heading level={2}>Agente</Heading>
                        </div>
                      </HStack>

                      {transport ? (
                        <VStack gap={2}>
                          <Card variant="muted" padding={2}>
                            <Suspense fallback={<Text>Abrindo terminal…</Text>}>
                              <TerminalView
                                transport={transport}
                                onExit={leaveTerminal}
                                themeKey={`${slug}:${effectiveMode}`}
                              />
                            </Suspense>
                          </Card>
                          <Text type="supporting">
                            <Kbd keys="ctrl+shift+space" /> sai do terminal.
                          </Text>
                        </VStack>
                      ) : state.phase === "no-agent" ? (
                        <VStack gap={2}>
                          <Text type="supporting">
                            Nenhum terminal conectado. Você pode abrir e interagir diretamente na sua linha de comando:
                          </Text>
                          <Card variant="muted" padding={3}>
                            <Text type="code">cd {state.request?.dest ?? "~/workspace"}</Text>
                          </Card>
                        </VStack>
                      ) : (
                        <VStack gap={3} align="center" padding={6}>
                          <Spinner size="md" label="Aguardando agente…" />
                          <Text type="supporting">
                            O terminal interativo será conectado assim que o agente iniciar.
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </Card>
                </Grid>
              </VStack>
            )}

            {/* VIEW C: AGENT TERMINAL (Inspeção direta de agente aberto na barra lateral) */}
            {currentView === "agent-terminal" && selectedAgent && (
              <VStack gap={4}>
                <Card variant="muted" padding={4}>
                  <HStack justify="between" align="center">
                    <HStack gap={3} align="center">
                      <StatusDot variant="success" isPulsing label="Em execução" />
                      <VStack gap={0}>
                        <Heading level={2}>{selectedAgent.name}</Heading>
                        <Text type="supporting" size="sm">
                          Projeto: <Code>{selectedAgent.projectId}</Code> · Workspace: <Code>{selectedAgent.workspaceId}</Code> · {selectedAgent.startedAt}
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      label="Voltar ao Composer"
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveView("composer")}
                    />
                  </HStack>
                </Card>

                <Card padding={4}>
                  <VStack gap={2}>
                    <Card variant="muted" padding={2}>
                      {activeAgentTransport ? (
                        <Suspense fallback={<Text>Abrindo terminal…</Text>}>
                          <TerminalView
                            transport={activeAgentTransport}
                            onExit={leaveTerminal}
                            themeKey={`${slug}:${effectiveMode}`}
                          />
                        </Suspense>
                      ) : (
                        <Text>Conectando ao terminal…</Text>
                      )}
                    </Card>
                    <Text type="supporting">
                      <Kbd keys="ctrl+shift+space" /> sai do terminal.
                    </Text>
                  </VStack>
                </Card>
              </VStack>
            )}
          </LayoutContent>
        }
      />
    </AppShell>
  );
}

interface UserProfileFooterProps {
  slug: ThemeSlug;
  effectiveMode: ThemeMode;
  setSlug: (slug: ThemeSlug) => void;
  setMode: (mode: ThemeMode) => void;
}

/** Rodapé do menu lateral no padrão dos Prints 1, 2 e 3 e protótipo BPO Shell. */
function UserProfileFooter({ slug, effectiveMode, setSlug, setMode }: UserProfileFooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="sprout-sidebar-footer">
      {/* Botão de atualização estilo pílula (Print 1 & 2) */}
      <Button
        label="Atualizar plano"
        variant="secondary"
        size="sm"
        width="100%"
      />

      {/* Popover acoplado ao perfil do usuário (Print 1, 2 e 3) */}
      <Popover
        role="none"
        label="Menu do usuário"
        placement="above"
        alignment="start"
        width={300}
        padding={2}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        content={
          <UserProfilePopup
            slug={slug}
            effectiveMode={effectiveMode}
            setSlug={setSlug}
            setMode={setMode}
            onClose={() => setIsOpen(false)}
          />
        }
      >
        <ClickableCard
          label="Perfil e configurações de Marcos Araujo"
          variant={isHovered || isOpen ? "muted" : "transparent"}
          padding={2}
          width="100%"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <HStack justify="between" align="center" width="100%">
            <HStack gap={3} align="center">
              <Avatar name="Marcos Araujo" size="sm" />
              <VStack gap={0} align="start">
                <Text weight="bold" size="sm">
                  Marcos Araujo
                </Text>
                <Text type="supporting" size="sm">
                  Plano gratuito
                </Text>
              </VStack>
            </HStack>
            {isHovered || isOpen ? (
              <Text type="supporting" size="sm">
                ↕
              </Text>
            ) : null}
          </HStack>
        </ClickableCard>
      </Popover>
    </div>
  );
}

interface UserProfilePopupProps {
  slug: ThemeSlug;
  effectiveMode: ThemeMode;
  setSlug: (slug: ThemeSlug) => void;
  setMode: (mode: ThemeMode) => void;
  onClose: () => void;
}

/** Conteúdo do menu popup exatamente como no Print 3. */
function UserProfilePopup({ slug, effectiveMode, setSlug, setMode, onClose }: UserProfilePopupProps) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  return (
    <VStack gap={1} width="100%">
      {/* Header com Avatar, handle e email */}
      <HStack gap={3} align="center" padding={2}>
        <Avatar name="Marcos Araujo" size="md" />
        <VStack gap={0} align="start">
          <Text weight="bold" size="sm">
            marquinhoa34655
          </Text>
          <Text type="supporting" size="sm">
            marquinhoaraujo@gmail.com
          </Text>
        </VStack>
      </HStack>

      <Divider variant="subtle" />

      {/* Item 1: Modo Anônimo com Switch */}
      <HStack justify="between" align="center" padding={2}>
        <HStack gap={2} align="center">
          <Text size="sm">🕶️</Text>
          <Text size="sm">Anônima</Text>
          <Text type="supporting" size="sm">
            ^;
          </Text>
        </HStack>
        <Switch
          value={isAnonymous}
          onChange={setIsAnonymous}
          isLabelHidden
          label="Modo anônimo"
          size="sm"
        />
      </HStack>

      {/* Item 2: Adicionar conta */}
      <ClickableCard variant="transparent" padding={2} width="100%" label="Adicionar conta" onClick={onClose}>
        <HStack gap={2} align="center">
          <Text size="sm">＋</Text>
          <Text size="sm">Adicionar conta</Text>
        </HStack>
      </ClickableCard>

      {/* Item 3: Todas as configurações */}
      <ClickableCard variant="transparent" padding={2} width="100%" label="Todas as configurações" onClick={onClose}>
        <HStack justify="between" align="center" width="100%">
          <HStack gap={2} align="center">
            <Text size="sm">⚙</Text>
            <Text size="sm">Todas as configurações</Text>
          </HStack>
          <Text type="supporting" size="sm">
            ⇧^,
          </Text>
        </HStack>
      </ClickableCard>

      {/* Item 4: Atualizar plano */}
      <ClickableCard variant="transparent" padding={2} width="100%" label="Atualizar plano" onClick={onClose}>
        <HStack gap={2} align="center">
          <Text size="sm">↑</Text>
          <Text size="sm">Atualizar plano</Text>
        </HStack>
      </ClickableCard>

      {/* Item 5: Instalar aplicativos */}
      <ClickableCard variant="transparent" padding={2} width="100%" label="Instalar aplicativos" onClick={onClose}>
        <HStack gap={2} align="center">
          <Text size="sm">↓</Text>
          <Text size="sm">Instalar aplicativos</Text>
        </HStack>
      </ClickableCard>

      <Divider variant="subtle" />

      {/* Item 6: Aparência */}
      <ClickableCard
        variant="transparent"
        padding={2}
        width="100%"
        label="Aparência"
        onClick={() => setShowThemeOptions((prev) => !prev)}
      >
        <HStack justify="between" align="center" width="100%">
          <HStack gap={2} align="center">
            <Text size="sm">🌙</Text>
            <VStack gap={0} align="start">
              <Text size="sm">Aparência</Text>
              <Text type="supporting" size="sm">
                {slug.toUpperCase()} ({effectiveMode === "dark" ? "Escuro" : "Claro"})
              </Text>
            </VStack>
          </HStack>
          <Text type="supporting" size="sm">
            {showThemeOptions ? "▲" : "›"}
          </Text>
        </HStack>
      </ClickableCard>

      {showThemeOptions && (
        <VStack gap={2} padding={2}>
          <HStack gap={2} align="center">
            <Button
              label={effectiveMode === "dark" ? "Alternar para Claro" : "Alternar para Escuro"}
              variant="secondary"
              size="sm"
              onClick={() => setMode(effectiveMode === "dark" ? "light" : "dark")}
            />
          </HStack>
        </VStack>
      )}

      {/* Item 7: Idioma */}
      <ClickableCard variant="transparent" padding={2} width="100%" label="Idioma" onClick={onClose}>
        <HStack justify="between" align="center" width="100%">
          <HStack gap={2} align="center">
            <Text size="sm">文A</Text>
            <VStack gap={0} align="start">
              <Text size="sm">Idioma</Text>
              <Text type="supporting" size="sm">
                Padrão (Português)
              </Text>
            </VStack>
          </HStack>
          <Text type="supporting" size="sm">
            ›
          </Text>
        </HStack>
      </ClickableCard>

      {/* Item 8: Central de ajuda */}
      <ClickableCard variant="transparent" padding={2} width="100%" label="Central de ajuda" onClick={onClose}>
        <HStack justify="between" align="center" width="100%">
          <HStack gap={2} align="center">
            <Text size="sm">?</Text>
            <Text size="sm">Central de ajuda</Text>
          </HStack>
          <Text type="supporting" size="sm">
            ›
          </Text>
        </HStack>
      </ClickableCard>

      <Divider variant="subtle" />

      {/* Item 9: Sair */}
      <ClickableCard variant="transparent" padding={2} width="100%" label="Sair" onClick={onClose}>
        <HStack gap={2} align="center">
          <Text size="sm">↪</Text>
          <Text size="sm">Sair</Text>
        </HStack>
      </ClickableCard>
    </VStack>
  );
}
