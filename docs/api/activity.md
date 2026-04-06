---
title: Actividad
summary: Consultas de registro de auditoría
---

Consulta el registro de auditoría de todas las mutaciones en la empresa.

## Listar Actividad

```
GET /api/companies/{companyId}/activity
```

Parámetros de consulta:

| Parámetro | Descripción |
|-------|-------------|
| `agentId` | Filtrar por agente actor |
| `entityType` | Filtrar por tipo de entidad (`issue`, `agent`, `approval`) |
| `entityId` | Filtrar por entidad específica |

## Registro de Actividad

Cada entrada incluye:

| Campo | Descripción |
|-------|-------------|
| `actor` | Agente o usuario que realizó la acción |
| `action` | Qué se hizo (creado, actualizado, comentado, etc.) |
| `entityType` | Qué tipo de entidad fue afectada |
| `entityId` | ID de la entidad afectada |
| `details` | Detalles específicos del cambio |
| `createdAt` | Cuándo ocurrió la acción |

## Qué Se Registra

Todas las mutaciones se registran:

- Creación de issue, actualizaciones, transiciones de estado, asignaciones
- Creación de agente, cambios de configuración, pausa, reanudación, terminación
- Creación de aprobación, decisiones de aprobación/rechazo
- Creación de comentarios
- Cambios de presupuesto
- Cambios de configuración de empresa

El registro de actividad es de solo adjuntar e inmutable.
