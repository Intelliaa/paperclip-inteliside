---
created: 2026-03-12
tags:
  - claude-code
  - mejores-practicas
  - productividad
  - desarrollo
  - documentacion-oficial
type: guia
source: https://code.claude.com/docs/best-practices
---

# Mejores Practicas para Claude Code - Documentacion Oficial

> Guia oficial de Anthropic con patrones probados para aprovechar al maximo Claude Code: desde configurar el entorno hasta escalar con sesiones paralelas.

---

## Principio Fundamental

La mayoria de las mejores practicas se basan en una restriccion central: **la ventana de contexto se llena rapidamente y el rendimiento se degrada a medida que se llena**. La ventana de contexto es el recurso mas importante a gestionar.

---

## 1. De a Claude una forma de verificar su trabajo

**Esta es la accion de mayor apalancamiento que puede hacer.**

Claude funciona dramaticamente mejor cuando puede verificar su propio trabajo: ejecutar pruebas, comparar capturas de pantalla, validar salidas.

| Estrategia | Antes | Despues |
|---|---|---|
| **Proporcionar criterios de verificacion** | "implementar funcion que valide emails" | "escribir validateEmail. casos de prueba: user@example.com es true, invalid es false. ejecutar tests despues" |
| **Verificar cambios de UI visualmente** | "hacer que el dashboard se vea mejor" | "[pegar screenshot] implementar este diseno. tomar screenshot del resultado y comparar con el original" |
| **Abordar causas raiz** | "la compilacion falla" | "la compilacion falla con este error: [pegar]. corregirlo y verificar que compile. abordar causa raiz, no suprimir error" |

La verificacion puede ser un conjunto de tests, un linter, un comando Bash o la [[Skills de Claude Code - Documentacion Oficial|extension Chrome]] para UI.

---

## 2. Explore primero, luego planifique, luego codifique

Separar investigacion y planificacion de la implementacion evita resolver el problema incorrecto.

### Flujo recomendado en 4 fases

1. **Explorar** — Entrar en Plan Mode. Claude lee archivos y responde preguntas sin hacer cambios
2. **Planificar** — Pedir a Claude un plan de implementacion detallado. `Ctrl+G` para editar el plan directamente
3. **Implementar** — Volver a Normal Mode y dejar que Claude codifique verificando contra el plan
4. **Confirmar** — Pedir commit descriptivo y crear PR

> Plan Mode agrega overhead. Para tareas donde el alcance es claro (corregir typo, agregar log, renombrar variable), pedir que lo haga directamente.

---

## 3. Proporcione contexto especifico

Cuanto mas precisas las instrucciones, menos correcciones necesarias.

| Estrategia | Antes | Despues |
|---|---|---|
| **Delimitar la tarea** | "agregar tests para foo.py" | "escribir test para foo.py cubriendo caso donde usuario cerro sesion. evitar mocks" |
| **Senalar fuentes** | "por que ExecutionFactory tiene API extrana?" | "revisar git history de ExecutionFactory y resumir como llego a ser asi" |
| **Referenciar patrones existentes** | "agregar widget de calendario" | "ver como se implementan widgets existentes. HotDogWidget.php es buen ejemplo. seguir patron" |
| **Describir el sintoma** | "arreglar error de login" | "login falla tras timeout de sesion. verificar flujo auth en src/auth/. escribir test que reproduzca, luego corregir" |

### Contenido enriquecido

- **`@` para archivos** en vez de describir donde vive el codigo
- **Pegar imagenes directamente** (copiar/pegar o arrastrar)
- **Proporcionar URLs** de documentacion
- **Canalizar datos**: `cat error.log | claude`
- **Dejar que Claude obtenga lo que necesita** via Bash, MCP o lectura de archivos

---

## 4. Configure su entorno

### CLAUDE.md efectivo

Ejecutar `/init` genera un CLAUDE.md inicial basado en el proyecto. Mantenerlo corto y legible.

