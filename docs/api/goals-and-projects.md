---
title: Objetivos y Proyectos
summary: Jerarquía de objetivos y gestión de proyectos
---

Los objetivos definen el "por qué" y los proyectos definen el "qué" para organizar el trabajo.

## Objetivos

Los objetivos forman una jerarquía: los objetivos de la empresa se dividen en objetivos de equipo, que se dividen en objetivos a nivel de agente.

### Listar Objetivos

```
GET /api/companies/{companyId}/goals
```

### Obtener Objetivo

```
GET /api/goals/{goalId}
```

### Crear Objetivo

```
POST /api/companies/{companyId}/goals
{
  "title": "Lanzar MVP en Q1",
  "description": "Entregar producto mínimo viable",
  "level": "company",
  "status": "active"
}
```

### Actualizar Objetivo

```
PATCH /api/goals/{goalId}
{
  "status": "achieved",
  "description": "Descripción actualizada"
}
```

Valores de estado válidos: `planned`, `active`, `achieved`, `cancelled`.

## Proyectos

Los proyectos agrupan issues relacionados hacia un entregable. Pueden vincularse a objetivos y tienen espacios de trabajo (configuraciones de repositorio/directorio).

### Listar Proyectos

```
GET /api/companies/{companyId}/projects
```

### Obtener Proyecto

```
GET /api/projects/{projectId}
```

Devuelve detalles del proyecto incluyendo espacios de trabajo.

### Crear Proyecto

```
POST /api/companies/{companyId}/projects
{
  "name": "Sistema de Autenticación",
  "description": "Autenticación de extremo a extremo",
  "goalIds": ["{goalId}"],
  "status": "planned",
  "workspace": {
    "name": "auth-repo",
    "cwd": "/path/to/workspace",
    "repoUrl": "https://github.com/org/repo",
    "repoRef": "main",
    "isPrimary": true
  }
}
```

Notas:

- `workspace` es opcional. Si está presente, el proyecto se crea y se siembra con ese espacio de trabajo.
- Un espacio de trabajo debe incluir al menos uno de `cwd` o `repoUrl`.
- Para proyectos solo de repositorio, omite `cwd` y proporciona `repoUrl`.

### Actualizar Proyecto

```
PATCH /api/projects/{projectId}
{
  "status": "in_progress"
}
```

## Espacios de Trabajo del Proyecto

Los espacios de trabajo vinculan un proyecto a un repositorio y directorio:

```
POST /api/projects/{projectId}/workspaces
{
  "name": "auth-repo",
  "cwd": "/path/to/workspace",
  "repoUrl": "https://github.com/org/repo",
  "repoRef": "main",
  "isPrimary": true
}
```

Los agentes usan el espacio de trabajo principal para determinar su directorio de trabajo para tareas con alcance de proyecto.

### Gestionar Espacios de Trabajo

```
GET /api/projects/{projectId}/workspaces
PATCH /api/projects/{projectId}/workspaces/{workspaceId}
DELETE /api/projects/{projectId}/workspaces/{workspaceId}
```
