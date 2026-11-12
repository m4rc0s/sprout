---
name: Sprout
status: approved
sources:
  - ../initiative-sprout-ui.md
updated: 2026-11-09
---

# Sprout, Home Logada & Multi-Workspace Shell — Experience Spine

## Foundation

Local web app, desktop browser first, started with `sprout ui` and served on this machine only. The Home Logada of Sprout is structured as an **Agentic Workspace Shell** inspired by Perplexity.ai. The UI is a React Router 7 single-page app in `ui/`; it reaches Sprout through the `SproutApi` interface (interchangeable between mock scenarios and live server). The UI system is Astryx as shipped (`@astryxdesign/core` + official themes).

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| **Agentic Workspace Shell** | `sprout ui` opens it; it is the default route | SideNav persistente com Agentes Abertos, Projetos e Workspaces, Recentes e Perfil; canvas central adaptativo |

### Lifecycle dos Três Modos de Visualização

| Modo | O que apresenta | Comportamento de UX |
|---|---|---|
| **Home Logada Composer (Zero-State)** | Entrada limpa e generosa: spec Markdown com controles integrados de destino e escolha de agente, contextualizada no projeto e workspace ativo | Foco total na ideação ou redação da spec, eliminando distrações |
| **Active Execution Split** | Header de resumo da spec enviada, ledger sequencial de etapas à esquerda e terminal interativo (sandbox) à direita | Ativado durante a execução de um novo plantio; atenção voltada para o progresso da criação |
| **Agent Terminal Inspection View** | Terminal interativo xterm de alta fidelidade para qualquer agente aberto na barra lateral | Permite alternar entre múltiplos agentes ativos com 1 clique sem interromper nenhuma tarefa |

## Component Patterns

Behavioral. Components and their props are in `DESIGN.md` and the Astryx docs.

| Component | Behavior |
|---|---|
| SideNav | Barra lateral colapsável com `SideNavHeading`, ação principal "+ Novo", seções de "Agentes Abertos" com `StatusDot` pulsante, "Projetos" com múltiplos workspaces aninhados, "Recentes" e perfil do usuário ("Marcos Araujo"). |
| Markdown field (`TextArea`) | Qualquer tamanho. A descrição exibe a contagem de caracteres. `Ctrl+Enter` envia. |
| Destination field (`TextInput`) | Sugerido automaticamente a partir do título Markdown (`# Título`) como `~/workspace/<slug>`. Permanece editável. |
| Agent select (`Selector`) | `auto`, `claude`, `agy`, `codex` e `nenhum` (somente repositório). |
| Plantar button | Botão primário (`lg`) com estado de loading enquanto executa. |
| Spec Summary Header | Linha de resumo no topo com destino, agente e botão "Plantar outro". |
| Plant log | Linhas ordenadas com marcadores `[info]`, `[ok]`, `[aviso]`, `[erro]` e `StatusDot` anunciado via `aria-live="polite"`. |
| Terminal | Terminal ao vivo (`TerminalView` / xterm) consumindo tokens do tema ativo, com atalho documentado: `Ctrl+Shift+Espaço`. |

## State Patterns

| State | Canvas Central |
|---|---|
| **Home Logada / Composer** | Hero Composer centralizado e pronto para digitação com projeto e workspace ativos destacados |
| **Planting** | Header de resumo ativo; feed de etapas preenchendo em tempo real; indicador de espera no painel do agente |
| **Agente Selecionado da Sidebar** | Terminal xterm interativo ativo no canvas com botão "Voltar ao Composer" e breadcrumbs contextuais |
| **Destination Occupied** | Retorna ao Hero Composer com banner de erro sobre o destino; texto da spec preservado |
| **Herdr Missing** | Feed de etapas encerra com aviso; banner explica como abrir o projeto localmente via terminal |
| **No Agent Chosen** | Cria o repositório sem subir agente; exibe comando direto de acesso ao diretório |

## Interaction Primitives

- **Teclado primeiro:** O fluxo é 100% operável sem mouse.
- `Ctrl+Enter` envia a partir do campo de markdown.
- `Ctrl+Shift+Espaço` desengata o foco do terminal xterm de volta para a casca da página.
- `ThemePicker` no cabeçalho permite alternar temas e modos (claro/escuro/sistema) sem recarregar a página.
