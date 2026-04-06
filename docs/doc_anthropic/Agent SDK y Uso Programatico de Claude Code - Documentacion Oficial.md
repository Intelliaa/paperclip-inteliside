---
created: 2026-03-12
tags:
  - claude-code
  - agent-sdk
  - automatizacion
  - cli
  - documentacion-oficial
type: guia
source: https://code.claude.com/docs/sdk
---

# Agent SDK y Uso Programatico de Claude Code - Documentacion Oficial

> Guia oficial para ejecutar Claude Code mediante programacion desde la CLI, Python o TypeScript usando el Agent SDK.

---

## Que es el Agent SDK

El Agent SDK proporciona las mismas herramientas, bucle de agente y gestion de contexto que potencian Claude Code. Disponible como:

- **CLI** (`claude -p`) para scripts e CI/CD
- **Python** y **TypeScript** para control programatico completo

> La CLI se llamaba anteriormente "modo sin interfaz" (headless mode). La bandera `-p` y todas las opciones funcionan igual.

---

## Uso basico

Agregar `-p` (o `--print`) a cualquier comando `claude` para ejecutarlo de forma no interactiva:

```bash
claude -p "What does the auth module do?"
```

Todas las opciones de CLI funcionan con `-p`:
- `--continue` para continuar conversaciones
- `--allowedTools` para aprobar herramientas automaticamente
- `--output-format` para salida estructurada

---

## Salida estructurada

### Formatos disponibles

| Formato | Uso |
|---|---|
| `text` (default) | Texto plano |
| `json` | JSON con resultado, ID de sesion y metadatos |
| `stream-json` | JSON delimitado por saltos de linea en tiempo real |

### Ejemplo basico

```bash
claude -p "Summarize this project" --output-format json
```

### Con JSON Schema

Para salida que se ajuste a un esquema especifico:

```bash
claude -p "Extract the main function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

La salida estructurada aparece en el campo `structured_output` de la respuesta.

### Extraer campos con jq

```bash
# Extraer resultado de texto
claude -p "Summarize this project" --output-format json | jq -r '.result'

# Extraer salida estructurada
claude -p "Extract function names" \
  --output-format json \
  --json-schema '...' \
  | jq '.structured_output'
```

---

## Streaming en tiempo real

Recibir tokens a medida que se generan:

```bash
claude -p "Explain recursion" --output-format stream-json --verbose --include-partial-messages
```

Filtrar solo deltas de texto:

```bash
claude -p "Write a poem" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

---

## Aprobar herramientas automaticamente

`--allowedTools` permite que Claude use herramientas sin solicitar confirmacion:

```bash
claude -p "Run the test suite and fix any failures" \
  --allowedTools "Bash,Read,Edit"
```

Usa sintaxis de regla de permiso. El `*` final habilita coincidencia de prefijo:

```bash
# Bash(git diff *) permite cualquier comando que empiece con "git diff"
# El espacio antes de * es importante: sin el, tambien coincidiria con "git diff-index"
claude -p "Look at my staged changes and create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

> Las skills invocadas por el usuario (`/commit`) y comandos integrados solo estan disponibles en modo interactivo. En modo `-p`, describir la tarea directamente.

---

## Personalizar el system prompt

### Agregar instrucciones (mantiene comportamiento default)

```bash
gh pr diff "$1" | claude -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

### Reemplazar completamente

Usar `--system-prompt` para reemplazar el prompt default completo.

---

## Continuar conversaciones

### Continuar la mas reciente

```bash
claude -p "Review this codebase for performance issues"
claude -p "Now focus on the database queries" --continue
claude -p "Generate a summary of all issues found" --continue
```

### Reanudar sesion especifica

```bash
session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')
claude -p "Continue that review" --resume "$session_id"
```

---

## Patrones de uso comunes

### Linter personalizado en package.json

```json
{
  "scripts": {
    "lint:claude": "claude -p 'you are a linter. look at changes vs main and report typos. filename:line on first line, description on second.'"
  }
}
```

### Canalizar entrada/salida

```bash
cat build-error.txt | claude -p 'concisely explain the root cause' > output.txt
```

### Revision de seguridad de PR

```bash
gh pr diff "$PR_NUMBER" | claude -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

### Fan-out para migraciones

```bash
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```

### Crear commit automatico

```bash
claude -p "Look at my staged changes and create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

---

## Modo autonomo seguro

`--dangerously-skip-permissions` omite todas las verificaciones de permisos. Solo usar en sandbox sin acceso a Internet.

Con sandboxing (`/sandbox`) se obtiene autonomia similar con mejor seguridad — define limites por adelantado en vez de omitir verificaciones.

---

## Proximos pasos

- **Agent SDK quickstart**: construir primer agente con Python o TypeScript
- **CLI Reference**: todas las banderas y opciones
- **GitHub Actions**: usar Agent SDK en workflows de GitHub
- **GitLab CI/CD**: usar Agent SDK en pipelines de GitLab

---

## Conexiones

- [[Mejores Practicas para Claude Code - Documentacion Oficial]]
- [[Flujos de Trabajo Comunes en Claude Code - Documentacion Oficial]]
- [[Subagentes de Claude Code - Documentacion Oficial]]
- [[Hooks de Claude Code - Referencia Completa]]
- [[Orquestacion del Flujo de Trabajo - Claude Code]]
- [[Testing en Flujos de Desarrollo con Claude Code]]

---

*Creado: 12 Mar 2026*
