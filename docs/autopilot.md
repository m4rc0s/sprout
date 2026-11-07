# Autopilot: starting workflows on their own

`sprout autopilot` watches the worktrees of the current repository and reacts to
GitHub pull-request events **without any LLM and without spending tokens**.
It only wakes an agent when something needs it, so the work keeps moving while
you are away from the terminal.

## Commands

```bash
sprout autopilot once [--dry-run]     # evaluate every worktree once, then exit
sprout autopilot run                  # foreground loop (Ctrl+C to stop)
sprout autopilot start                # detached background daemon
sprout autopilot status               # is the daemon running?
sprout autopilot stop                 # stop the daemon
```

Options: `--interval SECONDS` (default 120), `--dry-run` (log what would happen, change nothing).

## Events and default actions

For each worktree (except the one on the default branch) the PR of its branch is
read with `gh pr list --head <branch>`. Each event fires **once**; handled events
are remembered in `<git-common-dir>/sprout/autopilot_state.json`.

| Event | Fires when | Default action |
| :--- | :--- | :--- |
| `pr_changes_requested` | a review requested changes | `check-review` |
| `ci_failed` | a check finished with `FAILURE`/`TIMED_OUT` | `notify` |
| `pr_approved` | the PR is approved | `notify` |
| `pr_merged` | the PR was merged | `notify` |

## Actions

| Action | What it does |
| :--- | :--- |
| `check-review` | runs `sprout check-review <PR>` in the worktree (ingests the review and hands it to the agent) |
| `notify` | writes to the log and sends a desktop notification when `notify-send` exists |
| `prune` | runs `sprout prune --yes` for the worktree (**opt-in only**, destructive) |
| `none` | ignore the event |

## Safety rules

- **Never interrupts a working agent.** If Herdr reports the worktree's agent as
  `working`, the event is deferred to the next tick (not marked as handled).
- **Idempotent.** An event is acted on once; a new review/failure is a new event.
- **No arbitrary commands.** Rules can only pick one of the actions above.
- `prune` is never a default; it must be configured explicitly.

## Configuration (optional)

`<git-common-dir>/sprout/config.toml`:

```toml
[autopilot]
interval = 60                       # seconds between ticks

[autopilot.rules]
pr_changes_requested = "check-review"
ci_failed            = "notify"
pr_approved          = "notify"
pr_merged            = "prune"      # opt in to automatic teardown
```

Only the events you list change; the others keep their default.

## Files

- `<git-common-dir>/sprout/autopilot.pid` – daemon PID
- `<git-common-dir>/sprout/autopilot.log` – daemon log
- `<git-common-dir>/sprout/autopilot_state.json` – handled events
