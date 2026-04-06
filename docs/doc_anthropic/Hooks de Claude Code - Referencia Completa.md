---
created: 2026-03-10
tags:
  - claude-code
  - automatizacion
  - hooks
  - herramientas
type: guia
---

# Hooks de Claude Code — Referencia Completa

> Referencia técnica de todos los eventos, esquemas JSON, tipos de hooks (command, HTTP, prompt, agent), control de decisiones, y patrones avanzados como hooks async y hooks en skills/agents.

---

## Qué son los hooks

Los hooks son comandos shell, endpoints HTTP o prompts LLM que se ejecutan automáticamente en puntos específicos del ciclo de vida de Claude Code. Permiten automatizar validaciones, bloquear acciones, inyectar contexto y conectar herramientas externas sin modificar el flujo principal.

> Para ejemplos prácticos y quickstart, ver [[Orquestacion del Flujo de Trabajo - Claude Code]].

---

## Ciclo de vida y eventos disponibles

| Evento | Cuándo dispara |
|---|---|
| `SessionStart` | Al iniciar o reanudar una sesión |
| `UserPromptSubmit` | Cuando el usuario envía un prompt, antes de que Claude lo procese |
| `PreToolUse` | Antes de ejecutar una herramienta. Puede bloquearla |
| `PermissionRequest` | Cuando aparece un diálogo de permiso |
| `PostToolUse` | Después de que una herramienta ejecuta exitosamente |
| `PostToolUseFailure` | Después de que una herramienta falla |
| `Notification` | Cuando Claude Code envía una notificación |
| `SubagentStart` | Cuando se lanza un subagente |
| `SubagentStop` | Cuando un subagente termina |
| `Stop` | Cuando Claude termina de responder |
| `TeammateIdle` | Cuando un teammate de un agent team está por quedar idle |
| `TaskCompleted` | Cuando una tarea está siendo marcada como completada |
| `InstructionsLoaded` | Cuando se carga un CLAUDE.md o `.claude/rules/*.md` |
| `ConfigChange` | Cuando cambia un archivo de configuración durante la sesión |
| `WorktreeCreate` | Al crear un worktree — reemplaza el comportamiento git por defecto |
| `WorktreeRemove` | Al eliminar un worktree |
| `PreCompact` | Antes de una operación de compactación de contexto |
| `SessionEnd` | Al terminar una sesión |

---

## Configuración

Los hooks se definen en archivos JSON de settings. Hay tres niveles de anidamiento:

1. **Evento** (`PreToolUse`, `Stop`, etc.)
2. **Matcher group** — filtro de cuándo dispara
3. **Hook handler** — el comando, endpoint, prompt o agente que corre

### Ubicaciones

| Archivo | Alcance | Compartible |
|---|---|---|
| `~/.claude/settings.json` | Todos los proyectos del usuario | No |
| `.claude/settings.json` | Proyecto específico | Sí (se puede commitear) |
| `.claude/settings.local.json` | Proyecto, local | No (gitignored) |
| Plugin `hooks/hooks.json` | Cuando el plugin está activo | Sí |
| Frontmatter de skill/agent | Mientras el componente está activo | Sí |

### Matcher patterns

El campo `matcher` es una regex. Cada evento filtra sobre un campo distinto:

| Evento | Qué filtra el matcher |
|---|---|
| `PreToolUse`, `PostToolUse`, `PermissionRequest` | Nombre de la herramienta |
| `SessionStart` | Cómo inició la sesión (`startup`, `resume`, `clear`, `compact`) |
| `SessionEnd` | Por qué terminó (`clear`, `logout`, etc.) |
| `Notification` | Tipo de notificación |
| `SubagentStart` / `SubagentStop` | Tipo de agente |
| `PreCompact` | Cómo se triggereó (`manual`, `auto`) |
| `ConfigChange` | Fuente de configuración |
| Resto | Sin soporte de matcher — siempre dispara |

**MCP tools** siguen el patrón `mcp__<server>__<tool>`. Ejemplo: `mcp__memory__.*` para todas las tools del servidor memory.

---

## Tipos de hook handlers

### Command hook (`type: "command"`)

Ejecuta un shell command. Recibe el JSON del evento por stdin, comunica resultados por exit codes y stdout.

```json
{
  "type": "command",
  "command": ".claude/hooks/mi-script.sh",
  "timeout": 60,
  "async": false
}
```

### HTTP hook (`type: "http"`)

