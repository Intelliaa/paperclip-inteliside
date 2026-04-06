---
created: 2026-03-11
tags:
  - claude-code
  - subagentes
  - documentacion-oficial
  - referencia
type: guia
source: https://code.claude.com/docs
---

# Subagentes de Claude Code - Documentacion Oficial

> Documentacion oficial de Anthropic sobre como crear y utilizar subagentes de IA especializados en Claude Code para flujos de trabajo especificos y mejor gestion del contexto. Fuente: code.claude.com/docs

**Temas Clave:** Subagentes • Delegacion Automatica • Frontmatter • Herramientas • Permisos • Hooks • Memoria Persistente • Plugins

**Nota complementaria:** [[Skills de Claude Code - Documentacion Oficial]]

---

## Documentation Index

Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
Use this file to discover all available pages before exploring further.

---

## Que son los Subagentes

Los subagentes son asistentes de IA especializados que manejan tipos especificos de tareas. Cada subagente se ejecuta en su propia ventana de contexto con un mensaje del sistema personalizado, acceso a herramientas especificas y permisos independientes.

Cuando Claude encuentra una tarea que coincide con la descripcion de un subagente, delega en ese subagente, que trabaja de forma independiente y devuelve resultados.

> Si necesitas multiples agentes trabajando en paralelo y comunicandose entre si, consulta **agent teams** en su lugar. Los subagentes funcionan dentro de una unica sesion; los equipos de agentes se coordinan entre sesiones separadas.

### Para que sirven

- **Preservar contexto** — mantener exploracion e implementacion fuera de la conversacion principal
- **Aplicar restricciones** — limitar que herramientas puede usar un subagente
- **Reutilizar configuraciones** — subagentes a nivel de usuario disponibles en todos los proyectos
- **Especializar comportamiento** — mensajes del sistema enfocados para dominios especificos
- **Controlar costos** — enrutar tareas a modelos mas rapidos y economicos como Haiku

---

## Subagentes Integrados

| Subagente | Modelo | Herramientas | Proposito |
|---|---|---|---|
| **Explore** | Haiku (rapido) | Solo lectura (sin Write/Edit) | Descubrimiento de archivos, busqueda de codigo, exploracion. Niveles: quick, medium, very thorough |
| **Plan** | Hereda del principal | Solo lectura (sin Write/Edit) | Investigacion de base de codigo para planificacion (usado en plan mode) |
| **General-purpose** | Hereda del principal | Todas | Investigacion compleja, operaciones multi-paso, modificaciones de codigo |
| **Bash** | Hereda | Terminal | Ejecutar comandos en contexto separado |
| **statusline-setup** | Sonnet | - | Cuando ejecutas `/statusline` |
| **Claude Code Guide** | Haiku | - | Cuando haces preguntas sobre features de Claude Code |

---

## Donde Viven los Subagentes

| Ubicacion | Alcance | Prioridad | Como crear |
|---|---|---|---|
| Flag CLI `--agents` | Sesion actual | 1 (mas alta) | JSON al lanzar Claude Code |
| `.claude/agents/` | Proyecto actual | 2 | Interactivo o manual |
| `~/.claude/agents/` | Todos tus proyectos | 3 | Interactivo o manual |
| Directorio `agents/` del plugin | Donde el plugin este habilitado | 4 (mas baja) | Instalado con plugins |

Cuando multiples subagentes comparten el mismo nombre, la ubicacion de mayor prioridad gana.

---

## Crear Subagentes

### Con el comando /agents (recomendado)

```
/agents
```

Permite ver, crear, editar y eliminar subagentes con interfaz interactiva. Opciones:
- Create new agent (User-level o Project-level)
- Generate with Claude (describe lo que quieres y Claude genera la config)
- Seleccionar herramientas, modelo y color

Para listar desde CLI sin sesion interactiva: `claude agents`

### Manualmente (archivos Markdown)

Los subagentes se definen en archivos Markdown con frontmatter YAML seguido del mensaje del sistema:

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

> Los subagentes se cargan al inicio de sesion. Si creas uno manualmente, reinicia la sesion o usa `/agents` para cargarlo inmediatamente.

### Via CLI (efimero, para testing/automatizacion)

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

Solo existe para esa sesion. No se guarda en disco.

---

## Referencia de Frontmatter

