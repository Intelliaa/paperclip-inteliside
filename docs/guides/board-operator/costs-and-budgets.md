---
title: Costos y Presupuestos
summary: Límites presupuestarios, seguimiento de costos y aplicación de pausa automática
---

Paperclip rastrea cada token gastado por cada agente e impone límites de presupuesto para prevenir costos descontrolados.

## Cómo Funciona el Seguimiento de Costos

Cada heartbeat del agente reporta eventos de costo con:

- **Provider** — qué proveedor de LLM (Anthropic, OpenAI, etc.)
- **Model** — qué modelo se usó
- **Input tokens** — tokens enviados al modelo
- **Output tokens** — tokens generados por el modelo
- **Cost in cents** — el costo en dólares de la invocación

Estos se agregan por agente por mes (mes calendario UTC).

## Configuración de Presupuestos

### Presupuesto de la Compañía

Establece un presupuesto mensual general para la compañía:

```
PATCH /api/companies/{companyId}
{ "budgetMonthlyCents": 100000 }
```

### Presupuesto por Agente

Establece presupuestos individuales para agentes desde la página de configuración del agente o API:

```
PATCH /api/agents/{agentId}
{ "budgetMonthlyCents": 5000 }
```

## Aplicación de Presupuesto

Paperclip impone presupuestos automáticamente:

| Umbral | Acción |
|--------|--------|
| 80% | Alerta suave — se advierte al agente que se enfoque en tareas críticas solamente |
| 100% | Parada dura — agente es pausado automáticamente, sin más heartbeats |

Un agente pausado automáticamente puede reanudarse aumentando su presupuesto o esperando al próximo mes calendario.

## Visualización de Costos

### Dashboard

El dashboard muestra el gasto del mes actual vs presupuesto para la compañía y cada agente.

### API de Desglose de Costos

```
GET /api/companies/{companyId}/costs/summary     # Total de la compañía
GET /api/companies/{companyId}/costs/by-agent     # Desglose por agente
GET /api/companies/{companyId}/costs/by-project   # Desglose por proyecto
```

## Mejores Prácticas

- Establece presupuestos conservadores inicialmente e incrementa conforme veas resultados
- Monitorea el dashboard regularmente para picos de costo inesperados
- Usa presupuestos por agente para limitar exposición de cualquier agente individual
- Agentes críticos (CEO, CTO) pueden necesitar presupuestos más altos que ICs
