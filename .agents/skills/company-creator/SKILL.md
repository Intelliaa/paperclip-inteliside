---
name: company-creator
description: >
  Crear paquetes de compañías de agentes conforme a la especificación Agent Companies
  (agentcompanies/v1). Usar cuando un usuario quiera crear una nueva compañía de agentes
  desde cero, construir una compañía a partir de un repositorio git existente o colección
  de skills, o estructurar un equipo/departamento de agentes. Se activa con: "crear una
  compañía", "hazme una compañía", "construir una compañía desde este repo", "configurar
  una compañía de agentes", "crear un equipo de agentes", "contratar agentes", o cuando
  se proporciona una URL de repositorio y se pide convertirlo en compañía. NO usar para
  importar un paquete de compañía existente (usar el comando import del CLI en su lugar)
  ni para modificar una compañía que ya está ejecutándose en TaskOrg.
---

# Creador de Compañías

Crear paquetes de compañías de agentes que cumplan con la especificación Agent Companies.

Referencias de la especificación:

- Especificación normativa: `docs/companies/companies-spec.md` (leer antes de generar archivos)
- Especificación web: https://agentcompanies.io/specification
- Sitio del protocolo: https://agentcompanies.io/

## Dos Modos

### Modo 1: Compañía Desde Cero

El usuario describe lo que quiere. Entrevístalo para desarrollar la visión y luego genera el paquete.

### Modo 2: Compañía Desde un Repo

El usuario proporciona una URL de repositorio git, ruta local o tweet. Analiza el repositorio y luego crea una compañía que lo envuelva.

Consulta [references/from-repo-guide.md](references/from-repo-guide.md) para los pasos detallados de análisis de repositorios.

## Proceso

### Paso 1: Recopilar Contexto

Determina qué modo aplica:

- **Desde cero**: ¿Qué tipo de compañía o equipo? ¿Qué dominio? ¿Qué deben hacer los agentes?
- **Desde repo**: Clona/lee el repo. Busca skills existentes, configuraciones de agentes, README, estructura del código fuente.

### Paso 2: Entrevista (Usar AskUserQuestion)

No omitas este paso. Usa AskUserQuestion para alinearte con el usuario antes de escribir cualquier archivo.

**Para compañías desde cero**, pregunta sobre:

- Propósito y dominio de la compañía (1-2 oraciones es suficiente)
- Qué agentes necesitan — propón un plan de contratación basado en lo que describieron
- Si es una compañía completa (necesita un CEO) o un equipo/departamento (no requiere CEO)
- Skills específicos que los agentes deban tener
- Cómo fluye el trabajo a través de la organización (ver "Flujo de trabajo" abajo)
- Si quieren proyectos y tareas iniciales

**Para compañías desde repo**, presenta tu análisis y pregunta:

- Confirmar los agentes que planeas crear y sus roles
- Si referenciar o incluir los skills descubiertos (por defecto: referenciar)
- Agentes o skills adicionales más allá de lo que proporciona el repo
- Nombre de la compañía y cualquier personalización
- Confirmar el flujo de trabajo que inferiste del repo (ver "Flujo de trabajo" abajo)

**Flujo de trabajo — ¿cómo se mueve el trabajo a través de esta compañía?**

Una compañía no es solo una lista de agentes con skills. Es una organización que toma ideas y las convierte en productos de trabajo. Necesitas entender el flujo de trabajo para que cada agente sepa:

- Quién le da trabajo y en qué forma (una tarea, una rama, una pregunta, una solicitud de revisión)
- Qué hace con ello
- A quién le entrega cuando termina, y cómo es esa entrega
- Qué significa "terminado" para su rol

**No todas las compañías son un pipeline.** Infiere el patrón de flujo de trabajo correcto según el contexto:

- **Pipeline** — etapas secuenciales, cada agente entrega al siguiente. Usar cuando el repo/dominio tiene un proceso lineal claro (ej. planificar → construir → revisar → enviar → QA, o ideación de contenido → borrador → edición → publicación).
- **Hub-and-spoke** — un gerente delega a especialistas que reportan de forma independiente. Usar cuando los agentes hacen tipos diferentes de trabajo que no se alimentan entre sí (ej. un CEO que despacha a un investigador, un especialista en marketing y un analista).
- **Colaborativo** — los agentes trabajan juntos en las mismas cosas como pares. Usar para equipos pequeños donde todos contribuyen al mismo resultado (ej. un estudio de diseño, un equipo de lluvia de ideas).
- **Bajo demanda** — los agentes son convocados según se necesiten sin flujo fijo. Usar cuando los agentes son más como una caja de herramientas de especialistas que el usuario llama directamente.

