# Especificación de Compañías de Agentes

Extensión de la Especificación de Skills de Agentes

Versión: `agentcompanies/v1-draft`

## 1. Propósito

Un paquete Agent Company es un formato nativo de filesystem y GitHub para describir una compañía, equipo, agente, proyecto, tarea, y skills asociadas usando archivos markdown con frontmatter YAML.

Esta especificación es una extensión de la especificación de Agent Skills, no un reemplazo para esta.

Define cómo la estructura de paquete a nivel de compañía, equipo y agente se compone alrededor del modelo `SKILL.md` existente.

Esta especificación es agnóstica de vendor. Se pretende que sea utilizable por cualquier runtime de agent-company, no solo TaskOrg.

El formato está diseñado para:

- ser legible y escribible por humanos
- funcionar directamente desde una carpeta local o repositorio GitHub
- no requerir un registro central
- soportar atribución y referencias fijadas a archivos upstream
- extender el ecosistema de Agent Skills existente sin redefinirlo
- ser útil fuera de TaskOrg

## 2. Principios Principales

1. Markdown es canónico.
2. Los repositorios Git son contenedores de paquetes válidos.
3. Los registros son capas de descubrimiento opcionales, no autoridades.
4. `SKILL.md` permanece bajo la propiedad de la especificación de Agent Skills.
5. Las referencias externas deben poder fijarse a commits Git inmutables.
6. Los metadatos de atribución y licencia deben sobrevivir a import/export.
7. Los slugs y rutas relativas son la capa de identidad portable, no ids de base de datos.
8. La estructura de carpeta convencional debe funcionar sin cableado verbose.
9. La fidelidad específica de vendor pertenece a extensiones opcionales, no al paquete base.

## 3. Tipos de Paquetes

Una raíz de paquete se identifica por un archivo markdown primario:

- `COMPANY.md` para un paquete de compañía
- `TEAM.md` para un paquete de equipo
- `AGENTS.md` para un paquete de agente
- `PROJECT.md` para un paquete de proyecto
- `TASK.md` para un paquete de tarea
- `SKILL.md` para un paquete de skill definido por la especificación de Agent Skills

Un repositorio GitHub puede contener un paquete en la raíz o muchos paquetes en subdirectorios.

## 4. Archivos y Directorios Reservados

Convenciones comunes:

```text
COMPANY.md
TEAM.md
AGENTS.md
PROJECT.md
TASK.md
SKILL.md

agents/<slug>/AGENTS.md
teams/<slug>/TEAM.md
projects/<slug>/PROJECT.md
projects/<slug>/tasks/<slug>/TASK.md
tasks/<slug>/TASK.md
skills/<slug>/SKILL.md
.taskorg.yaml

HEARTBEAT.md
SOUL.md
TOOLS.md
README.md
assets/
scripts/
references/
```

Reglas:

- solo los archivos markdown son docs de contenido canónico
- directorios que no son markdown como `assets/`, `scripts/`, y `references/` están permitidos
- las herramientas de paquete pueden generar archivos de bloqueo opcionales, pero los archivos de bloqueo no son requeridos para la autoría

## 5. Frontmatter Común

Los docs de paquete pueden soportar estos campos:

```yaml
schema: agentcompanies/v1
kind: company | team | agent | project | task
slug: my-slug
name: Human Readable Name
description: Short description
version: 0.1.0
license: MIT
authors:
  - name: Jane Doe
homepage: https://example.com
tags:
  - startup
  - engineering
metadata: {}
sources: []
```

Notas:

- `schema` es opcional y generalmente debe aparecer solo en la raíz del paquete
- `kind` es opcional cuando la ruta del archivo y el nombre del archivo ya hacen el tipo obvio
- `slug` debe ser URL-safe y estable
- `sources` es para proveniencia y referencias externas
- `metadata` es para extensiones específicas de herramienta
- los exportadores deben omitir campos vacíos o con valores predeterminados

## 6. COMPANY.md

`COMPANY.md` es el punto de entrada raíz para un paquete de compañía completo.

### Campos requeridos

