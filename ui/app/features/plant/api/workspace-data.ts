import type { AgentChoice } from "./types";

export interface AgentSession {
  id: string;
  name: string;
  agent: AgentChoice;
  paneId: string;
  projectId: string;
  workspaceId: string;
  status: "running" | "idle" | "stopped";
  startedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  branch: string;
  path: string;
  activeAgent?: AgentSession;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  workspaces: Workspace[];
}

export interface RecentSession {
  id: string;
  title: string;
  projectId: string;
  workspaceId: string;
  updatedAt: string;
}

/** Projetos e espaços de trabalho padrão do ecossistema local do Sprout. */
export const INITIAL_PROJECTS: Project[] = [
  {
    id: "sprout",
    name: "sprout",
    path: "~/workspace/sprout",
    workspaces: [
      {
        id: "feat/sprout-ui",
        name: "feat/sprout-ui",
        branch: "feat/sprout-ui",
        path: "~/workspace/sprout",
        activeAgent: {
          id: "agent-sprout",
          name: "agent-sprout",
          agent: "auto",
          paneId: "mock:p1",
          projectId: "sprout",
          workspaceId: "feat/sprout-ui",
          status: "running",
          startedAt: "Há 15 min",
        },
      },
      {
        id: "main",
        name: "main",
        branch: "main",
        path: "~/workspace/sprout",
      },
      {
        id: "fix/terminal-keys",
        name: "fix/terminal-keys",
        branch: "fix/terminal-keys",
        path: "~/workspace/sprout-terminal-keys",
      },
    ],
  },
  {
    id: "finance_tool",
    name: "finance_tool",
    path: "~/workspace/finance_tool",
    workspaces: [
      {
        id: "billing_prd",
        name: "billing_prd",
        branch: "feature/billing_prd",
        path: "~/workspace/finance_tool/billing",
        activeAgent: {
          id: "agent-billing",
          name: "agent-billing",
          agent: "claude",
          paneId: "mock:p2",
          projectId: "finance_tool",
          workspaceId: "billing_prd",
          status: "running",
          startedAt: "Há 40 min",
        },
      },
      {
        id: "main",
        name: "main",
        branch: "main",
        path: "~/workspace/finance_tool",
      },
    ],
  },
];

export const INITIAL_RECENT_SESSIONS: RecentSession[] = [
  {
    id: "sess-1",
    title: "UI com padrão Perplexity",
    projectId: "sprout",
    workspaceId: "feat/sprout-ui",
    updatedAt: "Há 10 min",
  },
  {
    id: "sess-2",
    title: "Ingestão de PRD de faturamento",
    projectId: "finance_tool",
    workspaceId: "billing_prd",
    updatedAt: "Há 1 hora",
  },
  {
    id: "sess-3",
    title: "Setup do Herdr multiplexer",
    projectId: "sprout",
    workspaceId: "main",
    updatedAt: "Ontem",
  },
];

/** Retorna a lista plana de todos os agentes atualmente abertos e em execução. */
export function getOpenAgents(projects: Project[]): AgentSession[] {
  const agents: AgentSession[] = [];
  for (const project of projects) {
    for (const ws of project.workspaces) {
      if (ws.activeAgent && ws.activeAgent.status === "running") {
        agents.push(ws.activeAgent);
      }
    }
  }
  return agents;
}
