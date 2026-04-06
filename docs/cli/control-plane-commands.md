---
title: Comandos del Plano de Control
summary: Comandos de issue, agente, aprobación y dashboard
---

Comandos del lado del cliente para gestionar issues, agentes, aprobaciones y más.

## Comandos de Issue

```sh
# Listar issues
pnpm paperclipai issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Obtener detalles de issue
pnpm paperclipai issue get <issue-id-or-identifier>

# Crear issue
pnpm paperclipai issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Actualizar issue
pnpm paperclipai issue update <issue-id> [--status in_progress] [--comment "..."]

# Agregar comentario
pnpm paperclipai issue comment <issue-id> --body "..." [--reopen]

# Descargar tarea
pnpm paperclipai issue checkout <issue-id> --agent-id <agent-id>

# Liberar tarea
pnpm paperclipai issue release <issue-id>
```

## Comandos de Empresa

```sh
pnpm paperclipai company list
pnpm paperclipai company get <company-id>

# Exportar a paquete de carpeta portátil (escribe manifest + archivos markdown)
pnpm paperclipai company export <company-id> --out ./exports/acme --include company,agents

# Vista previa de importación (sin escrituras)
pnpm paperclipai company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Aplicar importación
pnpm paperclipai company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Importado" \
  --include company,agents
```

## Comandos de Agente

```sh
pnpm paperclipai agent list
pnpm paperclipai agent get <agent-id>
```

## Comandos de Aprobación

```sh
# Listar aprobaciones
pnpm paperclipai approval list [--status pending]

# Obtener aprobación
pnpm paperclipai approval get <approval-id>

# Crear aprobación
pnpm paperclipai approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Aprobar
pnpm paperclipai approval approve <approval-id> [--decision-note "..."]

# Rechazar
pnpm paperclipai approval reject <approval-id> [--decision-note "..."]

# Solicitar revisión
pnpm paperclipai approval request-revision <approval-id> [--decision-note "..."]

# Reenviar
pnpm paperclipai approval resubmit <approval-id> [--payload '{"..."}']

# Comentar
pnpm paperclipai approval comment <approval-id> --body "..."
```

## Comandos de Actividad

```sh
pnpm paperclipai activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm paperclipai dashboard get
```

## Heartbeat

```sh
pnpm paperclipai heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```