Envía el JSON del evento como POST a una URL. La respuesta usa el mismo formato JSON que command hooks.

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/pre-tool-use",
  "headers": { "Authorization": "Bearer $MY_TOKEN" },
  "allowedEnvVars": ["MY_TOKEN"]
}
```

### Prompt hook (`type: "prompt"`)

Envía un prompt a un modelo Claude (Haiku por defecto). El modelo devuelve `{ "ok": true/false, "reason": "..." }`.

```json
{
  "type": "prompt",
  "prompt": "Evalúa si Claude debe continuar: $ARGUMENTS. Responde con JSON.",
  "timeout": 30
}
```

### Agent hook (`type: "agent"`)

Lanza un subagente que puede usar herramientas (Read, Grep, Glob) para verificar condiciones antes de retornar decisión. Hasta 50 turnos.

```json
{
  "type": "agent",
  "prompt": "Verifica que todos los tests pasen antes de continuar. $ARGUMENTS",
  "timeout": 120
}
```

---

## Exit codes (command hooks)

| Exit code | Significado |
|---|---|
| `0` | Éxito. Claude Code parsea stdout para JSON output |
| `2` | Error bloqueante. stderr se pasa a Claude como error |
| Cualquier otro | Error no bloqueante. stderr se muestra en verbose mode |

### Comportamiento del exit 2 por evento

| Evento | ¿Puede bloquear? | Qué pasa con exit 2 |
|---|---|---|
| `PreToolUse` | Sí | Bloquea la tool call |
| `PermissionRequest` | Sí | Deniega el permiso |
| `UserPromptSubmit` | Sí | Bloquea el prompt y lo borra |
| `Stop` | Sí | Evita que Claude pare, continúa la conversación |
| `PostToolUse` | No | Muestra stderr a Claude (tool ya ejecutó) |
| `Notification` | No | Muestra stderr al usuario únicamente |
| `WorktreeCreate` | Sí | Cualquier exit no-cero falla la creación |

---

## JSON output (control estructurado)

En lugar de exit codes, salir con `0` y imprimir JSON a stdout. Campos universales:

| Campo | Default | Descripción |
|---|---|---|
| `continue` | `true` | Si `false`, Claude para completamente |
| `stopReason` | none | Mensaje al usuario cuando `continue` es `false` |
| `suppressOutput` | `false` | Oculta stdout del verbose mode |
| `systemMessage` | none | Mensaje de advertencia al usuario |

### Control de decisión por evento

| Evento | Patrón | Campos clave |
|---|---|---|
| `PostToolUse`, `Stop`, `UserPromptSubmit` | `decision` top-level | `decision: "block"`, `reason` |
| `PreToolUse` | `hookSpecificOutput` | `permissionDecision` (allow/deny/ask) |
| `PermissionRequest` | `hookSpecificOutput` | `decision.behavior` (allow/deny) |
| `WorktreeCreate` | Path en stdout | Hook imprime el path absoluto del worktree |

**Ejemplo PreToolUse (deny):**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Comandos destructivos bloqueados"
  }
}
```

**Ejemplo PostToolUse (block con feedback):**
```json
{
  "decision": "block",
  "reason": "Los tests no pasan después de esta edición"
}
```

---

## Hooks async (en segundo plano)

Agregar `"async": true` a un command hook para que corra en segundo plano sin bloquear a Claude. Solo disponible en `type: "command"`.

```json
{
  "type": "command",
  "command": ".claude/hooks/run-tests.sh",
  "async": true,
  "timeout": 300
}
```

- Claude continúa trabajando mientras el hook corre
- Los campos de decisión (`decision`, `permissionDecision`, `continue`) **no tienen efecto** en hooks async
- El output (`systemMessage`, `additionalContext`) se entrega en el siguiente turno de conversación

---

## Hooks en skills y agents

Los hooks pueden definirse en el frontmatter YAML de skills y subagents. Solo activos mientras ese componente está activo, se limpian cuando termina.

```yaml
---
name: secure-operations
description: Operaciones con validación de seguridad
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

- En subagents, los hooks `Stop` se convierten automáticamente en `SubagentStop`
- Soportan el campo `once: true` (solo skills, no agents) para ejecutar una sola vez por sesión

---

## Variables de entorno útiles

| Variable | Disponible en | Descripción |
|---|---|---|
| `$CLAUDE_PROJECT_DIR` | Todos | Raíz del proyecto |
| `${CLAUDE_PLUGIN_ROOT}` | Plugins | Directorio raíz del plugin |
| `$CLAUDE_ENV_FILE` | SessionStart | Path para persistir env vars a comandos Bash futuros |
| `$CLAUDE_CODE_REMOTE` | Todos | `"true"` en entornos web remotos |

---

## Campos de input comunes (todos los eventos)

| Campo | Descripción |
|---|---|
| `session_id` | Identificador de la sesión |
| `transcript_path` | Path al JSON de conversación |
| `cwd` | Directorio de trabajo actual |
| `permission_mode` | Modo de permisos actual |
| `hook_event_name` | Nombre del evento |
| `agent_id` | ID del subagente (solo dentro de subagentes) |
| `agent_type` | Tipo de agente (solo dentro de subagentes) |

---

## Gestión de hooks

- **Ver y gestionar**: `/hooks` en Claude Code — interfaz interactiva
- **Desactivar todos**: `"disableAllHooks": true` en settings
- **Debug**: `claude --debug` — muestra qué hooks matchearon, exit codes y output
- **Verbose mode**: `Ctrl+O` — muestra progreso de hooks en el transcript
- Los cambios externos a hooks no aplican hasta que se revisan en `/hooks` (snapshot al inicio de sesión)

---

## Conexiones

- [[Orquestacion del Flujo de Trabajo - Claude Code]]
- [[40 Consejos de Claude Code - Basico a Avanzado 2026]]
- [[Guia Completa - Creacion de Skills para Claude]]
- [[Base de Conocimiento]]
- [[Context Engineering/05 - Sistemas de Memoria]]

---

*Creado: 10 Mar 2026 — Fuente: Documentación oficial Claude Code*