Para compañías desde cero, propón un patrón de flujo de trabajo basado en lo que describieron y pregunta si encaja.

Para compañías desde repo, infiere el patrón de la estructura del repositorio. Si los skills tienen una dependencia secuencial clara (como `plan-ceo-review → plan-eng-review → review → ship → qa`), eso es un pipeline. Si los skills son capacidades independientes, es más probable que sea hub-and-spoke o bajo demanda. Declara tu inferencia en la entrevista para que el usuario pueda confirmar o ajustar.

**Principios clave de la entrevista:**

- Propón un plan de contratación concreto. No preguntes abiertamente "¿qué agentes quieres?" — sugiere agentes específicos basados en el contexto y deja que el usuario ajuste.
- Mantén la simplicidad. La mayoría de los usuarios son nuevos en compañías de agentes. Unos pocos agentes (3-5) es típico para una startup. No sugieras 10+ agentes a menos que el alcance lo demande.
- Las compañías desde cero deberían comenzar con un CEO que gestione a todos. Los equipos/departamentos no necesitan uno.
- Haz 2-3 preguntas enfocadas por ronda, no 10.

### Paso 3: Leer la Especificación

Antes de generar cualquier archivo, lee la especificación normativa:

```
docs/companies/companies-spec.md
```

También lee la referencia rápida: [references/companies-spec.md](references/companies-spec.md)

Y el ejemplo: [references/example-company.md](references/example-company.md)

### Paso 4: Generar el Paquete

Crea la estructura de directorios y todos los archivos. Sigue las convenciones de la especificación exactamente.

**Estructura de directorios:**

```
<company-slug>/
├── COMPANY.md
├── agents/
│   └── <slug>/AGENTS.md
├── teams/
│   └── <slug>/TEAM.md        (si se necesitan equipos)
├── projects/
│   └── <slug>/PROJECT.md     (si se necesitan proyectos)
├── tasks/
│   └── <slug>/TASK.md        (si se necesitan tareas)
├── skills/
│   └── <slug>/SKILL.md       (si se necesitan skills personalizados)
└── .taskorg.yaml            (extensión de proveedor TaskOrg)
```

**Reglas:**

- Los slugs deben ser seguros para URL, en minúsculas, separados por guiones
- COMPANY.md lleva `schema: agentcompanies/v1` — los demás archivos lo heredan
- Las instrucciones del agente van en el cuerpo de AGENTS.md, no en .taskorg.yaml
- Los skills referenciados por nombre corto en AGENTS.md se resuelven a `skills/<shortname>/SKILL.md`
- Para skills externos, usar `sources` con `usage: referenced` (ver sección 12 de la especificación)
- No exportar secretos, rutas locales de máquina ni IDs de base de datos
- Omitir campos vacíos/por defecto
- Para compañías generadas desde un repo, agregar un pie de referencias al final del cuerpo de COMPANY.md:
  `Generated from [repo-name](repo-url) with the company-creator skill from [TaskOrg](https://github.com/Intelliaa/paperclip-inteliside)`

**Estructura de reporte:**

- Cada agente excepto el CEO debe tener `reportsTo` configurado al slug de su gerente
- El CEO tiene `reportsTo: null`
- Para equipos sin CEO, el agente de nivel superior tiene `reportsTo: null`

**Escribir instrucciones de agente con conciencia del flujo de trabajo:**

Cada cuerpo de AGENTS.md debe incluir no solo lo que hace el agente, sino cómo encaja en el flujo de trabajo de la organización. Incluir:

1. **De dónde viene el trabajo** — "Recibes ideas de funcionalidades del usuario" o "Tomas tareas asignadas a ti por el CTO"
2. **Qué produces** — "Produces un plan técnico con diagramas de arquitectura" o "Produces una rama revisada y aprobada lista para envío"
3. **A quién entregas** — "Cuando tu plan está cerrado, entrega al Ingeniero Principal para implementación" o "Cuando la revisión pasa, entrega al Ingeniero de Release para envío"
4. **Qué te activa** — "Te activas cuando una nueva idea de funcionalidad necesita pensamiento a nivel de producto" o "Te activas cuando una rama está lista para revisión pre-landing"

Esto convierte una colección de agentes en una organización que realmente trabaja junta. Sin contexto de flujo de trabajo, los agentes operan aislados — hacen su trabajo pero no saben qué pasa antes o después de ellos.

### Paso 5: Confirmar Ubicación de Salida

