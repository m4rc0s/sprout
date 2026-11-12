# Workflows and Methodologies

Sprout is designed to decouple issue tracking from development methodologies and agent runtimes. This document describes how workflows operate and how to use or extend them.

## Supported Agents

Any agent supported by Herdr can be passed via `--agent` (or `-a`):

| Agent | CLI Flag | Canonical Command | Description |
| :--- | :--- | :--- | :--- |
| **Auto (Smart Router)** | `-a auto` | *Dynamic* | Balances load across available agents based on cooldowns & Herdr sessions |
| **Claude Code** | `-a claude` | `claude` | Anthropic's interactive agentic CLI |
| **Antigravity** | `-a agy` | `agy` | Google Deepmind's agentic CLI |
| **Codex** | `-a codex` | `codex` | OpenAI / custom Codex CLI |
| **Gemini** | `-a gemini` | `gemini` | Gemini CLI integration |

If omitted, the default is configured in `<git-common-dir>/sprout/config.toml` or defaults to `auto`.

### Smart Agent Router & Telemetry

Sprout includes a telemetry store at `<git-common-dir>/sprout/agents_status.json` that tracks cooldowns, reasons, and priorities:

```bash
# View live telemetry
sprout agent status

# Place an agent in cooldown (e.g., when reaching a 5-hour window or token limit)
sprout agent cooldown claude --for 2h --reason "5h token limit reached"

# Reset cooldown
sprout agent reset claude
```

**Selection Algorithm:**
1. **Cooldown check:** Excludes agents whose `cooldown_until` is in the future. Expired cooldowns automatically self-heal.
2. **Concurrency balancing:** Queries Herdr's live agent sessions via socket and picks the candidate with the fewest active sessions.
3. **Priority tie-breaking:** Resolves ties using the agent priority hierarchy (e.g., Claude > AGY > Codex).
4. **Graceful degradation:** If all agents are in cooldown, falls back to the highest priority candidate with a clear warning.


---

## Supported Methodologies

The `--method` (or `-m`) flag defines what initial prompt is injected into the agent when the Herdr workspace is created.

### 1. BMad Method (`-m bmad`) - Default
The BMad method uses an orchestrator skill (`bmad`) that guides analysis, product briefs, and implementations.

**Prompt injected (Jira Issue):**
> *"BMad, analise a feature/issue <KEY> (<SUMMARY>). A descrição e os detalhes do Jira estão salvos em .sprout/issue.json e .sprout/issue.md. Inicie a análise inicial para elaborarmos o briefing da implementação."*

**Prompt injected (Link / Article Context):**
> *"BMad, inicie no modo plan para planejar a tarefa <KEY> (<SUMMARY>). O artigo/especificação de referência (<URL>) foi ingerido e está salvo em .sprout/issue.json e .sprout/issue.md. Elabore o plano de implementação antes de realizar alterações no código e aguarde confirmação."*

**Prompt injected (Free-form Context / Non-Jira):**
> *"BMad, inicie no modo plan para planejar a tarefa <KEY> (<SUMMARY>). O briefing e contexto inicial estão salvos em .sprout/issue.json e .sprout/issue.md. Elabore o plano de implementação antes de realizar alterações no código e aguarde confirmação."*

**What happens next:**
- The agent activates the `bmad` skill.
- Reads `.sprout/issue.json` and `.sprout/issue.md` to extract requirements, acceptance criteria, and edge cases.
- Begins drafting the initiative/briefing document (under `_bmad-output/`) and waits for your confirmation to continue.

