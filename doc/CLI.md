# CLI Reference

TaskOrg CLI now supports both:

- instance setup/diagnostics (`onboard`, `doctor`, `configure`, `env`, `allowed-hostname`)
- control-plane client operations (issues, approvals, agents, activity, dashboard)

## Base Usage

Use repo script in development:

```sh
pnpm taskorg --help
```

First-time local bootstrap + run:

```sh
pnpm taskorg run
```

Choose local instance:

```sh
pnpm taskorg run --instance dev
```

## Deployment Modes

Mode taxonomy and design intent are documented in `doc/DEPLOYMENT-MODES.md`.

Current CLI behavior:

- `taskorg onboard` and `taskorg configure --section server` set deployment mode in config
- runtime can override mode with `TASKORG_DEPLOYMENT_MODE`
- `taskorg run` and `taskorg doctor` do not yet expose a direct `--mode` flag

Target behavior (planned) is documented in `doc/DEPLOYMENT-MODES.md` section 5.

Allow an authenticated/private hostname (for example custom Tailscale DNS):

```sh
pnpm taskorg allowed-hostname dotta-macbook-pro
```

All client commands support:

- `--data-dir <path>`
- `--api-base <url>`
- `--api-key <token>`
- `--context <path>`
- `--profile <name>`
- `--json`

Company-scoped commands also support `--company-id <id>`.

Use `--data-dir` on any CLI command to isolate all default local state (config/context/db/logs/storage/secrets) away from `~/.taskorg`:

```sh
pnpm taskorg run --data-dir ./tmp/taskorg-dev
pnpm taskorg issue list --data-dir ./tmp/taskorg-dev
```

## Context Profiles

Store local defaults in `~/.taskorg/context.json`:

```sh
pnpm taskorg context set --api-base http://localhost:3100 --company-id <company-id>
pnpm taskorg context show
pnpm taskorg context list
pnpm taskorg context use default
```

To avoid storing secrets in context, set `apiKeyEnvVarName` and keep the key in env:

```sh
pnpm taskorg context set --api-key-env-var-name TASKORG_API_KEY
export TASKORG_API_KEY=...
```

## Company Commands

```sh
pnpm taskorg company list
pnpm taskorg company get <company-id>
pnpm taskorg company delete <company-id-or-prefix> --yes --confirm <same-id-or-prefix>
```

Examples:

```sh
pnpm taskorg company delete PAP --yes --confirm PAP
pnpm taskorg company delete 5cbe79ee-acb3-4597-896e-7662742593cd --yes --confirm 5cbe79ee-acb3-4597-896e-7662742593cd
```

Notes:

- Deletion is server-gated by `TASKORG_ENABLE_COMPANY_DELETION`.
- With agent authentication, company deletion is company-scoped. Use the current company ID/prefix (for example via `--company-id` or `TASKORG_COMPANY_ID`), not another company.

## Issue Commands

```sh
pnpm taskorg issue list --company-id <company-id> [--status todo,in_progress] [--assignee-agent-id <agent-id>] [--match text]
pnpm taskorg issue get <issue-id-or-identifier>
pnpm taskorg issue create --company-id <company-id> --title "..." [--description "..."] [--status todo] [--priority high]
pnpm taskorg issue update <issue-id> [--status in_progress] [--comment "..."]
pnpm taskorg issue comment <issue-id> --body "..." [--reopen]
pnpm taskorg issue checkout <issue-id> --agent-id <agent-id> [--expected-statuses todo,backlog,blocked]
pnpm taskorg issue release <issue-id>
```

## Agent Commands

```sh
pnpm taskorg agent list --company-id <company-id>
pnpm taskorg agent get <agent-id>
pnpm taskorg agent local-cli <agent-id-or-shortname> --company-id <company-id>
```

`agent local-cli` is the quickest way to run local Claude/Codex manually as a TaskOrg agent:

- creates a new long-lived agent API key
- installs missing TaskOrg skills into `~/.codex/skills` and `~/.claude/skills`
- prints `export ...` lines for `TASKORG_API_URL`, `TASKORG_COMPANY_ID`, `TASKORG_AGENT_ID`, and `TASKORG_API_KEY`

Example for shortname-based local setup:

```sh
pnpm taskorg agent local-cli codexcoder --company-id <company-id>
pnpm taskorg agent local-cli claudecoder --company-id <company-id>
```

## Approval Commands

```sh
pnpm taskorg approval list --company-id <company-id> [--status pending]
pnpm taskorg approval get <approval-id>
pnpm taskorg approval create --company-id <company-id> --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]
pnpm taskorg approval approve <approval-id> [--decision-note "..."]
pnpm taskorg approval reject <approval-id> [--decision-note "..."]
pnpm taskorg approval request-revision <approval-id> [--decision-note "..."]
pnpm taskorg approval resubmit <approval-id> [--payload '{"...":"..."}']
pnpm taskorg approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm taskorg activity list --company-id <company-id> [--agent-id <agent-id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard Commands

```sh
pnpm taskorg dashboard get --company-id <company-id>
```

## Heartbeat Command

`heartbeat run` now also supports context/api-key options and uses the shared client stack:

```sh
pnpm taskorg heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100] [--api-key <token>]
```

## Local Storage Defaults

Default local instance root is `~/.taskorg/instances/default`:

- config: `~/.taskorg/instances/default/config.json`
- embedded db: `~/.taskorg/instances/default/db`
- logs: `~/.taskorg/instances/default/logs`
- storage: `~/.taskorg/instances/default/data/storage`
- secrets key: `~/.taskorg/instances/default/secrets/master.key`

Override base home or instance with env vars:

```sh
TASKORG_HOME=/custom/home TASKORG_INSTANCE_ID=dev pnpm taskorg run
```

## Storage Configuration

Configure storage provider and settings:

```sh
pnpm taskorg configure --section storage
```

Supported providers:

- `local_disk` (default; local single-user installs)
- `s3` (S3-compatible object storage)