Pregunta al usuario dónde escribir el paquete. Opciones comunes:

- Un subdirectorio en el repositorio actual
- Un nuevo directorio que el usuario especifique
- El directorio actual (si está vacío o confirman)

### Paso 6: Escribir README.md y LICENSE

**README.md** — cada paquete de compañía obtiene un README. Debe ser una introducción agradable y legible que alguien navegando GitHub apreciaría. Incluir:

- Nombre de la compañía y qué hace
- El flujo de trabajo / cómo opera la compañía
- Organigrama como lista o tabla markdown mostrando agentes, títulos, estructura de reporte y skills
- Breve descripción del rol de cada agente
- Citas y referencias: enlace al repo fuente (si es desde repo), enlace a la especificación Agent Companies (https://agentcompanies.io/specification), y enlace a TaskOrg (https://github.com/Intelliaa/paperclip-inteliside)
- Una sección "Primeros Pasos" explicando cómo importar: `taskorg company import --from <path>`

**LICENSE** — incluir un archivo LICENSE. El titular del copyright es el usuario que crea la compañía, no el autor del repo upstream (ellos hicieron los skills, el usuario está haciendo la compañía). Usar el mismo tipo de licencia que el repo fuente (si es desde repo) o preguntar al usuario (si es desde cero). Por defecto MIT si no está claro.

### Paso 7: Escribir Archivos y Resumir

Escribe todos los archivos, luego da un breve resumen:

- Nombre de la compañía y qué hace
- Lista de agentes con roles y estructura de reporte
- Skills (personalizados + referenciados)
- Proyectos y tareas si los hay
- La ruta de salida

## Directrices de .taskorg.yaml

El archivo `.taskorg.yaml` es la extensión de proveedor de TaskOrg. Configura adapters e inputs de entorno por agente.

### Reglas de Adapter

**No especifiques un adapter a menos que el repo o el contexto del usuario lo justifique.** Si no sabes qué adapter quiere el usuario, omite el bloque de adapter por completo — TaskOrg usará su valor por defecto. Especificar un tipo de adapter desconocido causa un error de importación.

Tipos de adapter soportados por TaskOrg (estos son los ÚNICOS valores válidos):
- `claude_local` — Claude Code CLI
- `codex_local` — Codex CLI
- `opencode_local` — OpenCode CLI
- `pi_local` — Pi CLI
- `cursor` — Cursor
- `gemini_local` — Gemini CLI
- `openclaw_gateway` — OpenClaw gateway

Solo configurar un adapter cuando:
- El repo o sus skills apuntan claramente a un runtime específico (ej. gstack está construido para Claude Code, entonces `claude_local` es apropiado)
- El usuario solicita explícitamente un adapter específico
- El rol del agente requiere una capacidad específica de runtime

### Reglas de Inputs de Entorno

**No agregues variables de entorno genéricas.** Solo agrega inputs de entorno que el agente realmente necesite según sus skills o rol:
- `GH_TOKEN` para agentes que hacen push de código, crean PRs o interactúan con GitHub
- Claves de API solo cuando un skill lo requiere explícitamente
- Nunca configurar `ANTHROPIC_API_KEY` como variable de entorno vacía por defecto — el runtime maneja esto

Ejemplo con adapter (solo cuando está justificado):
```yaml
schema: taskorg/v1
agents:
  release-engineer:
    adapter:
      type: claude_local
      config:
        model: claude-sonnet-4-6
    inputs:
      env:
        GH_TOKEN:
          kind: secret
          requirement: optional
```

Ejemplo — solo los agentes con sobrecargas reales aparecen:
```yaml
schema: taskorg/v1
agents:
  release-engineer:
    inputs:
      env:
        GH_TOKEN:
          kind: secret
          requirement: optional
```

En este ejemplo, solo `release-engineer` aparece porque necesita `GH_TOKEN`. Los otros agentes (ceo, cto, etc.) no tienen sobrecargas, así que se omiten completamente de `.taskorg.yaml`.

## Referencias de Skills Externos

Al referenciar skills desde un repositorio de GitHub, siempre usar el patrón de referencias:

```yaml
metadata:
  sources:
    - kind: github-file
      repo: owner/repo
      path: path/to/SKILL.md
      commit: <SHA completo de git ls-remote o el repo>
      attribution: Owner or Org Name
      license: <de la LICENSE del repo>
      usage: referenced
```

Obtener el SHA del commit con:

```bash
git ls-remote https://github.com/owner/repo HEAD
```

NO copiar contenido de skills externos al paquete a menos que el usuario lo pida explícitamente.
