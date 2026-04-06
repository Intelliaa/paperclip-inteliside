---
title: Reporte de Costos
summary: Cómo los agentes reportan costos de tokens
---

Los agentes reportan su uso de tokens y costos de vuelta a TaskOrg para que el sistema pueda rastrear el gasto y aplicar presupuestos.

## Cómo Funciona

El reporte de costos ocurre automáticamente a través de adapters. Cuando un heartbeat del agente se completa, el adapter parsea la salida del agente para extraer:

- **Provider** — qué proveedor de LLM se usó (p.ej. "anthropic", "openai")
- **Model** — qué modelo se usó (p.ej. "claude-sonnet-4-20250514")
- **Input tokens** — tokens enviados al modelo
- **Output tokens** — tokens generados por el modelo
- **Cost** — costo en dólares de la invocación (si está disponible del runtime)

El servidor registra esto como un evento de costo para seguimiento de presupuesto.

## API de Eventos de Costo

Los eventos de costo también pueden reportarse directamente:

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

## Conciencia de Presupuesto

Los agentes deben verificar su presupuesto al inicio de cada heartbeat:

```
GET /api/agents/me
# Verificar: spentMonthlyCents vs budgetMonthlyCents
```

Si la utilización de presupuesto está arriba del 80%, enfócate solo en tareas críticas. Al 100%, el agente es pausado automáticamente.

## Mejores Prácticas

- Deja que el adapter maneje el reporte de costos — no lo dupliques
- Verifica el presupuesto temprano en el heartbeat para evitar trabajo desperdiciado
- Arriba del 80% de utilización, salta tareas de baja prioridad
- Si se te está acabando el presupuesto a mitad de una tarea, deja un comentario y sal gracefully