### 2. SCPE Method (`-m scpe`)
[Spec-Compiled Product Engineering (SCPE)](https://github.com/m4rc0s/scpe) focuses on executable specs, vertical slices, and rules/scenarios.

**Prompt injected (Link / Article Context):**
> *"SCPE: inicie no modo plan para especificar a tarefa <KEY> (<SUMMARY>) a partir do artigo/especificação ingerido em .sprout/issue.json (<URL>). Inicie a especificação da feature de acordo com o método SCPE."*

**Prompt injected (Standard / Issue):**
> *"SCPE: inicie no modo plan para especificar a tarefa <KEY> (<SUMMARY>) a partir de .sprout/issue.json. Inicie a especificação da feature de acordo com o método SCPE."*

**What happens next:**
- The agent reads `.sprout/issue.json`.
- Formulates rules (`R#`) and Given/When/Then scenarios (`S#`).
- Outlines vertical slices for implementation in the workspace.

### 3. None / Interactive (`-m none`)
No initial prompt is sent. The agent opens cleanly in the worktree directory ready for you to type whatever you want.

---

## Configuration Defaults

You can configure project-wide defaults by adding a `[defaults]` table in `<git-common-dir>/sprout/config.toml`:

```toml
[project]
name = "Finance Tool"
github_repo = "org/finance-tool"

[defaults]
agent = "auto"       # Default agent: auto (Smart Router), claude, agy, or codex
method = "bmad"      # Default workflow: bmad, scpe, or none

[models.tier_map]
feat = "frontier"
fix = "frontier"
docs = "fast"
chore = "fast"

[models.agents.claude]
frontier = "opus"
balanced = "sonnet"
fast = "haiku"

[models.agents.agy]
frontier = "gemini-4-argon"
balanced = "gemini-4-argon"
fast = "gemini-3.8-flash"
```

---

## Session Recycling & Context Compaction

### The Context Window Problem
During prolonged agent sessions, the cumulative transcript can easily exceed 80,000 tokens. This introduces:
1. **Instruction Amnesia / Drift:** The agent begins to ignore rules defined in the initial briefing.
2. **Execution Latency:** Every turn requires ingesting the bloated context window.
3. **Escalating Costs:** Input token costs compound on every turn.

### The Solution: Warm-Start Handoff
Run inside the worktree at any time:

```bash
# Check current session context and Herdr pane status
sprout session status

# Snapshot state to .sprout/handoff.md and reboot agent with clean context
sprout session recycle
```

When invoked:
1. Sprout snapshots Git diff statistics, uncommitted files, recent commit history, and task requirements to `.sprout/handoff.md`.
2. It sends an interrupt (`C-c`) to the active Herdr pane.
3. It restarts the agent process cleanly with a pristine context window (~3k tokens).
4. It submits an automatic warm-start prompt instructing the agent to resume from `.sprout/handoff.md`.

---

## Worktree Creation from Web Links & Articles

Sprout allows turning any external article, blog post, or specification URL into an isolated worktree branch in an existing repository:

```bash
# Ingest an article directly as a feature task
sprout feat https://eng.uber.com/circuit-breaking-architecture/

# Custom feature summary with explicit reference link
sprout feat "Implementar Circuit Breaker" --link https://martinfowler.com/articles/.../circuit-breaker.html

# Read remote markdown context via --context-file
sprout fix --context-file https://raw.githubusercontent.com/org/repo/main/docs/cache-bug.md
```

### Ingestion Lifecycle:
1. **Network Fetching & Content-Type Detection:** `curl -sL --fail` fetches the page with automatic redirect handling and HTTP error trapping.
2. **Deterministic Extraction:** Zero-dependency Python parser extracts the page title (`og:title` / `h1` / `<title>`), meta description, and clean Markdown body (preserving headings, lists, code blocks, and links while stripping navigation, headers, footers, and scripts).
3. **Automated Slug & Branch Generation:** Generates a clean 32-char stop-word-filtered branch slug (e.g., `feat/circuit_breaking_architecture`).
4. **Weighted Semantic Complexity Engine:** Passes the full extracted article text to evaluate complexity and uncertainty signals, automatically dispatching the appropriate model tier and reasoning effort.
5. **Contract Generation:** Creates `.sprout/issue.json` (`source: "url"`, `url: "<URL>"`) and `.sprout/issue.md`.
6. **Rollback Safety:** If the URL is unreachable or invalid (404/network error), Sprout fails immediately with zero dirty state or half-created worktrees.

---

## Dedicated Review Worktrees & PR Ingestion (`sprout review`)

Sprout allows reviewing any pull request directly in an isolated review worktree with automatic checkout:

```bash
# Check out a PR into a dedicated review worktree and branch (e.g. ../review_pr_58 on review/pr-58)
sprout review 58

# Pass full GitHub PR URL or head branch name:
sprout review https://github.com/my-org/finance_tool/pull/58
sprout review feat/auth-tokens

# Override the local review branch or directory name:
sprout review 58 --branch review/auth-audit --dest ~/workspace/auth_audit

# Inside an active worktree: refreshes review feedback in-place for the current branch:
sprout review

# Optional: clean context before review triage
sprout review --recycle
```

### Review Worktree Lifecycle:
1. **Automatic Checkout by Design:** Running `sprout review <PR>` creates a dedicated review branch (`review/pr-<number>`) and worktree (`../review_pr_<number>`), fetching the pull request head from GitHub without needing explicit checkout flags.
2. **Resume (Retomar):** If the review worktree already exists, Sprout re-attaches to it, pulls the latest PR updates from GitHub, refreshes the review dossier, and re-focuses the Herdr workspace.
3. **Feedback Ingestion:** Consolidates reviews, approval decisions, general PR comments, and inline diff annotations into `.sprout/review.md` and `.sprout/review.json`.
4. **Contextual Agent Prompting:**
   - With comments: Dispatches **BMad Review Triage** to classify feedback into Must Fix, Optional, and Out of Scope.
   - Without comments: Prompts the agent to perform an architectural diff audit comparing against the base branch.
5. **Clean Teardown:** Once review is done, running `sprout prune` inside the review worktree removes the worktree, closes the Herdr workspace, and deletes the local `review/pr-<number>` branch in a single command.

---

## Zero-Git Greenfield Projects & Transactional Lifecycle

### Starting from Scratch with `sprout new`
To start a new project from an arbitrary directory without an existing Git repo or remote:

```bash
# Greenfield project with discovery agent
sprout new meu_app

# Seeded with an inline idea / prompt
sprout new meu_app -p "Dashboard de pagamentos em Next.js"

# Seeded from a specification document
sprout new meu_app -s specs/prd.md
```

### Transactional Rollback Protection
All worktree and project creation routines operate under an atomic transaction boundary. If an operation is interrupted (`Ctrl+C` / `SIGINT`), terminated, or fails mid-flight:
1. Any allocated Herdr workspace is cleanly closed.
2. The Git worktree is removed (`git worktree remove --force` + `git worktree prune`).
3. The created filesystem directory is cleaned up.
4. The unmerged Git branch is deleted (`git branch -D`).
5. Temporary Netrc/API files are purged.

This guarantees that re-running the command immediately afterwards succeeds with zero stale state or directory/branch conflicts.

