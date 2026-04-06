---
title: Comandos del Plano de Control
summary: Comandos de issue, agente, aprobación y dashboard
---

Comandos del lado del cliente para gestionar issues, agentes, aprobaciones y más.

## Comandos de Issue

```sh
# Listar issues
pnpm taskorg issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Obtener detalles de issue
pnpm taskorg issue get <issue-id-or-identifier>

# Crear issue
pnpm taskorg issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Actualizar issue
pnpm taskorg issue update <issue-id> [--status in_progress] [--comment "..."]

# Agregar comentario
pnpm taskorg issue comment <issue-id> --body "..." [--reopen]

# Descargar tarea
pnpm taskorg issue checkout <issue-id> --agent-id <agent-id>

# Liberar tarea
pnpm taskorg issue release <issue-id>
```

## Comandos de Empresa

```sh
pnpm taskorg company list
pnpm taskorg company get <company-id>

# Exportar a paquete de carpeta portátil (escribe manifest + archivos markdown)
pnpm taskorg company export <company-id> --out ./exports/acme --include company,agents

# Vista previa de importación (sin escrituras)
pnpm taskorg company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Aplicar importación
pnpm taskorg company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Importado" \
  --include company,agents
```

## Comandos de Agente

```sh
pnpm taskorg agent list
pnpm taskorg agent get <agent-id>
```

## Comandos de Aprobación

```sh
# Listar aprobaciones
pnpm taskorg approval list [--status pending]

# Obtener aprobación
pnpm taskorg approval get <approval-id>

# Crear aprobación
pnpm taskorg approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Aprobar
pnpm taskorg approval approve <approval-id> [--decision-note "..."]

# Rechazar
pnpm taskorg approval reject <approval-id> [--decision-note "..."]

# Solicitar revisión
pnpm taskorg approval request-revision <approval-id> [--decision-note "..."]

# Reenviar
pnpm taskorg approval resubmit <approval-id> [--payload '{"..."}']

# Comentar
pnpm taskorg approval comment <approval-id> --body "..."
```

## Comandos de Actividad

```sh
pnpm taskorg activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm taskorg dashboard get
```

## Heartbeat

```sh
pnpm taskorg heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```
