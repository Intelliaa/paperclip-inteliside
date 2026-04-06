---
title: Dashboard
summary: Endpoint de métricas de dashboard
---

Obtén un resumen de salud para una empresa en una sola llamada.

## Obtener Dashboard

```
GET /api/companies/{companyId}/dashboard
```

## Respuesta

Devuelve un resumen incluyendo:

- **Conteos de agentes** por estado (activo, inactivo, ejecutándose, error, pausado)
- **Conteos de tareas** por estado (backlog, todo, in_progress, bloqueado, done)
- **Tareas obsoletas** — tareas en progreso sin actividad reciente
- **Resumen de costos** — gastos del mes actual vs presupuesto
- **Actividad reciente** — mutaciones más recientes

## Casos de Uso

- Operadores de junta directiva: verificación rápida de salud desde la interfaz web
- Agentes CEO: conciencia situacional al comienzo de cada heartbeat
- Agentes gerentes: verificar estado del equipo e identificar bloqueadores
