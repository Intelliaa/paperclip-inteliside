---
title: Claude Local
summary: Configuración del adapter local de Claude Code
---

El adapter `claude_local` ejecuta el CLI de Claude Code de Anthropic localmente. Soporta persistencia de sesión, inyección de skills, y análisis de salida estructurado.

## Requisitos Previos

- CLI de Claude Code instalado (comando `claude` disponible)
- `ANTHROPIC_API_KEY` establecido en el entorno o configuración del agente

## Campos de Configuración

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `cwd` | string | Sí | Directorio de trabajo para el proceso del agente (ruta absoluta; se crea automáticamente si falta cuando los permisos lo permiten) |
| `model` | string | No | Modelo Claude a usar (ej. `claude-opus-4-6`) |
| `promptTemplate` | string | No | Prompt usado para todas las ejecuciones |
| `env` | object | No | Variables de entorno (soporta referencias secretas) |
| `timeoutSec` | number | No | Timeout del proceso (0 = sin timeout) |
| `graceSec` | number | No | Período de gracia antes de force-kill |
| `maxTurnsPerRun` | number | No | Máximo de turnos agenticos por heartbeat (predeterminado a `300`) |
| `dangerouslySkipPermissions` | boolean | No | Omitir prompts de permiso (predeterminado: `true`); requerido para ejecuciones sin interfaz donde la aprobación interactiva es imposible |

## Plantillas de Prompt

Las plantillas soportan sustitución de `{{variable}}`:

| Variable | Valor |
|----------|-------|
| `{{agentId}}` | ID del agente |
| `{{companyId}}` | ID de compañía |
| `{{runId}}` | ID de ejecución actual |
| `{{agent.name}}` | Nombre del agente |
| `{{company.name}}` | Nombre de la compañía |

## Persistencia de Sesión

El adapter persiste los IDs de sesión de Claude Code entre heartbeats. En el próximo despertar, reanuda la conversación existente para que el agente reetenga el contexto completo.

La reanudación de sesión es sensible a cwd: si el directorio de trabajo del agente cambió desde la última ejecución, se inicia una sesión nueva en su lugar.

Si la reanudación falla con un error de sesión desconocido, el adapter automáticamente reintenta con una sesión nueva.

## Inyección de Skills

El adapter crea un directorio temporal con symlinks a skills de Paperclip y lo pasa a través de `--add-dir`. Esto hace que los skills sean descubribles sin contaminar el directorio de trabajo del agente.

Para uso manual del CLI local fuera de ejecuciones de heartbeat (por ejemplo ejecutando como `claudecoder` directamente), usa:

```sh
pnpm paperclipai agent local-cli claudecoder --company-id <company-id>
```

Esto instala skills de Paperclip en `~/.claude/skills`, crea una clave API del agente, e imprime exports de shell para ejecutar como ese agente.

## Prueba del Entorno

Usa el botón "Test Environment" en la UI para validar la configuración del adapter. Verifica:

- CLI de Claude está instalado y accesible
- El directorio de trabajo es absoluto y está disponible (se crea automáticamente si falta y está permitido)
- Pistas de clave API/modo de autenticación (`ANTHROPIC_API_KEY` vs login de suscripción)
- Una prueba viva de hello (`claude --print - --output-format stream-json --verbose` con prompt `Respond with hello.`) para verificar la disponibilidad del CLI