| Campo | Requerido | Descripcion |
|---|---|---|
| `name` | Si | Identificador unico (minusculas y guiones) |
| `description` | Si | Cuando Claude debe delegar en este subagente |
| `tools` | No | Herramientas que puede usar. Hereda todas si se omite |
| `disallowedTools` | No | Herramientas a denegar (lista negra) |
| `model` | No | `sonnet`, `opus`, `haiku`, o `inherit`. Default: `inherit` |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, o `plan` |
| `maxTurns` | No | Maximo de turnos agentivos antes de detenerse |
| `skills` | No | Skills a precargar en el contexto del subagente al inicio |
| `mcpServers` | No | Servidores MCP disponibles para el subagente |
| `hooks` | No | Hooks de ciclo de vida limitados al subagente |
| `memory` | No | Alcance de memoria persistente: `user`, `project`, o `local` |
| `background` | No | `true` para siempre ejecutar como tarea de fondo. Default: `false` |
| `isolation` | No | `worktree` para ejecutar en git worktree temporal aislado |

---

## Modelos Disponibles

- **`sonnet`** — Equilibrio entre capacidad y velocidad
- **`opus`** — Mas capaz, mas lento
- **`haiku`** — Rapido, baja latencia, economico
- **`inherit`** — Usa el modelo de la conversacion principal (default)

---

## Modos de Permiso

| Modo | Comportamiento |
|---|---|
| `default` | Verificacion de permiso estandar con solicitudes |
| `acceptEdits` | Auto-aceptar ediciones de archivo |
| `dontAsk` | Auto-denegar solicitudes de permiso (herramientas permitidas si funcionan) |
| `bypassPermissions` | Omitir TODAS las verificaciones de permiso (usar con cuidado) |
| `plan` | Plan mode — exploracion de solo lectura |

Si el principal usa `bypassPermissions`, toma precedencia y no puede ser anulado.

---

## Control de Herramientas

### Lista blanca (tools)

```yaml
tools: Read, Grep, Glob, Bash
```

### Lista negra (disallowedTools)

```yaml
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
```

### Restringir que subagentes puede generar

```yaml
# Solo puede generar worker y researcher
tools: Agent(worker, researcher), Read, Bash

# Puede generar cualquier subagente
tools: Agent, Read, Bash

# Si Agent se omite, no puede generar ningun subagente
tools: Read, Bash
```

> `Agent(agent_type)` solo aplica a agentes ejecutados como hilo principal con `claude --agent`. Los subagentes no pueden generar otros subagentes.

### Deshabilitar subagentes especificos

En `settings.json`:

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

O via CLI: `claude --disallowedTools "Agent(Explore)"`

---

## Precarga de Skills en Subagentes

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

El contenido **completo** de cada skill se inyecta en el contexto del subagente (no solo se pone disponible para invocacion). Los subagentes NO heredan skills de la conversacion principal.

> Esto es lo inverso de `context: fork` en skills. Con `skills` en un subagente, el subagente controla el system prompt y carga contenido de skill. Con `context: fork` en una skill, el contenido de la skill se inyecta en el agente especificado.

---

## Memoria Persistente

El campo `memory` le da al subagente un directorio persistente que sobrevive entre conversaciones.

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

| Alcance | Ubicacion | Cuando usarlo |
|---|---|---|
| `user` | `~/.claude/agent-memory/<name>/` | Recordar aprendizajes en todos los proyectos (recomendado) |
| `project` | `.claude/agent-memory/<name>/` | Conocimiento especifico del proyecto, compartible via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Especifico del proyecto pero NO en version control |

Cuando esta habilitado:
- El system prompt incluye instrucciones para leer/escribir en el directorio de memoria
- Se incluyen las primeras 200 lineas de `MEMORY.md` del directorio
- Read, Write y Edit se habilitan automaticamente

### Tips de memoria

- Pedir al subagente que consulte su memoria antes de trabajar
- Pedir que actualice su memoria despues de completar tareas
- Incluir instrucciones de memoria en el markdown del subagente para mantenimiento proactivo

---

## Hooks para Subagentes

### En frontmatter del subagente (scoped)

Solo se ejecutan mientras ese subagente esta activo:

```yaml
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh $TOOL_INPUT"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

| Evento | Matcher input | Cuando se dispara |
|---|---|---|
| `PreToolUse` | Nombre de herramienta | Antes de que el subagente use una herramienta |
| `PostToolUse` | Nombre de herramienta | Despues de que el subagente usa una herramienta |
| `Stop` | (ninguno) | Cuando el subagente termina (convertido a `SubagentStop`) |

### En settings.json (nivel de proyecto)

Para responder a eventos de ciclo de vida en la sesion principal:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

---

## Ejecucion: Primer Plano vs Fondo

### Primer plano (bloqueante)

- Bloquea la conversacion principal hasta completarse
- Solicitudes de permiso y preguntas se pasan al usuario

### Fondo (concurrente)

- Se ejecuta mientras continuas trabajando
- Claude pre-solicita permisos necesarios antes de lanzar
- Auto-deniega permisos no pre-aprobados
- Si necesita preguntas aclaratorias, la llamada falla pero continua

Controles:
- Pedir a Claude "run this in the background"
- **Ctrl+B** para poner en fondo una tarea en ejecucion
- `background: true` en frontmatter para siempre ejecutar en fondo
- Deshabilitar con `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`

---

## Patrones de Uso

### Aislar operaciones de alto volumen

```
Use a subagent to run the test suite and report only the failing tests
```

La salida detallada permanece en el contexto del subagente; solo el resumen regresa.

### Investigacion en paralelo

```
Research the authentication, database, and API modules in parallel using separate subagents
```

Cada subagente explora independientemente, Claude sintetiza. Funciona mejor cuando las rutas no dependen entre si.

### Encadenar subagentes

```
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

Cada uno completa su tarea y devuelve resultados; Claude pasa contexto al siguiente.

### Cuando usar subagentes vs conversacion principal

| Usar conversacion principal | Usar subagentes |
|---|---|
| Ida y vuelta frecuente | Tarea produce output detallado que no necesitas |
| Multiples fases comparten contexto | Quieres restricciones de herramientas/permisos |
| Cambio rapido y dirigido | Trabajo autonomo que devuelve resumen |
| La latencia importa | - |

---

## Reanudar Subagentes

Cada invocacion crea una instancia nueva. Para continuar trabajo previo:

```
Continue that code review and now analyze the authorization logic
```

Claude reanuda el subagente con el historial completo (llamadas de herramienta, resultados y razonamiento).

Las transcripciones se almacenan en `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl` y persisten independientemente de la conversacion principal.

- **Compactacion principal**: No afecta transcripciones de subagentes
- **Persistencia**: Se pueden reanudar despues de reiniciar (misma sesion)
- **Auto-limpieza**: Basada en `cleanupPeriodDays` (default: 30 dias)
- **Auto-compactacion**: Se activa al ~95% de capacidad. Override con `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`

---

## Ejemplos de Subagentes

### Revisor de Codigo (solo lectura)

```yaml
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability.
tools: Read, Grep, Glob, Bash
model: inherit
---
```

Checklist: claridad, nombres, duplicacion, error handling, secrets, validacion, tests, performance. Output por prioridad: Critical > Warnings > Suggestions.

### Depurador (lectura + edicion)

```yaml
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior.
tools: Read, Edit, Bash, Grep, Glob
---
```

Flujo: capturar error → reproducir → aislar → fix minimal → verificar.

### Cientifico de Datos

```yaml
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights.
tools: Bash, Read, Write
model: sonnet
---
```

### Validador de Queries (con hook de seguridad)

```yaml
---
name: db-reader
description: Execute read-only database queries.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

Script de validacion bloquea INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE con exit code 2.

---

## Mejores Practicas

- **Disenar subagentes enfocados** — cada uno debe sobresalir en una tarea especifica
- **Escribir descripciones detalladas** — Claude usa la descripcion para decidir cuando delegar
- **Limitar acceso a herramientas** — otorgar solo permisos necesarios
- **Verificar en version control** — compartir subagentes de proyecto con el equipo
- Los subagentes **no pueden generar otros subagentes** — si necesitas delegacion anidada, usa Skills o encadena subagentes desde la conversacion principal

---

## Conexiones

- [[Skills de Claude Code - Documentacion Oficial]] — Skills que se pueden precargar en subagentes
- [[Hooks de Claude Code - Referencia Completa]] — Hooks para controlar ciclo de vida de subagentes
- [[Guia Completa - Creacion de Skills para Claude]] — Guia practica de skills
- [[40 Consejos de Claude Code - Basico a Avanzado 2026]] — Tips generales de Claude Code
- [[Orquestacion del Flujo de Trabajo - Claude Code]] — Workflows que usan subagentes
- [[Claude Code Avanzado - Tips del Podcast Corres o te Encaramas]] — Tips avanzados
- [[04 - Patrones Multi-Agente]] — Context engineering con multiples agentes
- [[05 - Sistemas de Memoria]] — Sistemas de memoria para agentes

---

*Creado: 11 Mar 2026*
*Fuente: Documentacion oficial de Anthropic — code.claude.com/docs*
