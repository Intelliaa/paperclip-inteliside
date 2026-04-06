---
created: 2026-03-11
tags:
  - claude-code
  - skills
  - documentacion-oficial
  - referencia
type: guia
source: https://code.claude.com/docs
---

# Skills de Claude Code - Documentacion Oficial

> Documentacion oficial de Anthropic sobre como crear, gestionar y compartir skills para extender las capacidades de Claude Code. Fuente: code.claude.com/docs

**Temas Clave:** Skills • Frontmatter • Bundled Skills • Subagentes • Inyeccion Dinamica • Permisos • Plugins

**Nota complementaria:** [[Guia Completa - Creacion de Skills para Claude]]

---

## Documentation Index

Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
Use this file to discover all available pages before exploring further.

---

## Que son los Skills

Skills extienden lo que Claude puede hacer. Se crea un archivo `SKILL.md` con instrucciones, y Claude lo agrega a su toolkit. Claude usa skills cuando son relevantes, o se pueden invocar directamente con `/skill-name`.

Los skills de Claude Code siguen el estandar abierto [Agent Skills](https://agentskills.io), que funciona con multiples herramientas de IA. Claude Code extiende el estandar con features adicionales como control de invocacion, ejecucion en subagentes e inyeccion dinamica de contexto.

> **Custom commands se fusionaron con skills.** Un archivo en `.claude/commands/deploy.md` y un skill en `.claude/skills/deploy/SKILL.md` ambos crean `/deploy` y funcionan igual. Los archivos existentes en `.claude/commands/` siguen funcionando.

---

## Bundled Skills

Skills que vienen incluidos con Claude Code, disponibles en cada sesion:

| Skill | Descripcion |
|---|---|
| `/simplify` | Revisa archivos cambiados recientemente buscando reutilizacion, calidad y eficiencia. Lanza 3 agentes de review en paralelo y aplica fixes |
| `/batch <instruccion>` | Orquesta cambios a gran escala en paralelo. Descompone en 5-30 unidades independientes, cada una en un git worktree aislado. Abre PRs individuales |
| `/debug [descripcion]` | Troubleshoot de la sesion actual leyendo el debug log |
| `/loop [intervalo] <prompt>` | Ejecuta un prompt repetidamente en un intervalo. Util para polling de deploys o monitoreo |
| `/claude-api` | Carga material de referencia de la API de Claude para el lenguaje del proyecto. Se activa automaticamente con imports de `anthropic` o `@anthropic-ai/sdk` |

---

## Donde viven los Skills

| Ubicacion | Ruta | Aplica a |
|---|---|---|
| Enterprise | Managed settings | Todos los usuarios de la org |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | Todos tus proyectos |
| Proyecto | `.claude/skills/<skill-name>/SKILL.md` | Solo este proyecto |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Donde el plugin este habilitado |

**Prioridad**: enterprise > personal > project. Los skills de plugin usan namespace `plugin-name:skill-name`.

**Auto-discovery de subdirectorios**: Cuando trabajas con archivos en subdirectorios, Claude Code descubre automaticamente skills en `.claude/skills/` anidados. Soporta monorepos.

### Estructura de un Skill

```
my-skill/
├── SKILL.md           # Instrucciones principales (requerido)
├── template.md        # Template para que Claude llene
├── examples/
│   └── sample.md      # Ejemplo de output esperado
└── scripts/
    └── validate.sh    # Script que Claude puede ejecutar
```

---

## Referencia de Frontmatter

Todos los campos son opcionales. Solo `description` es recomendado.

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read, Grep
model: opus
context: fork
agent: Explore
hooks:
  # hooks scoped to this skill
---
```

| Campo | Requerido | Descripcion |
|---|---|---|
| `name` | No | Nombre del skill. Si se omite, usa el nombre del directorio. Solo minusculas, numeros e hyphens (max 64 chars) |
| `description` | Recomendado | Que hace el skill y cuando usarlo. Claude lo usa para decidir cuando cargarlo automaticamente |
| `argument-hint` | No | Hint durante autocompletado. Ej: `[issue-number]` o `[filename] [format]` |
| `disable-model-invocation` | No | `true` para evitar que Claude lo cargue automaticamente. Para workflows manuales con `/name`. Default: `false` |
| `user-invocable` | No | `false` para ocultar del menu `/`. Para conocimiento de fondo que usuarios no deberian invocar. Default: `true` |
| `allowed-tools` | No | Herramientas que Claude puede usar sin pedir permiso cuando el skill esta activo |
| `model` | No | Modelo a usar cuando el skill esta activo |
| `context` | No | `fork` para ejecutar en un subagente aislado |
| `agent` | No | Tipo de subagente cuando `context: fork`. Opciones: `Explore`, `Plan`, `general-purpose`, o custom |
| `hooks` | No | Hooks scoped al lifecycle del skill |

---

## Sustituciones de Variables

| Variable | Descripcion |
|---|---|
| `$ARGUMENTS` | Todos los argumentos pasados al invocar el skill |
| `$ARGUMENTS[N]` | Argumento especifico por indice (0-based). Ej: `$ARGUMENTS[0]` |
| `$N` | Shorthand para `$ARGUMENTS[N]`. Ej: `$0`, `$1` |
| `${CLAUDE_SESSION_ID}` | ID de la sesion actual |
| `${CLAUDE_SKILL_DIR}` | Directorio que contiene el `SKILL.md` del skill |

**Ejemplo:**

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

Invocacion: `/migrate-component SearchBar React Vue`

---

## Control de Invocacion

| Frontmatter | Tu puedes invocar | Claude puede invocar | Cuando se carga en contexto |
|---|---|---|---|
| (default) | Si | Si | Descripcion siempre en contexto, skill completo al invocar |
| `disable-model-invocation: true` | Si | No | Descripcion NO en contexto, skill carga cuando tu lo invocas |
| `user-invocable: false` | No | Si | Descripcion siempre en contexto, skill carga cuando es invocado |

---

## Tipos de Contenido

### Contenido de referencia

Agrega conocimiento que Claude aplica al trabajo actual. Convenciones, patrones, guias de estilo, conocimiento de dominio. Se ejecuta inline.

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

### Contenido de tarea

Instrucciones paso a paso para una accion especifica. Deployments, commits, generacion de codigo. Mejor con `disable-model-invocation: true`.

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

---

## Inyeccion Dinamica de Contexto

La sintaxis `` !`command` `` ejecuta comandos shell ANTES de que el contenido del skill se envie a Claude. El output reemplaza el placeholder.

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

Esto es **preprocesamiento** — Claude solo ve el resultado final con los datos reales.

> Para habilitar extended thinking en un skill, incluir la palabra "ultrathink" en el contenido.

---

## Ejecucion en Subagentes

Agregar `context: fork` cuando quieras que el skill se ejecute en aislamiento. El contenido del skill se convierte en el prompt del subagente. No tendra acceso al historial de conversacion.

| Approach | System prompt | Task | Tambien carga |
|---|---|---|---|
| Skill con `context: fork` | Del tipo de agent (`Explore`, `Plan`, etc.) | Contenido de SKILL.md | CLAUDE.md |
| Subagent con campo `skills` | Body markdown del subagent | Mensaje de delegacion de Claude | Skills precargados + CLAUDE.md |

**Ejemplo: Skill de research con Explore agent:**

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

El campo `agent` puede ser: `Explore`, `Plan`, `general-purpose`, o cualquier custom subagent de `.claude/agents/`.

---

## Restriccion de Herramientas

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

---

## Control de Permisos

Tres formas de controlar que skills puede invocar Claude:

1. **Deshabilitar todos los skills**: Denegar `Skill` en `/permissions`
2. **Allow/deny especificos**: `Skill(commit)`, `Skill(review-pr *)`, `Skill(deploy *)` en reglas de permisos
3. **Ocultar individualmente**: `disable-model-invocation: true` en frontmatter

---

## Archivos de Soporte

Mantener `SKILL.md` bajo 500 lineas. Mover material de referencia detallado a archivos separados.

```
my-skill/
├── SKILL.md (requerido - overview y navegacion)
├── reference.md (docs detallados de API - carga bajo demanda)
├── examples.md (ejemplos de uso - carga bajo demanda)
└── scripts/
    └── helper.py (script utilitario - se ejecuta, no se carga)
```

Referenciar desde SKILL.md para que Claude sepa que contiene cada archivo:

```markdown
## Additional resources
- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

---

## Distribucion y Sharing

- **Skills de proyecto**: Commit `.claude/skills/` a version control
- **Plugins**: Crear directorio `skills/` en el plugin
- **Managed**: Deploy org-wide via managed settings

---

## Troubleshooting

| Problema | Solucion |
|---|---|
| Skill no se activa | Revisar que description incluye keywords que el usuario diria naturalmente |
| Skill se activa demasiado | Hacer description mas especifica o usar `disable-model-invocation: true` |
| Claude no ve todos los skills | Muchos skills pueden exceder el budget de caracteres (2% de context window). Verificar con `/context`. Override con `SLASH_COMMAND_TOOL_CHAR_BUDGET` |

---

## Conexiones

- [[Guia Completa - Creacion de Skills para Claude]] — Guia practica complementaria
- [[Hooks de Claude Code - Referencia Completa]] — Hooks que se pueden integrar con skills
- [[40 Consejos de Claude Code - Basico a Avanzado 2026]] — Tips generales de Claude Code
- [[Orquestacion del Flujo de Trabajo - Claude Code]] — Workflows que usan skills
- [[Claude Code Avanzado - Tips del Podcast Corres o te Encaramas]] — Tips avanzados incluyendo skills
- [[07 - Contexto via Sistema de Archivos]] — Context engineering con archivos (relevante para SKILL.md)
- [[06 - Diseno de Herramientas]] — Diseno de herramientas y skills como extension

---

*Creado: 11 Mar 2026*
*Fuente: Documentacion oficial de Anthropic — code.claude.com/docs*