```yaml
name: Lean Dev Shop
description: Small engineering-focused AI company
slug: lean-dev-shop
schema: agentcompanies/v1
```

### Campos recomendados

```yaml
version: 1.0.0
license: MIT
authors:
  - name: Example Org
goals:
  - Build and ship software products
includes:
  - https://github.com/example/shared-company-parts/blob/0123456789abcdef0123456789abcdef01234567/teams/engineering/TEAM.md
requirements:
  secrets:
    - OPENAI_API_KEY
```

### Semántica

- `includes` define el gráfico de paquete
- los contenidos del paquete local deben descubrirse implícitamente por convención de carpeta
- `includes` es opcional y debe usarse principalmente para refs externas o ubicaciones no estándar
- los elementos incluidos pueden ser referencias locales o externas
- `COMPANY.md` puede incluir agentes directamente, equipos, proyectos, tareas, o skills
- un importador de compañía puede renderizar `includes` como la UI de importación de árbol/checkbox

## 7. TEAM.md

`TEAM.md` define un subárbol de organización.

### Ejemplo

```yaml
name: Engineering
description: Product and platform engineering team
schema: agentcompanies/v1
slug: engineering
manager: ../cto/AGENTS.md
includes:
  - ../platform-lead/AGENTS.md
  - ../frontend-lead/AGENTS.md
  - ../../skills/review/SKILL.md
tags:
  - team
  - engineering
```

### Semántica

- un paquete de equipo es un subárbol reutilizable, no necesariamente una tabla de base de datos de runtime
- `manager` identifica el agente raíz del subárbol
- `includes` puede contener agentes hijo, equipos hijo, o skills compartidas
- un paquete de equipo puede ser importado a una compañía existente y adjuntado bajo un manager de destino

## 8. AGENTS.md

`AGENTS.md` define un agente.

### Ejemplo

```yaml
name: CEO
title: Chief Executive Officer
reportsTo: null
skills:
  - plan-ceo-review
  - review
```

### Semántica

- el contenido del cuerpo es el contenido de instrucción predeterminado canónico para el agente
- `docs` apunta a docs markdown hermanos cuando están presentes
- `skills` hace referencia a paquetes reutilizables de `SKILL.md` por shortname o slug de skill
- una entrada de skill bare como `review` debe resolverse a `skills/review/SKILL.md` por convención
- si un paquete referencia skills externas, el agente aún debe referirse a la skill por shortname; el paquete de skill mismo posee cualquier ref de fuente, fijación, o detalles de atribución
- las herramientas pueden permitir entradas de ruta o URL como escotilla de emergencia, pero los exportadores deben preferir referencias de skill basadas en shortname en `AGENTS.md`
- la configuración de adapter/runtime específica de vendor no debe vivir en el paquete base
- las rutas absolutas locales, valores cwd específicos de máquina, y valores secretos no deben ser exportados como datos de paquete canónico

### Resolución de Skill

El estándar de asociación preferido entre agentes y skills es por shortname de skill.

Orden de resolución sugerido para una entrada de skill de agente:

1. una skill de paquete local en `skills/<shortname>/SKILL.md`
2. un paquete de skill referenciado o incluido cuyo slug o shortname declarado coincida
3. una entrada de biblioteca de skill de compañía gestionada por herramienta con el mismo shortname

Reglas:

- los exportadores deben emitir shortnames en `AGENTS.md` siempre que sea posible
- los importadores no deben requerir rutas de archivo completas para referencias de skill ordinarias
- el paquete de skill mismo debe llevar cualquier complejidad alrededor de refs externas, vendoring, espejos, o contenido upstream fijado
- esto mantiene `AGENTS.md` legible y consistente con el compartir estilo `skills.sh`

## 9. PROJECT.md

`PROJECT.md` define un paquete de proyecto ligero.

### Ejemplo

```yaml
name: Q2 Launch
description: Ship the Q2 launch plan and supporting assets
owner: cto
```

### Semántica

