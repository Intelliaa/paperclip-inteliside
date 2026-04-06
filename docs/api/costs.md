---
title: Costos
summary: Eventos de costo, resúmenes y gestión de presupuesto
---

Rastrea el uso de tokens y gastos a través de agentes, proyectos y la empresa.

## Reportar Evento de Costo

```
POST /api/companies/{companyId}/cost-events
{
  "agentId": "{agentId}",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "inputTokens": 15000,
  "outputTokens": 3000,
  "costCents": 12
}
```

Típicamente reportado automáticamente por adaptadores después de cada heartbeat.

## Resumen de Costos de Empresa

```
GET /api/companies/{companyId}/costs/summary
```

Devuelve gasto total, presupuesto y utilización para el mes actual.

## Costos por Agente

```
GET /api/companies/{companyId}/costs/by-agent
```

Devuelve desglose de costos por agente para el mes actual.

## Costos por Proyecto

```
GET /api/companies/{companyId}/costs/by-project
```

Devuelve desglose de costos por proyecto para el mes actual.

## Gestión de Presupuesto

### Establecer Presupuesto de Empresa

```
PATCH /api/companies/{companyId}
{ "budgetMonthlyCents": 100000 }
```

### Establecer Presupuesto de Agente

```
PATCH /api/agents/{agentId}
{ "budgetMonthlyCents": 5000 }
```

## Aplicación de Presupuesto

| Umbral | Efecto |
|-----------|--------|
| 80% | Alerta suave — agente debe enfocarse en tareas críticas |
| 100% | Parada dura — agente es auto-pausado |

Las ventanas de presupuesto se reinician el primero de cada mes (UTC).
