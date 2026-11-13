# Sprout UI: plano de referência + MVP "Plantar e assistir"

Este arquivo tem duas partes:
- **Parte A: plano de referência** (a visão completa e as regras que valem para tudo). Será salva no repo em `docs/plans/sprout-ui-reference.md` como primeiro passo da execução.
- **Parte B: MVP enxuto** (o que executamos agora): fundação mínima + **um** fluxo com efeito "uau".

---

# PARTE B: MVP enxuto

## Passo 0.5 (pedido do usuário): protótipo clicável para validar a proposta
Antes de qualquer código real, um **protótipo em HTML único** (Artifact privado, sem backend) com a tela "Plantar e assistir" **simulada**: colar texto → destino/nome sugeridos → Plantar → log de plantio em stream → terminal do agente aparece e aceita digitação (eco simulado). Serve só para validar fluxo e sensação, não é código de produção.
- **Dois visuais alternáveis** por um seletor: "HUD" (o estilo sci-fi colado pelo usuário, já com as adaptações da Sally: borda de campos/botões ≥3:1, texto longo neutro, log estático, sem ticker no texto legível, `prefers-reduced-motion`) e "Calmo" (neutro, sóbrio), para comparar lado a lado.
- (Atualizado em 2026-11-08) Protótipo feito sobre a casca real com o Astryx como veio; HUD e Orgânico foram prototipados e descartados.
- Estados navegáveis: vazio, plantando, agente subindo, terminal ao vivo, erro (destino ocupado), Herdr ausente.
- Registrar no protótipo o que é simulado. Feedback do usuário volta para o `DESIGN.md`/`EXPERIENCE.md` (Etapa 2).

## Context
Queremos validar a ideia da UI do Sprout com o menor caminho possível, mas entregando um momento que o usuário lembre. Tudo que não serve a esse momento fica para depois (Parte A, "Fase 2").

### O momento "uau": da ideia ao agente trabalhando, em uma tela e ~15 segundos
1. O usuário roda `sprout ui`; abre uma tela com **uma caixa grande** ("Descreva o projeto em markdown").
2. Cola o texto longo (a ideia, um PRD, uma conversa). O **destino e o nome já vêm sugeridos** a partir do título do texto (ex.: `~/workspace/meu_app`); ele só confere.
3. Clica em **Plantar**. Vê, ao vivo, os passos acontecendo (repo criado, spec salva, commit inicial, workspace aberto, agente iniciado em plan mode).
4. Sem trocar de janela, **o terminal do agente aparece ao lado** e o agente já está lendo a spec e montando o plano. O usuário pode **digitar no terminal** ali mesmo (responder uma pergunta, aprovar o plano).

Sem flags, sem alternar para o Herdr: "colei minha ideia e um agente começou a planejar em cima dela, e eu estou vendo".

### Corte deliberado (fica fora do MVP)
Lista de projetos recentes, lista/gestão de sessões (retomar, nova, parar, remover), abas de handoff/tarefa, atalhos, autopilot, telemetria, edição de config, temas customizáveis. A única "sessão" do MVP é a que acabou de ser plantada.

## Fundação (mínima, sustenta o fluxo e a Fase 2)
1. **BMad no repo + config de agente** (Etapas 0 e 5 da Parte A, em versão compacta).
2. **`ui/` limpo:** RR7 SPA, Vite, Astryx (core + theme-neutral), zod, xterm, bun test. Sem Storybook, Tailwind, Radix, lucide nem `tokens.css`: a identidade visual é o Astryx como veio (`DESIGN.md`).
3. **Servidor Bun** (`ui/server/`): `Bun.serve` em `127.0.0.1`, token por execução + cookie `SameSite=Strict`, validação de `Origin`/`Host`, servir `ui/build/client`; runners `sprout()` e `herdr()` que usam **argv sem shell**; payloads com `zod`.
4. **Subcomando `sprout ui`** em `bin/sprout`: checa `bun`; se não houver build, orienta `cd ui && bun install && bun run build`; sobe o servidor, imprime a URL com token, abre o navegador (`--port`, `--no-open`).

## A feature: "Plantar e assistir" (3 fatias verticais, TDD)
**Fatia 1 — Plantar a partir do texto.**
- UI: textarea grande, contador, arrastar `.md`; destino e nome **sugeridos** (slug do primeiro `# título`, sob `~/workspace`); seletor de agente (`auto/claude/agy/codex`); botão **Plantar**; validações (destino existente e não vazio, caminho relativo/`..`, texto vazio).
- API `POST /api/plant {text, dest, name?, agent}`: grava o texto em arquivo temporário `.md` e executa `sprout plant <arquivo> <dest> [-a agente] [--name]` (reusa o fluxo de spec; sem limite de argv). Resposta em **stream (NDJSON/SSE)** com cada linha do `plant`, para a tela mostrar o progresso real. Sem Herdr disponível: cria o projeto e informa claramente.
- Teste: `sprout`/`herdr` falsos no PATH; casos de erro (destino ocupado, falha no clone, `plant` retornando erro).

