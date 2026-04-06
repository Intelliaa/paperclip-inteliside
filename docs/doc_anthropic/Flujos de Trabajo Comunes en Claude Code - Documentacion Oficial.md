---
created: 2026-03-12
tags:
  - claude-code
  - flujos-de-trabajo
  - productividad
  - desarrollo
  - documentacion-oficial
type: guia
source: https://code.claude.com/docs/common-workflows
---

# Flujos de Trabajo Comunes en Claude Code - Documentacion Oficial

> Guias paso a paso oficiales de Anthropic para explorar bases de codigo, corregir errores, refactorizar, probar, crear PRs y gestionar sesiones con Claude Code.

---

## 1. Comprender nuevas bases de codigo

### Descripcion general rapida

```
give me an overview of this codebase
explain the main architecture patterns used here
what are the key data models?
how is authentication handled?
```

Empezar con preguntas amplias y luego reducir a areas especificas. Preguntar por convenciones y glosario de terminos del proyecto.

### Encontrar codigo relevante

```
find the files that handle user authentication
how do these authentication files work together?
trace the login process from front-end to database
```

Usar el lenguaje de dominio del proyecto. Instalar un plugin de inteligencia de codigo para navegacion precisa de simbolos.

---

## 2. Corregir errores

```
I'm seeing an error when I run npm test
suggest a few ways to fix the @ts-ignore in user.ts
update user.ts to add the null check you suggested
```

- Indicar el comando para reproducir el problema y obtener stack trace
- Mencionar pasos para reproducir
- Informar si el error es intermitente o consistente

---

## 3. Refactorizar codigo

```
find deprecated API usage in our codebase
suggest how to refactor utils.js to use modern JavaScript features
refactor utils.js to use ES2024 features while maintaining the same behavior
run tests for the refactored code
```

- Pedir que explique beneficios del enfoque moderno
- Solicitar compatibilidad hacia atras cuando sea necesario
- Refactorizar en incrementos pequenos y comprobables

---

## 4. Usar subagents especializados

### Ver disponibles

```
/agents
```

### Uso automatico

Claude delega automaticamente tareas apropiadas a [[Subagentes de Claude Code - Documentacion Oficial|subagents]] especializados:

```
review my recent code changes for security issues
run all tests and fix any failures
```

### Solicitar explicitamente

```
use the code-reviewer subagent to check the auth module
have the debugger subagent investigate why users can't log in
```

### Crear subagents personalizados

`/agents` → "Create New subagent". Definir:
- Identificador unico que describa el proposito
- Cuando Claude debe usarlo
- Que herramientas puede acceder
- System prompt con rol y comportamiento

Crearlos en `.claude/agents/` para compartir en equipo. Limitar acceso a herramientas a lo que realmente necesita.

---

## 5. Plan Mode para analisis seguro

Plan Mode instruye a Claude para analizar la base de codigo con operaciones de solo lectura.

### Cuando usar

- Implementacion de multiples pasos
- Exploracion de codigo antes de cambiar nada
- Desarrollo interactivo donde se itera en la direccion

### Como activar

- **Durante sesion**: `Shift+Tab` para ciclar modos (Normal → Auto-Accept → Plan)
- **Nueva sesion**: `claude --permission-mode plan`
- **Headless**: `claude --permission-mode plan -p "Analyze the authentication system"`
- **Default global**: En `.claude/settings.json`: `{ "permissions": { "defaultMode": "plan" } }`

### Tip clave

Presionar `Ctrl+G` para abrir el plan en el editor de texto y editarlo directamente antes de que Claude continue.

---

## 6. Trabajar con pruebas

```
find functions in NotificationsService.swift that are not covered by tests
add tests for the notification service
add test cases for edge conditions in the notification service
run the new tests and fix any failures
```

Claude examina archivos de test existentes para coincidir con estilo, frameworks y patrones de asercion. Pedir que identifique edge cases: analiza rutas de codigo y sugiere tests para condiciones de error, valores limite e inputs inesperados.

---

## 7. Crear solicitudes de extraccion (PRs)

### Directo

```
create a pr for my changes
```

### Paso a paso

```
summarize the changes I've made to the authentication module
create a pr
enhance the PR description with more context about the security improvements
```

Cuando crea una PR con `gh pr create`, la sesion se vincula automaticamente. Reanudar con `claude --from-pr <number>`.

---

## 8. Documentacion

```
find functions without proper JSDoc comments in the auth module
add JSDoc comments to the undocumented functions in auth.js
improve the generated documentation with more context and examples
check if the documentation follows our project standards
```

Especificar estilo de documentacion deseado (JSDoc, docstrings, etc.). Solicitar ejemplos. Priorizar APIs publicas, interfaces y logica compleja.

---

## 9. Trabajar con imagenes

### Agregar imagenes a la conversacion

1. Arrastrar y soltar en la ventana
2. Copiar y pegar con `Ctrl+V` (no `Cmd+V`)
3. Proporcionar ruta: `"Analyze this image: /path/to/image.png"`

### Ejemplos

```
What does this image show?
Describe the UI elements in this screenshot
Here's a screenshot of the error. What's causing it?
Generate CSS to match this design mockup
```

`Cmd+Click` (Mac) o `Ctrl+Click` en referencias de imagen para abrirlas.