- un paquete de proyecto agrupa tareas iniciadoras relacionadas y markdown de soporte
- `owner` debe hacer referencia a un slug de agente cuando hay un propietario de proyecto claro
- una subcarpeta `tasks/` convencional debe descubrirse implícitamente
- `includes` puede contener `TASK.md`, `SKILL.md`, o docs de soporte cuando se necesita cableado explícito
- los paquetes de proyecto están destinados a iniciar trabajo planificado, no a representar estado de tarea de runtime

## 10. TASK.md

`TASK.md` define una tarea iniciadora ligera.

### Ejemplo

```yaml
name: Monday Review
assignee: ceo
project: q2-launch
recurring: true
```

### Semántica

- el contenido del cuerpo es la descripción de tarea markdown canónica
- `assignee` debe hacer referencia a un slug de agente dentro del paquete
- `project` debe hacer referencia a un slug de proyecto cuando la tarea pertenece a un `PROJECT.md`
- `recurring: true` marca la tarea como trabajo recurrente continuado en lugar de una tarea iniciadora de una sola vez
- las tareas son intencionalmente trabajo iniciador básico: título, cuerpo markdown, asignado, vinculación de proyecto, y `recurring: true` opcional
- las herramientas también pueden soportar campos opcionales como `priority`, `labels`, o `metadata`, pero no deben requerirlos en el paquete base

### Tareas Recurrentes

- el paquete base solo necesita decir si una tarea es recurrente
- los vendors pueden adjuntar la fidelidad real de horario / trigger / runtime en una extensión de vendor como `.taskorg.yaml`
- esto mantiene `TASK.md` portable mientras aún permite a sistemas de runtime más rico hacer round-trip de sus propios detalles de automatización
- los paquetes heredados pueden aún usar `schedule.recurrence` durante la transición, pero los exportadores deben preferir `recurring: true`

Ejemplo de extensión TaskOrg:

```yaml
routines:
  monday-review:
    triggers:
      - kind: schedule
        cronExpression: "0 9 * * 1"
        timezone: America/Chicago
```

- los vendors deben ignorar extensiones de tarea recurrente desconocida que no entiendan
- los vendors importando datos heredados de `schedule.recurrence` pueden traducirlo a su propio modelo de trigger de runtime, pero las nuevas exportaciones deben preferir el campo base `recurring: true` más simple

## 11. Compatibilidad SKILL.md

Un paquete de skill debe permanecer un paquete válido de Agent Skills.

Reglas:

- `SKILL.md` debe seguir la especificación de Agent Skills
- TaskOrg no debe requerir campos top-level extra para validez de skill
- las extensiones específicas de TaskOrg deben vivir bajo `metadata.taskorg` o `metadata.sources`
- un directorio de skill puede incluir `scripts/`, `references/`, y `assets/` exactamente como el ecosistema de Agent Skills espera
- las herramientas implementando esta especificación deben tratar la compatibilidad de `skills.sh` como un objetivo de primera clase en lugar de inventar un formato de skill paralelo

En otras palabras, esta especificación extiende Agent Skills hacia arriba en composición de compañía/equipo/agente. No redefine la semántica de paquete de skill.

### Ejemplo de extensión compatible

```yaml
---
name: review
description: Paranoid code review skill
allowed-tools:
  - Read
  - Grep
metadata:
  taskorg:
    tags:
      - engineering
      - review
  sources:
    - kind: github-file
      repo: vercel-labs/skills
      path: review/SKILL.md
      commit: 0123456789abcdef0123456789abcdef01234567
      sha256: 3b7e...9a
      attribution: Vercel Labs
      usage: referenced
---
```

## 12. Referencias de Fuente

Un paquete puede apuntar a contenido upstream en lugar de vendorlo.

### Objeto de fuente

```yaml
sources:
  - kind: github-file
    repo: owner/repo
    path: path/to/file.md
    commit: 0123456789abcdef0123456789abcdef01234567
    blob: abcdef0123456789abcdef0123456789abcdef01
    sha256: 3b7e...9a
    url: https://github.com/owner/repo/blob/0123456789abcdef0123456789abcdef01234567/path/to/file.md
    rawUrl: https://raw.githubusercontent.com/owner/repo/0123456789abcdef0123456789abcdef01234567/path/to/file.md
    attribution: Owner Name
    license: MIT
    usage: referenced
```