**Fatia 2 — Encontrar o agente recém-criado.**
- API `GET /api/agents/by-path?dest=…`: `herdr agent list`, filtra por `cwd == dest`, devolve `pane_id`, estado, agente/modelo (`.sprout/session.json`). A UI consulta até o agente aparecer (timeout com mensagem útil).
- Teste: lista do herdr falsa (aparece depois de N chamadas, nunca aparece, vários agentes).

**Fatia 3 — Terminal ao vivo (espelho + teclado).**
- `WS /ws/terminal/:pane`: enquanto houver cliente, `herdr pane read <pane> --source visible --ansi` a cada ~300 ms; envia só quando o hash muda. Entrada: `send-text` para texto literal e `send-keys` para Enter, setas, Tab, Esc, Ctrl-C (tabela de mapeamento testada). Pane inexistente/fechado: estado vazio claro.
- UI: componente `TerminalView` (xterm, carregado com `React.lazy`), painel ao lado do formulário, que se recolhe em um resumo "Spec enviada" após o plantio. Cores do terminal lidas dos tokens do Astryx.
- Limite honesto documentado na UI: ~300 ms de latência e snapshot, não stream.

## Etapas BMad (compactas; cada uma para no usuário)
0. **Setup:** skill `bmad` instala `_bmad/` no Sprout, cria `initiative-sprout-ui`. *Parada:* confirmar o que foi instalado e se `_bmad/` vai ao git.
1. **Ticket curto (Sofia):** só o fluxo "Plantar e assistir", critérios de aceite e o corte. *Parada:* aprovar.
2. **UX (Sally, `bmad-ux`):** **uma tela** + o momento "uau"; elicita paleta/tom com o usuário (não imponho cores) e gera `DESIGN.md` + `EXPERIENCE.md` enxutos (estados: vazio, plantando, agente subindo, erro, Herdr ausente). *Parada:* aprovar.
3. **Arquitetura (Winston, `bmad-architecture`):** spine mínimo com os invariantes: servidor não reimplementa o Sprout (mutação = CLI); espelho de terminal e contrato do `TerminalView`; segurança local; ratifica a stack. *Parada:* aprovar.
4. **Build (Amelia, `bmad-build`):** as 3 fatias acima, um commit por fatia.
5. **Config de agente (`bmad-project-context`):** `AGENTS.md` + `CLAUDE.md` curto do Sprout com as regras da Parte A. Cada escrita é aprovada pelo usuário.

## Ordem de execução
0) Salvar a Parte A em `docs/plans/sprout-ui-reference.md` (commit `docs`). → BMad setup → ticket → UX → arquitetura (paradas) → limpar `ui/` + fundação (servidor, `sprout ui`) → Fatia 1 → 2 → 3 → config de agente → docs/README (`docs/ui.md`) → PR empilhado sobre `feat/plant-from-prompt`, **sem merge sem o aval do usuário**.

## Verificação
1. Antes de cada commit: `cd ui && bun run typecheck && bun test` verdes; build sem erro; grep de cor hardcoded e de barrel files vazios; `bash -n bin/sprout`.
2. Testes de servidor: auth (401 sem token), `Origin` externa (403), argv sem shell (texto com `;`, `$()`, aspas), zod, mapeamento de teclas, hash do snapshot.
3. E2E com Playwright (chromium instalado) usando `sprout`/`herdr` falsos: colar texto → Plantar → log em stream → terminal aparece → digitar e ver o eco. Capturas claro/escuro.
4. **O teste que importa, no Herdr real (só o usuário valida):** colar um texto longo, plantar, ver o agente começar a planejar e responder pelo terminal da UI. Medir o tempo de "clique em Plantar" até "agente visível" (meta ~15 s).

---

# PARTE A: Plano de referência (visão completa)

## Context
O Sprout é 100% CLI. A UI completa permite: criar projeto (do zero, de texto markdown longo ou de spec), controlar sessões (retomar, começar outra, parar, remover) e ver o terminal do agente dentro da UI.

