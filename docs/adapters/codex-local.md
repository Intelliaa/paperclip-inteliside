---
title: Codex Local
summary: Configuración del adapter local de OpenAI Codex
---

El adapter `codex_local` ejecuta el CLI de Codex de OpenAI localmente. Soporta persistencia de sesión a través de encadenamiento de `previous_response_id` e inyección de skills a través del directorio global de skills de Codex.

## Requisitos Previos

- CLI de Codex instalado (comando `codex` disponible)
- `OPENAI_API_KEY` establecido en el entorno o configuración del agente

## Campos de Configuración

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `cwd` | string | Sí | Directorio de trabajo para el proceso del agente (ruta absoluta; se crea automáticamente si falta cuando los permisos lo permiten) |
| `model` | string | No | Modelo a usar |
| `promptTemplate` | string | No | Prompt usado para todas las ejecuciones |
| `env` | object | No | Variables de entorno (soporta referencias secretas) |
| `timeoutSec` | number | No | Timeout del proceso (0 = sin timeout) |
| `graceSec` | number | No | Período de gracia antes de force-kill |
| `dangerouslyBypassApprovalsAndSandbox` | boolean | No | Omitir verificaciones de seguridad (solo dev) |

## Persistencia de Sesión

Codex usa `previous_response_id` para continuidad de sesión. El adapter serializa y restaura esto entre heartbeats, permitiendo que el agente mantenga el contexto de conversación.

## Inyección de Skills

El adapter crea symlinks de skills de TaskOrg en el directorio global de skills de Codex (`~/.codex/skills`). Los skills existentes del usuario no se sobrescriben.

Cuando TaskOrg se ejecuta dentro de una instancia de worktree gestionada (`TASKORG_IN_WORKTREE=true`), el adapter en su lugar usa un `CODEX_HOME` aislado de worktree bajo la instancia de TaskOrg para que los skills, sesiones, logs, y otros estados de runtime de Codex no se filtren entre checkouts. Siembra ese home aislado desde el home principal de Codex del usuario para continuidad compartida de auth/config.

Para uso manual del CLI local fuera de ejecuciones de heartbeat (por ejemplo ejecutando como `codexcoder` directamente), usa:

```sh
pnpm taskorg agent local-cli codexcoder --company-id <company-id>
```

Esto instala cualquier skill faltante, crea una clave API del agente, e imprime exports de shell para ejecutar como ese agente.

## Resolución de Instrucciones

Si `instructionsFilePath` está configurado, TaskOrg lee ese archivo y lo antepone al prompt stdin enviado a `codex exec` en cada ejecución.

Esto es separado de cualquier descubrimiento de instrucciones a nivel de workspace que Codex mismo realiza en el `cwd` de ejecución. TaskOrg no deshabilita archivos de instrucciones nativos del repo de Codex, así que un `AGENTS.md` local del repo puede aún ser cargado por Codex además de las instrucciones del agente gestionado por TaskOrg.

## Prueba del Entorno

La prueba del entorno verifica:

- CLI de Codex está instalado y accesible
- El directorio de trabajo es absoluto y está disponible (se crea automáticamente si falta y está permitido)
- Señal de autenticación (presencia de `OPENAI_API_KEY`)
- Una prueba viva de hello (`codex exec --json -` con prompt `Respond with hello.`) para verificar que el CLI puede ejecutarse realmente