### Tipos soportados

- `local-file`
- `local-dir`
- `github-file`
- `github-dir`
- `url`

### Modos de uso

- `vendored`: los bytes se incluyen en el paquete
- `referenced`: el paquete apunta a contenido upstream inmutable
- `mirrored`: los bytes se cachean localmente pero la atribución upstream permanece canónica

### Reglas

- `commit` es requerido para `github-file` y `github-dir` en modo estricto
- `sha256` se recomienda fuertemente y debe ser verificado en fetch
- las refs solo-rama pueden estar permitidas en modo desarrollo pero deben advertir
- los exportadores deben por defecto usar `referenced` para contenido de terceros a menos que la redistribución esté claramente permitida

## 13. Reglas de Resolución

Dado una raíz de paquete, un importador resuelve en este orden:

1. rutas relativas locales
2. rutas absolutas locales si explícitamente permitidas por la herramienta de importación
3. refs de GitHub fijadas
4. URLs genéricas

Para refs de GitHub fijadas:

1. resolver `repo + commit + path`
2. obtener contenido
3. verificar `sha256` si está presente
4. verificar `blob` si está presente
5. fallar cerrado en discrepancia

Un importador debe mostrar:

- archivos faltantes
- discrepancias de hash
- licencias faltantes
- contenido upstream referenciado que requiere fetch de red
- contenido ejecutable en skills o scripts

## 14. Gráfico de Importación

Un importador de paquete debe construir un gráfico desde:

- `COMPANY.md`
- `TEAM.md`
- `AGENTS.md`
- `PROJECT.md`
- `TASK.md`
- `SKILL.md`
- refs locales y externas

Comportamiento sugerido de UI de importación:

- renderizar gráfico como árbol
- checkbox a nivel de entidad, no a nivel de archivo sin procesar
- seleccionar un agente auto-selecciona docs requeridos y skills referenciadas
- seleccionar un equipo auto-selecciona su subárbol
- seleccionar un proyecto auto-selecciona sus tareas incluidas
- seleccionar una tarea recurrente debe hacer claro que el destino de importación es una routine / automatización, no una tarea de una sola vez
- seleccionar contenido referenciado de terceros muestra atribución, licencia, y política de fetch

## 15. Extensiones de Vendor

Los datos específicos de vendor deben vivir fuera de la forma de paquete base.

Para TaskOrg, la extensión de fidelidad preferida es:

```text
.taskorg.yaml
```

Usos de ejemplo:

- tipo de adapter y configuración de adapter
- inputs de env de adapter y valores por defecto
- configuración de runtime
- permisos
- presupuestos
- políticas de aprobación
- políticas de workspace de ejecución de proyecto
- metadatos solo de TaskOrg de issue/tarea

Reglas:

- el paquete base debe permanecer legible sin la extensión
- las herramientas que no entienden una extensión de vendor deben ignorarla
- las herramientas de TaskOrg pueden emitir la extensión de vendor por defecto como un sidecar mientras mantienen el markdown base limpio

Forma TaskOrg sugerida:

```yaml
schema: taskorg/v1
agents:
  claudecoder:
    adapter:
      type: claude_local
      config:
        model: claude-opus-4-6
    inputs:
      env:
        ANTHROPIC_API_KEY:
          kind: secret
          requirement: optional
          default: ""
        GH_TOKEN:
          kind: secret
          requirement: optional
        CLAUDE_BIN:
          kind: plain
          requirement: optional
          default: claude
routines:
  monday-review:
    triggers:
      - kind: schedule
        cronExpression: "0 9 * * 1"
        timezone: America/Chicago
```

Reglas adicionales para exportadores de TaskOrg:

- no duplicar `promptTemplate` cuando `AGENTS.md` ya contiene las instrucciones del agente
- no exportar vinculaciones secretas específicas de proveedor tales como `secretId`, `version`, o `type: secret_ref`
- exportar inputs de env como declaraciones portables con semántica `required` u `optional` y valores por defecto opcionales
- advertir sobre valores dependientes del sistema tales como comandos absolutos y anulaciones de `PATH` absoluto
- omitir campos TaskOrg vacíos y con valores predeterminados cuando sea posible

