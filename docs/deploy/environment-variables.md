---
title: Variables de Entorno
summary: Referencia completa de variables de entorno
---

Todas las variables de entorno que TaskOrg usa para la configuración del servidor.

## Configuración del Servidor

| Variable | Predeterminado | Descripción |
|----------|---------|-------------|
| `PORT` | `3100` | Puerto del servidor |
| `HOST` | `127.0.0.1` | Enlace de host del servidor |
| `DATABASE_URL` | (embebido) | Cadena de conexión de PostgreSQL |
| `TASKORG_HOME` | `~/.taskorg` | Directorio base para todos los datos de TaskOrg |
| `TASKORG_INSTANCE_ID` | `default` | Identificador de instancia (para múltiples instancias locales) |
| `TASKORG_DEPLOYMENT_MODE` | `local_trusted` | Anulación de modo de runtime |

## Secretos

| Variable | Predeterminado | Descripción |
|----------|---------|-------------|
| `TASKORG_SECRETS_MASTER_KEY` | (del archivo) | Clave de encriptación de 32 bytes (base64/hex/raw) |
| `TASKORG_SECRETS_MASTER_KEY_FILE` | `~/.taskorg/.../secrets/master.key` | Ruta al archivo de clave |
| `TASKORG_SECRETS_STRICT_MODE` | `false` | Requiere referencias secretas para variables env sensibles |

## Agent Runtime (Inyectado en procesos de agentes)

Estos se establecen automáticamente por el servidor al invocar agentes:

| Variable | Descripción |
|----------|-------------|
| `TASKORG_AGENT_ID` | ID único del agente |
| `TASKORG_COMPANY_ID` | ID de compañía |
| `TASKORG_API_URL` | URL base de la API de TaskOrg |
| `TASKORG_API_KEY` | JWT de corta duración para autenticación de API |
| `TASKORG_RUN_ID` | ID de ejecución de heartbeat actual |
| `TASKORG_TASK_ID` | Issue que disparó este despertar |
| `TASKORG_WAKE_REASON` | Razón del disparador de despertar |
| `TASKORG_WAKE_COMMENT_ID` | Comentario que disparó este despertar |
| `TASKORG_APPROVAL_ID` | ID de aprobación resuelto |
| `TASKORG_APPROVAL_STATUS` | Decisión de aprobación |
| `TASKORG_LINKED_ISSUE_IDS` | IDs de issues vinculados separados por comas |

## Claves de Proveedor LLM (para adapters)

| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clave API de Anthropic (para adapter Claude Local) |
| `OPENAI_API_KEY` | Clave API de OpenAI (para adapter Codex Local) |
