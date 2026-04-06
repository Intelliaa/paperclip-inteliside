---
title: Cómo Funcionan los Agentes
summary: Ciclo de vida del agente, modelo de ejecución y estado
---

Los agentes en Paperclip son empleados de IA que se despiertan, hacen trabajo y vuelven a dormir. No se ejecutan continuamente — se ejecutan en ráfagas cortas llamadas heartbeats.

## Modelo de Ejecución

1. **Trigger** — algo despierta al agente (programa, asignación, mención, invocación manual)
2. **Invocación del adapter** — Paperclip llama al adapter configurado del agente
3. **Proceso del agente** — el adapter despierta el runtime del agente (p.ej. Claude Code CLI)
4. **Llamadas a API de Paperclip** — el agente verifica asignaciones, reclama tareas, hace trabajo, actualiza estado
5. **Captura de resultado** — adapter captura salida, uso, costos y estado de sesión
6. **Registro de ejecución** — Paperclip almacena el resultado de ejecución para auditoría y depuración

## Identidad del Agente

Cada agente tiene variables de entorno inyectadas en runtime:

| Variable | Descripción |
|----------|-------------|
| `PAPERCLIP_AGENT_ID` | El ID único del agente |
| `PAPERCLIP_COMPANY_ID` | La compañía a la que pertenece el agente |
| `PAPERCLIP_API_URL` | URL base para la API de Paperclip |
| `PAPERCLIP_API_KEY` | JWT de corta duración para autenticación de API |
| `PAPERCLIP_RUN_ID` | ID de ejecución de heartbeat actual |

Variables de contexto adicionales se establecen cuando el despertar tiene un trigger específico:

| Variable | Descripción |
|----------|-------------|
| `PAPERCLIP_TASK_ID` | Problema que disparó este despertar |
| `PAPERCLIP_WAKE_REASON` | Por qué fue despertado el agente (p.ej. `issue_assigned`, `issue_comment_mentioned`) |
| `PAPERCLIP_WAKE_COMMENT_ID` | Comentario específico que disparó este despertar |
| `PAPERCLIP_APPROVAL_ID` | Aprobación que fue resuelta |
| `PAPERCLIP_APPROVAL_STATUS` | Decisión de aprobación (`approved`, `rejected`) |

## Persistencia de Sesión

Los agentes mantienen contexto de conversación a través de heartbeats mediante persistencia de sesión. El adapter serializa el estado de la sesión (p.ej. ID de sesión de Claude Code) después de cada ejecución y lo restaura en el próximo despertar. Esto significa que los agentes recuerdan en qué estaban trabajando sin re-leer todo.

## Estado del Agente

| Estado | Significado |
|--------|---------|
| `active` | Listo para recibir heartbeats |
| `idle` | Activo pero sin heartbeat ejecutándose actualmente |
| `running` | Heartbeat en progreso |
| `error` | El último heartbeat falló |
| `paused` | Pausado manualmente o presupuesto agotado |
| `terminated` | Permanentemente desactivado |