## 16. Reglas de Exportación

Un exportador compatible debe:

- emitir raíces markdown y layout de carpeta relativa
- omitir ids y timestamps locales de máquina
- omitir valores secretos
- omitir rutas específicas de máquina
- preservar descripciones de tarea y declaraciones de tarea recurrente al exportar tareas
- omitir campos vacíos/predeterminados
- por defecto al paquete base agnóstico de vendor
- los exportadores de TaskOrg deben emitir `.taskorg.yaml` como un sidecar por defecto
- preservar atribución y referencias de fuente
- preferir `referenced` sobre vendoring silencioso para contenido de terceros
- preservar `SKILL.md` tal cual al exportar skills compatibles

## 17. Licencias y Atribución

Una herramienta compatible debe:

- preservar metadatos de `license` y `attribution` al importar y exportar
- distinguir contenido vendored vs referenced
- no insertar silenciosamente contenido referenciado de terceros durante la exportación
- mostrar metadatos de licencia faltante como una advertencia
- mostrar licencias restrictivas o desconocidas antes de install/import si el contenido es vendored o mirrored

## 18. Archivo de Bloqueo Opcional

La autoría no requiere un archivo de bloqueo.

Las herramientas pueden generar un archivo de bloqueo opcional tales como:

```text
company-package.lock.json
```

Propósito:

- cachear refs resueltos
- registrar hashes finales
- soportar installs reproducibles

Reglas:

- los archivos de bloqueo son opcionales
- los archivos de bloqueo son artefactos generados, no entrada de autoría canónica
- el paquete markdown permanece como la fuente de verdad

## 19. Mapeo de TaskOrg

TaskOrg puede mapear esta especificación a su modelo de runtime así:

- paquete base:
  - `COMPANY.md` -> metadatos de compañía
  - `TEAM.md` -> subárbol de organización importable
  - `AGENTS.md` -> identidad e instrucciones de agente
  - `PROJECT.md` -> definición de proyecto iniciador
  - `TASK.md` -> definición de tarea/issue iniciadora, o plantilla de tarea recurrente cuando `recurring: true`
  - `SKILL.md` -> paquete de skill importado
  - `sources[]` -> proveniencia y refs upstream fijados
- Extensión TaskOrg:
  - `.taskorg.yaml` -> configuración de adapter, configuración de runtime, declaraciones de entrada de env, permisos, presupuestos, triggers de routine, y otra fidelidad específica de TaskOrg

Los metadatos solo de TaskOrg inline que deben vivir dentro de un archivo markdown compartido deben usar:

- `metadata.taskorg`

Eso mantiene el formato base más amplio que TaskOrg.

Esta especificación misma permanece agnóstica de vendor e intentada para cualquier runtime de agent-company, no solo TaskOrg.

## 20. Transición

TaskOrg debe hacer transición a este modelo de paquete markdown-first como el formato de portabilidad primario.

`taskorg.manifest.json` no necesita ser preservado como un requisito de compatibilidad para el sistema de paquete futuro.

Para TaskOrg, esto debe ser tratado como una transición dura en dirección de producto en lugar de una estrategia dual-formato de vida larga.

## 21. Ejemplo Mínimo

```text
lean-dev-shop/
├── COMPANY.md
├── agents/
│   ├── ceo/AGENTS.md
│   └── cto/AGENTS.md
├── projects/
│   └── q2-launch/
│       ├── PROJECT.md
│       └── tasks/
│           └── monday-review/
│               └── TASK.md
├── teams/
│   └── engineering/TEAM.md
├── tasks/
│   └── weekly-review/TASK.md
└── skills/
    └── review/SKILL.md

Opcional:

```text
.taskorg.yaml
```
```

**Recomendación**
Esta es la dirección que tomaría:

- hacer esta la especificación orientada a humanos
- definir compatibilidad de `SKILL.md` como innegociable
- tratar esta especificación como una extensión de Agent Skills, no un formato paralelo
- hacer `companies.sh` una capa de descubrimiento para repos implementando esta especificación, no una autoridad de publicación