**Que incluir:**
- Comandos Bash que Claude no puede adivinar
- Reglas de estilo que difieren de los defaults
- Instrucciones de testing y runners preferidos
- Etiqueta del repo (convenciones de rama, PR)
- Decisiones arquitectonicas especificas
- Peculiaridades del entorno
- Errores comunes o comportamientos no obvios

**Que excluir:**
- Lo que Claude puede descubrir leyendo codigo
- Convenciones estandar que ya conoce
- Documentacion detallada de API (linkear en vez)
- Info que cambia frecuentemente
- Explicaciones largas o tutoriales
- "escribir codigo limpio" y obviedades

> Si Claude sigue ignorando una regla, el archivo probablemente es muy largo y la regla se pierde en el ruido.

Los CLAUDE.md pueden importar archivos con sintaxis `@path/to/import`:

```markdown
See @README.md for project overview and @package.json for available npm commands.
```

**Ubicaciones:**
- `~/.claude/CLAUDE.md` — aplica a todas las sesiones
- `./CLAUDE.md` — raiz del proyecto (compartir con equipo via git)
- `./CLAUDE.local.md` — local, agregar a .gitignore
- Directorios padres/hijos — se cargan contextualmente

### Permisos

- **Listas de permisos**: `/permissions` para permitir herramientas seguras (`npm run lint`, `git commit`)
- **Sandboxing**: `/sandbox` para aislamiento a nivel del SO
- `--dangerously-skip-permissions`: solo en sandbox sin acceso a Internet

### Herramientas CLI

Decir a Claude que use `gh`, `aws`, `gcloud`, `sentry-cli` para servicios externos. Claude aprende tools nuevas: `"Use 'foo-cli-tool --help' to learn about foo tool, then use it to solve A, B, C."`

### Servidores MCP

`claude mcp add` para conectar Notion, Figma, DB, etc. Permiten implementar desde trackers, consultar bases de datos, integrar disenos.

### Hooks

Scripts que se ejecutan automaticamente en puntos especificos. A diferencia de CLAUDE.md (consultivo), los [[Hooks de Claude Code - Referencia Completa|hooks son deterministicos]]. Claude puede escribir hooks: `"Escribir un hook que ejecute eslint despues de cada edicion"`.

### Skills

Archivos `SKILL.md` en `.claude/skills/` para conocimiento de dominio reutilizable. Claude los carga bajo demanda sin inflar cada conversacion. Ver [[Skills de Claude Code - Documentacion Oficial]].

### Subagents personalizados

Definir asistentes especializados en `.claude/agents/` que Claude delega para tareas aisladas. Ver [[Subagentes de Claude Code - Documentacion Oficial]].

### Plugins

`/plugin` para examinar el marketplace. Los [[Skills de Claude Code - Documentacion Oficial|plugins]] agrupan skills, hooks, subagents y MCP en una unidad instalable.

---

## 5. Comuniquese efectivamente

### Hacer preguntas sobre el codebase

Tratar a Claude como un ingeniero senior:
- Como funciona el registro?
- Como hago un nuevo endpoint de API?
- Que hace `async move { ... }` en la linea 134 de `foo.rs`?
- Que casos extremos maneja `CustomerOnboardingFlowImpl`?

### Dejar que Claude lo entreviste

Para features grandes, dejar que Claude pregunte primero:

```
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.
Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs.
Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```

Luego iniciar sesion nueva para ejecutar la spec con contexto limpio.

---

## 6. Gestionar la sesion

### Corregir el curso temprano

- **`Esc`**: detener a Claude a mitad de accion (contexto se conserva)
- **`Esc + Esc`** o **`/rewind`**: restaurar conversacion y/o codigo a checkpoint anterior
- **`"Undo that"`**: revertir cambios
- **`/clear`**: resetear contexto entre tareas no relacionadas

> Si ha corregido a Claude mas de dos veces en el mismo problema, ejecute `/clear` e inicie de nuevo con prompt mas especifico.

### Gestionar contexto agresivamente

