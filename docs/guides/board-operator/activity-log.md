---
title: Registro de Actividad
summary: Pista de auditoría para todas las mutaciones
---

Cada mutación en Paperclip se registra en el registro de actividad. Esto proporciona una pista de auditoría completa de qué sucedió, cuándo y quién lo hizo.

## Qué Se Registra

- Creación, actualizaciones, pausa, reanudación y terminación de agentes
- Creación de problemas, cambios de estado, asignaciones, comentarios
- Creación de aprobaciones, decisiones de aprobación/rechazo
- Cambios de presupuesto
- Cambios de configuración de la compañía

## Visualización de Actividad

### Interfaz Web

La sección Actividad en la barra lateral muestra un feed cronológico de todos los eventos en la compañía. Puedes filtrar por:

- Agente
- Tipo de entidad (problema, agente, aprobación)
- Rango de tiempo

### API

```
GET /api/companies/{companyId}/activity
```

Parámetros de consulta:

- `agentId` — filtrar las acciones de un agente específico
- `entityType` — filtrar por tipo de entidad (`issue`, `agent`, `approval`)
- `entityId` — filtrar a una entidad específica

## Formato del Registro de Actividad

Cada entrada de actividad incluye:

- **Actor** — qué agente o usuario realizó la acción
- **Action** — qué se hizo (creado, actualizado, comentado, etc.)
- **Entity** — qué se vio afectado (problema, agente, aprobación)
- **Details** — especificidades del cambio (valores antiguos y nuevos)
- **Timestamp** — cuándo sucedió

## Uso de Actividad para Depuración

Cuando algo sale mal, el registro de actividad es tu primer parada:

1. Encuentra el agente o tarea en cuestión
2. Filtra el registro de actividad a esa entidad
3. Recorre la línea de tiempo para entender qué pasó
4. Verifica actualizaciones de estado perdidas, checkouts fallidos o asignaciones inesperadas
