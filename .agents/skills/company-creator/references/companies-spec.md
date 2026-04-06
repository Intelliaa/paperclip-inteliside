# Referencia de la Especificación Agent Companies

La especificación normativa se encuentra en:

- Web: https://agentcompanies.io/specification
- Local: docs/companies/companies-spec.md

Lee el archivo local de la especificación antes de generar cualquier archivo del paquete. La especificación define el formato canónico y todos los campos de frontmatter. A continuación se presenta un resumen de referencia rápida para tareas comunes de autoría.

## Tipos de Paquete

| Archivo    | Tipo    | Propósito                                           |
| ---------- | ------- | --------------------------------------------------- |
| COMPANY.md | company | Punto de entrada raíz, límite organizacional y valores por defecto |
| TEAM.md    | team    | Subárbol organizacional reutilizable                |
| AGENTS.md  | agent   | Un rol, instrucciones y skills adjuntos             |
| PROJECT.md | project | Agrupación de trabajo planificado                   |
| TASK.md    | task    | Tarea inicial portátil                              |
| SKILL.md   | skill   | Paquete de capacidades de Agent Skills (no redefinir) |

## Estructura de Directorios

```
company-package/
├── COMPANY.md
├── agents/
│   └── <slug>/AGENTS.md
├── teams/
│   └── <slug>/TEAM.md
├── projects/
│   └── <slug>/
│       ├── PROJECT.md
│       └── tasks/
│           └── <slug>/TASK.md
├── tasks/
│   └── <slug>/TASK.md
├── skills/
│   └── <slug>/SKILL.md
├── assets/
├── scripts/
├── references/
└── .paperclip.yaml          (extensión de proveedor opcional)
```

## Campos Comunes de Frontmatter

```yaml
schema: agentcompanies/v1
kind: company | team | agent | project | task
slug: url-safe-stable-identity
name: Human Readable Name
description: Short description for discovery
version: 0.1.0
license: MIT
authors:
  - name: Jane Doe
tags: []
metadata: {}
sources: []
```

- `schema` usualmente aparece solo en la raíz del paquete
- `kind` es opcional cuando el nombre de archivo lo hace obvio
- `slug` debe ser seguro para URL y estable
- Los exportadores deben omitir campos vacíos o con valores por defecto

## Campos Obligatorios de COMPANY.md

```yaml
name: Company Name
description: What this company does
slug: company-slug
schema: agentcompanies/v1
```

Opcionales: `version`, `license`, `authors`, `goals`, `includes`, `requirements.secrets`

## Campos Clave de AGENTS.md

```yaml
name: Agent Name
title: Role Title
reportsTo: <agent-slug or null>
skills:
  - skill-shortname
```

- El contenido del cuerpo son las instrucciones por defecto del agente
- Los skills se resuelven por nombre corto: `skills/<shortname>/SKILL.md`
- No exportar rutas específicas de máquina ni secretos

## Campos Clave de TEAM.md

```yaml
name: Team Name
description: What this team does
slug: team-slug
manager: ../agent-slug/AGENTS.md
includes:
  - ../agent-slug/AGENTS.md
  - ../../skills/skill-slug/SKILL.md
```

## Campos Clave de PROJECT.md

```yaml
name: Project Name
description: What this project delivers
owner: agent-slug
```

## Campos Clave de TASK.md

```yaml
name: Task Name
assignee: agent-slug
project: project-slug
schedule:
  timezone: America/Chicago
  startsAt: 2026-03-16T09:00:00-05:00
  recurrence:
    frequency: weekly
    interval: 1
    weekdays: [monday]
    time: { hour: 9, minute: 0 }
```

## Referencias de Fuentes (para skills/contenido externo)

```yaml
sources:
  - kind: github-file
    repo: owner/repo
    path: path/to/SKILL.md
    commit: <full-sha>
    sha256: <hash>
    attribution: Owner Name
    license: MIT
    usage: referenced
```

Modos de uso: `vendored` (bytes incluidos), `referenced` (solo puntero), `mirrored` (cacheado localmente)

Por defecto usar `referenced` para contenido de terceros.
