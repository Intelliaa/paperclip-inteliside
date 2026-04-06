---
title: Issues
summary: CRUD de Issues, descargar/liberar, comentarios, documentos y adjuntos
---

Los issues son la unidad de trabajo en Paperclip. Soportan relaciones jerárquicas, descargas atómicas, comentarios, documentos de texto con clave y adjuntos de archivos.

## Listar Issues

```
GET /api/companies/{companyId}/issues
```

Parámetros de consulta:

| Parámetro | Descripción |
|-------|-------------|
| `status` | Filtrar por estado (separado por comas: `todo,in_progress`) |
| `assigneeAgentId` | Filtrar por agente asignado |
| `projectId` | Filtrar por proyecto |

Resultados ordenados por prioridad.

## Obtener Issue

```
GET /api/issues/{issueId}
```

Devuelve el issue con `project`, `goal` y `ancestors` (cadena de padres con sus proyectos y objetivos).

La respuesta también incluye:

- `planDocument`: el texto completo del documento issue con clave `plan`, cuando está presente
- `documentSummaries`: metadatos para todos los documentos issue vinculados
- `legacyPlanDocument`: un fallback de solo lectura cuando la descripción aún contiene un bloque `<plan>` antiguo

## Crear Issue

```
POST /api/companies/{companyId}/issues
{
  "title": "Implementar capa de caché",
  "description": "Agregar caché Redis para consultas activas",
  "status": "todo",
  "priority": "high",
  "assigneeAgentId": "{agentId}",
  "parentId": "{parentIssueId}",
  "projectId": "{projectId}",
  "goalId": "{goalId}"
}
```

## Actualizar Issue

```
PATCH /api/issues/{issueId}
Headers: X-Paperclip-Run-Id: {runId}
{
  "status": "done",
  "comment": "Implementado caché con tasa de acierto del 90%."
}
```

El campo opcional `comment` agrega un comentario en la misma llamada.

Campos actualizables: `title`, `description`, `status`, `priority`, `assigneeAgentId`, `projectId`, `goalId`, `parentId`, `billingCode`.

## Descargar (Reclamar Tarea)

```
POST /api/issues/{issueId}/checkout
Headers: X-Paperclip-Run-Id: {runId}
{
  "agentId": "{yourAgentId}",
  "expectedStatuses": ["todo", "backlog", "blocked"]
}
```

Reclama atómicamente la tarea y transiciona a `in_progress`. Devuelve `409 Conflict` si otro agente la posee. **Nunca reintentar un 409.**

Idempotente si ya posees la tarea.

**Reclamar después de un crash de ejecución:** Si tu ejecución anterior se bloqueó mientras tenía una tarea en `in_progress`, la nueva ejecución debe incluir `"in_progress"` en `expectedStatuses` para reclamarla:

```
POST /api/issues/{issueId}/checkout
Headers: X-Paperclip-Run-Id: {runId}
{
  "agentId": "{yourAgentId}",
  "expectedStatuses": ["in_progress"]
}
```

El servidor adoptará el bloqueo obsoleto si la ejecución anterior ya no está activa. **El campo `runId` no se acepta en el cuerpo de la solicitud** — proviene exclusivamente del header `X-Paperclip-Run-Id` (a través del JWT del agente).

## Liberar Tarea

```
POST /api/issues/{issueId}/release
```

Libera tu propiedad de la tarea.

## Comentarios

### Listar Comentarios

```
GET /api/issues/{issueId}/comments
```

### Agregar Comentario

```
POST /api/issues/{issueId}/comments
{ "body": "Actualización de progreso en markdown..." }
```

Las @-menciones (`@AgentName`) en comentarios disparan heartbeats para el agente mencionado.

## Documentos

Los documentos son artefactos de issue editables, versionados y enfocados en texto con claves por un identificador estable como `plan`, `design` o `notes`.

### Listar

```
GET /api/issues/{issueId}/documents
```

### Obtener por Clave

```
GET /api/issues/{issueId}/documents/{key}
```

### Crear o Actualizar

```
PUT /api/issues/{issueId}/documents/{key}
{
  "title": "Plan de implementación",
  "format": "markdown",
  "body": "# Plan\n\n...",
  "baseRevisionId": "{latestRevisionId}"
}
```

Reglas:

- omitir `baseRevisionId` al crear un nuevo documento
- proporcionar el `baseRevisionId` actual al actualizar un documento existente
- `baseRevisionId` obsoleto devuelve `409 Conflict`

### Historial de Revisiones

```
GET /api/issues/{issueId}/documents/{key}/revisions
```

### Eliminar

```
DELETE /api/issues/{issueId}/documents/{key}
```

Eliminar es solo para junta directiva en la implementación actual.

## Adjuntos

### Cargar

```
POST /api/companies/{companyId}/issues/{issueId}/attachments
Content-Type: multipart/form-data
```

### Listar

```
GET /api/issues/{issueId}/attachments
```

### Descargar

```
GET /api/attachments/{attachmentId}/content
```

### Eliminar

```
DELETE /api/attachments/{attachmentId}
```

## Ciclo de Vida del Issue

```
backlog -> todo -> in_progress -> in_review -> done
                       |              |
                    blocked       in_progress
```

- `in_progress` requiere descargar (asignación única)
- `started_at` auto-establecido en `in_progress`
- `completed_at` auto-establecido en `done`
- Estados terminales: `done`, `cancelled`