- `/clear` frecuentemente entre tareas
- `/compact <instructions>` para control: `/compact Focus on the API changes`
- `Esc + Esc` → "Summarize from here" para compactar parcialmente
- En CLAUDE.md: `"When compacting, always preserve the full list of modified files and any test commands"`

### Subagents para investigacion

Delegue investigacion para no saturar el contexto principal:

```
Use subagents to investigate how our authentication system handles token
refresh, and whether we have any existing OAuth utilities I should reuse.
```

El subagent explora, lee archivos e informa hallazgos en su propia ventana de contexto.

### Checkpoints (rebobinado)

Cada accion crea un checkpoint. `Esc + Esc` o `/rewind` para restaurar. Persisten entre sesiones.

### Reanudar conversaciones

```bash
claude --continue    # Reanudar la mas reciente
claude --resume      # Elegir entre recientes
```

`/rename` para dar nombres descriptivos a sesiones: `"oauth-migration"`, `"debugging-memory-leak"`.

---

## 7. Automatizar y escalar

### Modo no interactivo

```bash
claude -p "Explain what this project does"
claude -p "List all API endpoints" --output-format json
claude -p "Analyze this log file" --output-format stream-json
```

### Multiples sesiones en paralelo

- **App de escritorio**: gestionar multiples sesiones con worktrees aislados
- **Claude Code en la web**: VMs aisladas en la nube
- **[[Equipos de Agentes en Claude Code - Documentacion Oficial|Equipos de agentes]]**: coordinacion automatizada

**Patron Escritor/Revisor:**

| Sesion A (Escritor) | Sesion B (Revisor) |
|---|---|
| `Implement a rate limiter for our API endpoints` | |
| | `Review the rate limiter in @src/middleware/rateLimiter.ts. Look for edge cases, race conditions` |
| `Address this feedback: [output de Sesion B]` | |

### Abanico a traves de archivos

Para migraciones grandes, distribuir trabajo entre invocaciones paralelas:

```bash
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```

---

## 8. Patrones de fallo comunes

| Patron | Problema | Solucion |
|---|---|---|
| **Sesion de todo incluido** | Mezclar tareas no relacionadas satura el contexto | `/clear` entre tareas |
| **Corregir una y otra vez** | Contexto contaminado con enfoques fallidos | Tras 2 correcciones, `/clear` y prompt mejor |
| **CLAUDE.md sobre-especificado** | Claude ignora reglas importantes entre el ruido | Eliminar despiadadamente. Si Claude ya lo hace bien sin la instruccion, quitarla |
| **Brecha confianza-verificacion** | Codigo plausible que no maneja edge cases | Siempre proporcionar verificacion (tests, scripts, screenshots) |
| **Exploracion infinita** | Claude lee cientos de archivos llenando contexto | Delimitar investigaciones o usar subagents |

---

## 9. Desarrollar intuicion

Los patrones no son reglas absolutas. Prestar atencion a:

- **Cuando Claude produce excelente output**: notar la estructura del prompt, el contexto proporcionado, el modo usado
- **Cuando Claude lucha**: preguntar por que — contexto ruidoso? prompt vago? tarea muy grande?
- **Cuando romper las reglas**: a veces dejar contexto acumularse es correcto, a veces un prompt vago es mejor para explorar

> Con el tiempo, se desarrolla una intuicion que ninguna guia puede capturar: cuando ser especifico vs abierto, cuando planificar vs explorar, cuando limpiar contexto vs dejarlo acumular.

---

## Conexiones

- [[40 Consejos de Claude Code - Basico a Avanzado 2026]]
- [[Skills de Claude Code - Documentacion Oficial]]
- [[Subagentes de Claude Code - Documentacion Oficial]]
- [[Hooks de Claude Code - Referencia Completa]]
- [[Equipos de Agentes en Claude Code - Documentacion Oficial]]
- [[Orquestacion del Flujo de Trabajo - Claude Code]]
- [[Testing en Flujos de Desarrollo con Claude Code]]
- [[09 - Optimizacion de Contexto]]

---

*Creado: 12 Mar 2026*