---

## 10. Archivos y directorios con @

```
Explain the logic in @src/utils/auth.js         # archivo completo
What's the structure of @src/components?          # listado de directorio
Show me the data from @github:repos/owner/repo/issues  # recurso MCP
```

- Rutas pueden ser relativas o absolutas
- Referencias `@` agregan `CLAUDE.md` del directorio y padres al contexto
- Se pueden referenciar multiples archivos: `@file1.js and @file2.js`

---

## 11. Pensamiento extendido (Thinking Mode)

Habilitado por default. Da a Claude espacio para razonar paso a paso antes de responder.

### Configuracion

| Alcance | Como configurar |
|---|---|
| **Nivel de esfuerzo** | `/model` o `CLAUDE_CODE_EFFORT_LEVEL` (bajo, medio, alto) |
| **Ultrathink** | Incluir "ultrathink" en el prompt (fuerza esfuerzo alto para ese turno) |
| **Toggle** | `Option+T` (macOS) / `Alt+T` (Windows/Linux) |
| **Default global** | `/config` → thinking mode |
| **Limite de tokens** | `MAX_THINKING_TOKENS` (env var) |

Para ver el pensamiento: `Ctrl+O` alterna modo verbose.

### Como funciona

- **Opus 4.6**: razonamiento adaptativo — asigna tokens dinamicamente segun nivel de esfuerzo
- **Otros modelos**: presupuesto fijo de hasta 31,999 tokens

> Se cobra por todos los tokens de pensamiento utilizados.

---

## 12. Reanudar conversaciones

### Desde la linea de comandos

```bash
claude --continue         # reanudar la mas reciente
claude --resume           # selector interactivo
claude --resume auth-refactor  # por nombre
claude --from-pr 123      # vinculada a un PR
```

### Dentro de una sesion

```
/resume           # selector
/rename auth-refactor  # nombrar sesion actual
```

### Atajos del selector

| Atajo | Accion |
|---|---|
| `↑`/`↓` | Navegar entre sesiones |
| `→`/`←` | Expandir/contraer sesiones agrupadas |
| `Enter` | Seleccionar y reanudar |
| `P` | Vista previa |
| `R` | Renombrar |
| `/` | Buscar |
| `A` | Alternar entre directorio actual y todos los proyectos |
| `B` | Filtrar por rama git actual |
| `Esc` | Salir |

---

## 13. Git worktrees para sesiones paralelas

Cada sesion necesita su propia copia del codebase para que los cambios no choquen.

### Crear worktrees

```bash
claude --worktree feature-auth    # con nombre
claude --worktree bugfix-123      # otro worktree
claude --worktree                 # nombre auto-generado
```

Se crean en `<repo>/.claude/worktrees/<name>` con rama `worktree-<name>`.

### Worktrees de subagent

Configurar `isolation: worktree` en el frontmatter del subagent, o pedir `"use worktrees for your agents"`.

### Limpieza

- **Sin cambios**: worktree y rama se eliminan automaticamente
- **Con cambios**: Claude pregunta si mantener o eliminar

Agregar `.claude/worktrees/` al `.gitignore`.

---

## 14. Notificaciones

Configurar via `/hooks` → evento `Notification`:

| Matcher | Se activa cuando |
|---|---|
| `permission_prompt` | Claude necesita aprobacion |
| `idle_prompt` | Claude termino y espera |
| `auth_success` | Autenticacion completada |
| `elicitation_dialog` | Claude hace una pregunta |

### Comando por SO

**macOS:**
```bash
osascript -e 'display notification "Claude Code needs your attention" with title "Claude Code"'
```

**Linux:**
```bash
notify-send 'Claude Code' 'Claude Code needs your attention'
```

---

## 15. Claude como utilidad Unix

### En scripts de compilacion

```json
{
  "scripts": {
    "lint:claude": "claude -p 'you are a linter. look at changes vs main and report typos. filename:line on first line, description on second. no other text.'"
  }
}
```

### Canalizar entrada/salida

```bash
cat build-error.txt | claude -p 'concisely explain the root cause' > output.txt
```

### Formatos de salida

```bash
claude -p 'summarize' --output-format text > summary.txt     # texto plano
claude -p 'analyze' --output-format json > analysis.json      # JSON con metadatos
claude -p 'parse' --output-format stream-json                 # JSON en tiempo real
```

---

## 16. Preguntar sobre capacidades

Claude tiene acceso a su propia documentacion:

```
can Claude Code create pull requests?
how does Claude Code handle permissions?
what skills are available?
how do I use MCP with Claude Code?
how do I configure Claude Code for Amazon Bedrock?
```

---

## Conexiones

- [[Mejores Practicas para Claude Code - Documentacion Oficial]]
- [[Skills de Claude Code - Documentacion Oficial]]
- [[Subagentes de Claude Code - Documentacion Oficial]]
- [[Hooks de Claude Code - Referencia Completa]]
- [[Equipos de Agentes en Claude Code - Documentacion Oficial]]
- [[Orquestacion del Flujo de Trabajo - Claude Code]]
- [[Testing en Flujos de Desarrollo con Claude Code]]
- [[40 Consejos de Claude Code - Basico a Avanzado 2026]]

---

*Creado: 12 Mar 2026*
