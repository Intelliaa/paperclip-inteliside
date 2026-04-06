---
title: Adapter Process
summary: Adapter genérico de proceso shell
---

El adapter `process` ejecuta comandos shell arbitrarios. Úsalo para scripts simples, tareas de una sola ejecución, o agentes construidos en marcos personalizados.

## Cuándo Usar

- Ejecutar un script Python que llama a la API de Paperclip
- Ejecutar un loop personalizado del agente
- Cualquier runtime que pueda ser invocado como comando shell

## Cuándo No Usar

- Si necesitas persistencia de sesión entre ejecuciones (usa `claude_local` o `codex_local`)
- Si el agente necesita contexto conversacional entre heartbeats

## Configuración

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `command` | string | Sí | Comando shell a ejecutar |
| `cwd` | string | No | Directorio de trabajo |
| `env` | object | No | Variables de entorno |
| `timeoutSec` | number | No | Timeout del proceso |

## Cómo Funciona

1. Paperclip genera el comando configurado como un proceso hijo
2. Se inyectan variables de entorno estándar de Paperclip (`PAPERCLIP_AGENT_ID`, `PAPERCLIP_API_KEY`, etc.)
3. El proceso se ejecuta hasta completarse
4. El código de salida determina éxito/fallo

## Ejemplo

Un agente que ejecuta un script Python:

```json
{
  "adapterType": "process",
  "adapterConfig": {
    "command": "python3 /path/to/agent.py",
    "cwd": "/path/to/workspace",
    "timeoutSec": 300
  }
}
```

El script puede usar las variables de entorno inyectadas para autenticarse con la API de Paperclip y realizar trabajo.
