# Claude Code Agent Reference Guide

> Master reference for building effective agents, subagents, and agent teams in Claude Code.
> Source: https://code.claude.com/docs/en/agent-teams

---

## Table of Contents

1. [Agent Types Overview](#1-agent-types-overview)
2. [Subagents](#2-subagents)
3. [Agent Teams](#3-agent-teams)
4. [Hooks for Agents](#4-hooks-for-agents)
5. [Cost Management](#5-cost-management)
6. [Decision Guide](#6-decision-guide)
7. [Quick-Reference Patterns](#7-quick-reference-patterns)

---

## 1. Agent Types Overview

| Type | Runs In | Communication | Best For |
|------|---------|---------------|----------|
| **Main conversation** | Single session | Direct with user | Interactive, iterative work |
| **Subagent** | Own context window | Reports back to caller only | Isolated, focused tasks |
| **Agent team teammate** | Own context window | Peers + lead directly | Parallel, collaborative work |

### Built-in Subagents

| Agent | Model | Tools | When Used |
|-------|-------|-------|-----------|
| **Explore** | Haiku | Read-only | File discovery, codebase search |
| **Plan** | Inherits | Read-only | Research during plan mode |
| **General-purpose** | Inherits | All | Complex multi-step tasks |
| **Bash** | Inherits | Bash | Terminal commands in separate context |
| **statusline-setup** | Sonnet | Read, Edit | `/statusline` configuration |
| **Claude Code Guide** | Haiku | Web, Read | Questions about Claude Code features |

---

## 2. Subagents

### Enable & Create

Subagents are defined as Markdown files with YAML frontmatter.

```
/agents          # Interactive UI to create/manage/edit/delete subagents
claude agents    # List all configured subagents (CLI, no session)
```

**File locations (priority order — higher wins):**

| Location | Scope | Priority |
|----------|-------|----------|
| `--agents` CLI flag | Current session only | 1 (highest) |
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All projects | 3 |
| Plugin `agents/` dir | Where plugin enabled | 4 (lowest) |

### Subagent File Format

```markdown
---
name: my-agent                  # required: lowercase + hyphens
description: When Claude should use this agent. Proactively if needed.
tools: Read, Grep, Glob, Bash   # allowlist; omit to inherit all
disallowedTools: Write, Edit    # denylist; applied before tools
model: sonnet                   # sonnet | opus | haiku | full-id | inherit
permissionMode: default         # default | acceptEdits | dontAsk | bypassPermissions | plan
maxTurns: 10                    # optional turn limit
memory: user                    # user | project | local (persistent memory)
background: false               # true = always run as background task
effort: medium                  # low | medium | high | max (Opus 4.6 only)
isolation: worktree             # run in isolated git worktree copy
skills:
  - api-conventions             # preload skill content into context
mcpServers:
  - github                      # reference existing server by name
  - playwright:                 # or define inline
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---

System prompt goes here. This is what guides the subagent's behavior.
```

### Key Frontmatter Fields

| Field | Notes |
|-------|-------|
| `name` | Must be unique; used for `@agent-<name>` mentions and `--agent` flag |
| `description` | Claude reads this to decide when to delegate — be specific; add "Use proactively" if desired |
| `tools` | Allowlist: only these tools are available |
| `disallowedTools` | Denylist: removed from inherited or specified list; `disallowedTools` applied first if both set |
| `model` | `inherit` = same as main conversation (default) |
| `permissionMode` | `bypassPermissions` skips all prompts — use with caution |
| `memory` | `user` = `~/.claude/agent-memory/<name>/`; `project` = `.claude/agent-memory/<name>/`; `local` = `.claude/agent-memory-local/<name>/` |
| `isolation` | `worktree` gives agent isolated repo copy; auto-cleaned if no changes |
| `skills` | Full skill content injected at startup (not just available for invocation) |

### Restrict Which Subagents Can Be Spawned

When using `claude --agent coordinator`, control which sub-agents it can spawn:

```yaml
tools: Agent(worker, researcher), Read, Bash  # allowlist: only worker + researcher
tools: Agent, Read, Bash                       # allow any subagent
# omitting Agent entirely = cannot spawn any subagent
```

To block specific subagents globally:
```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

### Invoking Subagents

```text
# Natural language (Claude decides)
Use the code-reviewer subagent to review auth changes

# @-mention (guarantees this subagent runs)
@"code-reviewer (agent)" look at the auth changes

# Whole session as subagent
claude --agent code-reviewer
```

Set a session-wide default in `.claude/settings.json`:
```json
{ "agent": "code-reviewer" }
```

### Foreground vs Background

- **Foreground** (default): blocks main conversation; permission prompts pass through to user
- **Background**: runs concurrently; permissions pre-approved at launch; `AskUserQuestion` fails silently
- Press **Ctrl+B** to background a running task
- Ask: "run this in the background"
- Disable all background tasks: `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`

### Resuming Subagents

Each invocation starts fresh. To resume with full history:
```text
Continue that code review and now analyze the authorization logic
```
Claude uses `SendMessage` with the agent ID to resume. Transcripts stored at:
`~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`

### Persistent Memory

When `memory` is set, subagent gets:
- A persistent directory that survives across conversations
- Auto-injected instructions to read/write memory
- First 200 lines of `MEMORY.md` in context at startup
- Read, Write, Edit tools automatically enabled

**Tips:**
- Tell it to check memory before starting: "Review this PR, and check your memory for patterns you've seen before."
- Tell it to update after finishing: "Now that you're done, save what you learned to your memory."
- Put memory update instructions directly in the system prompt body

### Example Subagents

**Code Reviewer (read-only):**
```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer. When invoked: 1) Run git diff 2) Focus on modified files 3) Begin review immediately.

Review for: readability, naming, duplication, error handling, secrets, input validation, test coverage, performance.
Organize feedback by: Critical (must fix) → Warnings (should fix) → Suggestions (consider).
```

**Debugger (can edit):**
```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, unexpected behavior. Use proactively when encountering issues.
tools: Read, Edit, Bash, Grep, Glob
---

Expert debugger. Workflow: capture error → identify reproduction steps → isolate failure → implement minimal fix → verify.
Provide: root cause, evidence, specific fix, testing approach, prevention recommendations.
```

**DB Read-Only (with hook validation):**
```markdown
---
name: db-reader
description: Execute read-only database queries only.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
SELECT queries only. Explain that you cannot INSERT/UPDATE/DELETE/DROP.
```

Validation script (`chmod +x` required):
```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed." >&2
  exit 2
fi
exit 0
```

---

## 3. Agent Teams

> Requires: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings + Claude Code v2.1.32+

### Enable

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Or set in shell environment. Already configured in `.claude/settings.local.json` for this project.

### Architecture

| Component | Role |
|-----------|------|
| **Team lead** | Main session; creates team, spawns teammates, coordinates work |
| **Teammates** | Separate Claude Code instances; each has own context window |
| **Task list** | Shared work items teammates claim and complete |
| **Mailbox** | Messaging between agents |

Stored locally:
- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

### Starting a Team

Just describe what you want in natural language:
```text
Create an agent team with 3 teammates: one on UX, one on architecture, one as devil's advocate.
Research the best approach for adding real-time collaboration to this app.
```

```text
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

### Display Modes

| Mode | How | When to Use |
|------|-----|-------------|
| `auto` | Split panes if in tmux, else in-process | Default |
| `in-process` | All teammates in main terminal | Any terminal |
| `tmux` | Each teammate in own tmux pane | tmux installed |

Override in settings:
```json
{ "teammateMode": "in-process" }
```

Or per-session:
```bash
claude --teammate-mode in-process
```

**Keyboard shortcuts (in-process mode):**
- `Shift+Down` — cycle through teammates
- `Enter` (on teammate) — view their session
- `Escape` — interrupt current turn
- `Ctrl+T` — toggle task list

### Require Plan Approval

```text
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```
Teammate stays in plan mode → submits plan → lead approves/rejects with feedback → on approval, exits plan mode and implements.

### Task Management

Tasks have states: **pending → in progress → completed**. Tasks can have dependencies (blocked until dependencies complete). File locking prevents race conditions when multiple teammates claim simultaneously.

```text
Ask teammate-1 to claim the database migration task
```

Or teammates self-claim the next unblocked task after finishing.

### Shutting Down

```text
Ask the researcher teammate to shut down   # graceful: teammate can approve or reject
Clean up the team                          # removes shared resources (shut down teammates first)
```

> Always use the **lead** to clean up — never a teammate.

### Teammate Context

Each teammate loads on spawn:
- CLAUDE.md files
- MCP servers
- Skills
- Spawn prompt from lead

Does **not** inherit: lead's conversation history.

**Communication methods:**
- `message` — send to one specific teammate
- `broadcast` — send to all (use sparingly; scales token cost)
- Idle notifications — teammate auto-notifies lead when it stops
- Shared task list — all agents see task status

### Permissions

Teammates start with lead's permission mode. `--dangerously-skip-permissions` on lead propagates to all. Can change individual teammate modes after spawn, but not per-teammate at spawn time.

### When to Use Agent Teams vs Subagents

**Use agent teams when:**
- Teammates need to talk to each other and challenge findings
- Parallel, sustained work that exceeds a single context window
- Complex cross-cutting work (frontend + backend + tests simultaneously)
- Debugging with competing hypotheses

**Use subagents when:**
- Workers only need to report results back (no peer communication)
- Focused, time-limited tasks
- Lower token cost is priority
- Sequential work with dependencies

### Best Use Cases

| Use Case | Why Teams Work |
|----------|----------------|
| Parallel code review | Each reviewer applies different lens (security / perf / tests) simultaneously |
| Debugging with hypotheses | Teammates actively disprove each other → surviving theory is correct |
| New modules | Each teammate owns separate files → no conflicts |
| Cross-layer changes | Frontend, backend, tests each owned by different teammate |

**Recommended team sizes:**
- Start with **3–5 teammates** for most workflows
- ~5–6 tasks per teammate keeps everyone productive
- Scale up only when work genuinely benefits from simultaneity
- Three focused teammates often outperform five scattered ones

### Best Practices

1. **Give enough context in spawn prompt** — teammates don't inherit lead's history
2. **Avoid same-file edits** — two teammates editing the same file = overwrites
3. **Monitor and steer** — don't let teams run unattended too long
4. **Wait for teammates** — if lead starts implementing instead of delegating: `"Wait for your teammates to complete their tasks before proceeding"`
5. **Start with research/review tasks** — lower risk than parallel implementation for first use
6. **Size tasks right** — too small = coordination overhead; too large = risk of wasted effort; aim for self-contained units with clear deliverables

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Teammates not appearing | Press `Shift+Down`; check tmux is in PATH (`which tmux`) |
| Too many permission prompts | Pre-approve operations in `permissions.allow` before spawning |
| Teammate stopped on error | Send instructions directly via `Shift+Down`, or spawn replacement |
| Lead shuts down early | Tell it to keep going; tell it to wait for teammates |
| Orphaned tmux sessions | `tmux ls` → `tmux kill-session -t <name>` |
| Task status lagging | Check if work is done; tell lead to nudge teammate to mark task complete |

### Limitations (Experimental)

- No `/resume` or `/rewind` for in-process teammates
- Task status can lag (teammates sometimes forget to mark complete)
- Shutdown can be slow (waits for current tool call to finish)
- One team per session (clean up before starting new one)
- No nested teams (teammates cannot spawn sub-teams)
- Lead is fixed for team lifetime (no leadership transfer)
- Split panes not supported in VS Code integrated terminal, Windows Terminal, or Ghostty

---

## 4. Hooks for Agents

### Subagent Lifecycle Hooks (in `settings.json`)

| Event | Matcher | When |
|-------|---------|------|
| `SubagentStart` | Agent type name | Subagent begins |
| `SubagentStop` | Agent type name | Subagent completes |

```json
{
  "hooks": {
    "SubagentStart": [{ "matcher": "db-agent", "hooks": [{ "type": "command", "command": "./setup.sh" }] }],
    "SubagentStop":  [{ "hooks": [{ "type": "command", "command": "./cleanup.sh" }] }]
  }
}
```

### Agent Team Hooks (in `settings.json`)

#### `TeammateIdle`
Fires when a teammate is about to go idle. Use to enforce quality gates.

**Input:**
```json
{
  "hook_event_name": "TeammateIdle",
  "teammate_name": "researcher",
  "team_name": "my-project",
  "session_id": "...",
  "cwd": "..."
}
```

**Control:**
- `exit 2` → teammate receives stderr as feedback and keeps working
- `{"continue": false, "stopReason": "..."}` → stops teammate entirely

```bash
#!/bin/bash
if [ ! -f "./dist/output.js" ]; then
  echo "Build artifact missing. Run the build before stopping." >&2
  exit 2
fi
exit 0
```

#### `TaskCompleted`
Fires when a task is being marked as completed (via TaskUpdate tool or teammate finishing its turn with in-progress tasks).

**Input:**
```json
{
  "hook_event_name": "TaskCompleted",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

**Control:**
- `exit 2` → task not marked complete; stderr fed back as feedback
- `{"continue": false, "stopReason": "..."}` → stops teammate entirely

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')
if ! npm test 2>&1; then
  echo "Tests failing. Fix before completing: $TASK_SUBJECT" >&2
  exit 2
fi
exit 0
```

**Configuration:**
```json
{
  "hooks": {
    "TeammateIdle":   [{ "hooks": [{ "type": "command", "command": ".claude/hooks/quality-gate.sh" }] }],
    "TaskCompleted":  [{ "hooks": [{ "type": "command", "command": ".claude/hooks/task-check.sh" }] }]
  }
}
```

> Neither `TeammateIdle` nor `TaskCompleted` support matchers — they fire on every occurrence.

### Hooks in Subagent Frontmatter

`Stop` hooks defined in frontmatter are automatically converted to `SubagentStop` at runtime.

---

## 5. Cost Management

### Agent Team Token Costs

- Each teammate = own context window = separate Claude instance
- Token usage ≈ proportional to team size × task length
- Plan mode teammates use ~7× more tokens than standard sessions

**Cost reduction strategies:**
- Use **Sonnet** for teammates (not Opus)
- Keep teams **small** (3–5 teammates)
- Keep **spawn prompts focused** (CLAUDE.md/MCP/skills load automatically)
- **Clean up** teams when done (idle teammates still consume tokens)
- Use small, self-contained tasks per teammate

### General Cost Tips

| Strategy | How |
|----------|-----|
| Track usage | `/cost` (API users) or `/stats` (Max/Pro) |
| Clear between tasks | `/clear` when switching unrelated work |
| Right model per task | Sonnet for most; Opus for complex reasoning; Haiku for simple subagents |
| Reduce MCP overhead | Disable unused servers with `/mcp` |
| Offload verbose ops | Delegate log parsing, test runs to subagents |
| Specific prompts | "add input validation to login function in auth.ts" > "improve this codebase" |
| Plan before implement | `Shift+Tab` for plan mode before complex tasks |

### Rate Limit Reference (API)

| Team Size | TPM/user | RPM/user |
|-----------|----------|----------|
| 1–5 | 200k–300k | 5–7 |
| 5–20 | 100k–150k | 2.5–3.5 |
| 20–50 | 50k–75k | 1.25–1.75 |
| 50–100 | 25k–35k | 0.62–0.87 |
| 100–500 | 15k–20k | 0.37–0.47 |
| 500+ | 10k–15k | 0.25–0.35 |

---

## 6. Decision Guide

```
Is the task self-contained with a clear deliverable?
├── No → Use main conversation (iterative, needs context continuity)
└── Yes →
    Do workers need to talk to each other / challenge findings?
    ├── Yes → Agent Team
    │   ├── Research/review tasks → best starting point
    │   ├── Parallel implementation → ensure no file conflicts
    │   └── Competing hypotheses debugging → explicitly adversarial prompts
    └── No → Subagent(s)
        ├── Single focused task → one subagent
        ├── Multiple independent tasks → parallel subagents
        └── Sequential dependent tasks → chained subagents
```

**Quick heuristics:**
- Need peer communication? → **Agent team**
- Isolated, report-back-only? → **Subagent**
- Reusable prompt/workflow in main context? → **Skill**
- Quick in-context question, no tools? → **`/btw`**
- Too verbose for main context? → **Subagent** (keeps output isolated)

---

## 7. Quick-Reference Patterns

### Parallel Code Review
```text
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review, report findings, and challenge each other's conclusions.
```

### Competing Hypotheses Debugging
```text
Users report the app exits after one message. Spawn 5 agent teammates
to investigate different hypotheses. Have them debate and try to disprove
each other's theories. Update findings.md with whatever consensus emerges.
```

### Parallel Feature Development
```text
Create a team with 3 teammates to implement the notifications feature:
- Teammate 1: database schema and migrations
- Teammate 2: backend API endpoints
- Teammate 3: frontend components
Ensure each owns their own files. Require plan approval before any changes.
```

### Isolated Research Task
```text
Use a subagent to research the best rate-limiting libraries for Express.
Return a comparison table with pros/cons and a recommendation.
```

### Chain for Review → Fix
```text
Use the code-reviewer subagent to find performance issues,
then use the optimizer subagent to fix the top 3 issues it found.
```

### Quality Gate Hook (tests must pass before task closes)
```bash
#!/bin/bash
# .claude/hooks/task-completion-check.sh
INPUT=$(cat)
if ! npm test -- --silent 2>&1 | grep -q "passing"; then
  echo "Tests must pass before task can be marked complete." >&2
  exit 2
fi
exit 0
```

```json
{
  "hooks": {
    "TaskCompleted": [{ "hooks": [{ "type": "command", "command": ".claude/hooks/task-completion-check.sh" }] }]
  }
}
```

---

*Last updated: 2026-03-24. Source: https://code.claude.com/docs/en/agent-teams, /sub-agents, /hooks, /costs*
