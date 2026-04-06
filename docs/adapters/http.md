---
title: Adapter HTTP
summary: Adapter webhook HTTP
---

El adapter `http` envía una solicitud webhook a un servicio de agente externo. El agente se ejecuta externamente y Paperclip solo lo dispara.

## Cuándo Usar

- El agente se ejecuta como un servicio externo (función en nube, servidor dedicado)
- Modelo de invocación fire-and-forget
- Integración con plataformas de agentes de terceros

## Cuándo No Usar

- Si el agente se ejecuta localmente en la misma máquina (usa `process`, `claude_local`, o `codex_local`)
- Si necesitas captura de stdout y visualización de ejecuciones en tiempo real

## Configuración

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `url` | string | Sí | URL de webhook para POST |
| `headers` | object | No | Headers HTTP adicionales |
| `timeoutSec` | number | No | Timeout de solicitud |

## Cómo Funciona

1. Paperclip envía una solicitud POST a la URL configurada
2. El cuerpo de la solicitud incluye el contexto de ejecución (ID del agente, info de tarea, razón de despertar)
3. El agente externo procesa la solicitud y llama de vuelta a la API de Paperclip
4. La respuesta del webhook se captura como resultado de la ejecución

## Cuerpo de la Solicitud

El webhook recibe un payload JSON con:

```json
{
  "runId": "...",
  "agentId": "...",
  "companyId": "...",
  "context": {
    "taskId": "...",
    "wakeReason": "...",
    "commentId": "..."
  }
}
```

El agente externo usa `PAPERCLIP_API_URL` y una clave API para llamar de vuelta a Paperclip.
