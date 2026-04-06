---
title: Variables de Entorno
summary: Referencia completa de variables de entorno
---

Todas las variables de entorno que Paperclip usa para la configuración del servidor.

## Configuración del Servidor

| Variable | Predeterminado | Descripción |
|----------|---------|-------------|
| `PORT` | `3100` | Puerto del servidor |
| `HOST` | `127.0.0.1` | Enlace de host del servidor |
| `DATABASE_URL` | (embebido) | Cadena de conexión de PostgreSQL |
| `PAPERCLIP_HOME` | `~/.paperclip` | Directorio base para todos los datos de Paperclip |
| `PAPERCLIP_INSTANCE_ID` | `default` | Identificador de instancia (para múltiples instancias locales) |
| `PAPERCLIP_DEPLOYMENT_MODE` | `local_trusted` | Anulación de modo de runtime |

## Secretos

| Variable | Predeterminado | Descripción |
|----------|---------|-------------|
| `PAPERCLIP_SECRETS_MASTER_KEY` | (del archivo) | Clave de encriptación de 32 bytes (base64/hex/raw) |
| `PAPERCLIP_SECRETS_MASTER_KEY_FILE` | `~/.paperclip/.../secrets/master.key` | Ruta al archivo de clave |
| `PAPERCLIP_SECRETS_STRICT_MODE` | `false` | Requiere referencias secretas para variables env sensibles |

## Agent Runtime (Inyectado en procesos de agentes)

Estos se establecen automáticamente por el servidor al invocar agentes:

| Variable | Descripción |
|----------|-------------|
| `PAPERCLIP_AGENT_ID` | ID único del agente |
| `PAPERCLIP_COMPANY_ID` | ID de compañía |
| `PAPERCLIP_API_URL` | URL base de la API de Paperclip |
| `PAPERCLIP_API_KEY` | JWT de corta duración para autenticación de API |
| `PAPERCLIP_RUN_ID` | ID de ejecución de heartbeat actual |
| `PAPERCLIP_TASK_ID` | Issue que disparó este despertar |
| `PAPERCLIP_WAKE_REASON` | Razón del disparador de despertar |
| `PAPERCLIP_WAKE_COMMENT_ID` | Comentario que disparó este despertar |
| `PAPERCLIP_APPROVAL_ID` | ID de aprobación resuelto |
| `PAPERCLIP_APPROVAL_STATUS` | Decisión de aprobación |
| `PAPERCLIP_LINKED_ISSUE_IDS` | IDs de issues vinculados separados por comas |

## Claves de Proveedor LLM (para adapters)

| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clave API de Anthropic (para adapter Claude Local) |
| `OPENAI_API_KEY` | Clave API de OpenAI (para adapter Codex Local) |