## Decisões do usuário
- **Método BMad completo com as skills** (`bmad-ux` → `bmad-architecture` → `bmad-build`), conversando com o usuário.
- **Dos repos `finance_tool` e `ft_bpo_shell`: nenhuma implementação, paleta ou código.** Só as configs de agente do `ft_bpo_shell` (AGENTS.md, CLAUDE.md, `.claude/`, `.agents/`), adaptadas.
- **Do catálogo (`marcos_dev_catalog.md`) entram somente as regras de performance e de Git.** Fora: Storybook/CDD, padrões de composição e as demais diretrizes de UI do catálogo.
- **Stack (atualizada em 2026-11-08):** Bun · TypeScript 5.x · React 19 · React Router v7 SPA mode (`ssr: false`) · Vite · **Astryx como veio** (`@astryxdesign/core` + `theme-neutral`, StyleX como peer, sem camada de marca) · `zod` · `bun test` + Testing Library + happy-dom · Playwright · `@xterm/xterm` + `@xterm/addon-fit` · servidor Bun (REST + WebSocket). Sem Tailwind, Radix, shadcn nem lucide-react. O spine de arquitetura ratifica; não reabre a stack sozinho.

## Regras mantidas do catálogo
**Performance:** `Promise.all` para I/O independente; `await` só onde o dado é usado; sem barrel files; `React.lazy`/`import()` em modais e rotas secundárias; estado derivado na renderização (sem `useEffect` de sincronização); `useState(() => …)` para estado pesado; `useRef` para contadores/transições.
**Git:** só em branch, nunca na `main`; Conventional Commits em inglês; SemVer anotado `vX.Y.Z` só em release; **merge somente com aprovação explícita do usuário**.

## Configs de agente do `ft_bpo_shell` adaptadas ao Sprout
**Entram:**
- Commits Conventional em inglês, imperativo minúsculo, ≤72 caracteres, um commit lógico por fatia; tags SemVer com `v`, `package.json` sincronizado.
- Antes de cada commit: `bun test` e `bun run typecheck` verdes; build sem erro; testes junto com o código, incluindo erro e bordas.
- Branching: nunca `main`; PR e esperar o "pode fazer o merge".
- Guardrails: sem refatorar fora do escopo, sem scope creep, sem otimizar sem medir, sem silenciar erro do `tsc`, sem engolir erro (mensagens úteis; sem `console.log` em produção), sem commitar segredos, sem `git push --force`, sem dependência nova sem checar advisories.
- Perguntar antes: mudança arquitetural grande, serviço de terceiros novo, linter/formatter, trade-off que pede benchmark, desvio do plano documentado.
- Fluxo de 7 passos (ler docs → estrutura → implementar → testar → atualizar docs → commit → próxima etapa) e critérios de sucesso.
- Comunicação: conversa em português, commits/tags/release em inglês; resumo breve por fatia; reportar a taxa de testes.
- `.claude/feature-driven.json` adaptado (nome, stack, `commands.test/typecheck/build`, regras curtas).

**Não entram:** padrão de backlog Jira/Sofia e `SOFIA_AGENT_INSTRUCTIONS.md`; regras de dinheiro em centavos, multi-tenant, Postgres, SCPE `features/`; CDD/Storybook; `settings.json` (allowlist do outro projeto) e `RESUME.md` (checkpoint gerado).

**Conflitos resolvidos:** CLAUDE.md do ft aceita trabalho em `main`, AGENTS.md §4 proíbe: vale a mais estrita (nunca `main`). O ft proíbe o agente de revisar o próprio código: não rodo `bmad-code-review` por conta própria, só a pedido. Commits e PR **sem nenhuma menção a Claude/Anthropic** (CLAUDE.md global do usuário prevalece).

## Segurança (requisito do projeto)
Servidor só em `127.0.0.1`; token por execução + `Origin`/`Host` validados; sem shell (argv); caminhos de destino validados; ações destrutivas só com confirmação explícita; payloads com `zod`.

## Arquitetura de alto nível
`sprout ui` → servidor Bun (`127.0.0.1:7421`, serve a SPA + API + WebSocket) → subprocessos `sprout …` (mutações, única fonte da verdade) e `herdr …` (leituras: `agent list`, `pane read`; entrada: `send-text`/`send-keys`). Leituras de sessão vêm de herdr + `git worktree list` + `.sprout/session.json`/`handoff.md`.

## Fase 2 (fora do MVP)
Projetos recentes; lista de sessões com **Retomar** (`sprout session recycle --pane`), **Nova** (`sprout <type> "<texto>"`), **Parar** (`herdr pane send-keys esc C-c C-c`), **Remover** (`sprout prune --yes` com confirmação); abas Handoff/Tarefa (markdown); atalhos de teclado; painel do autopilot; telemetria de agentes (`sprout agent status`); edição de `config.toml`; avaliar PTY (`herdr agent attach`) no lugar do espelho se a latência incomodar.
