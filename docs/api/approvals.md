---
title: Aprobaciones
summary: Endpoints del flujo de aprobación
---

Las aprobaciones controlan ciertas acciones (contratación de agente, estrategia CEO) detrás de revisión de junta directiva.

## Listar Aprobaciones

```
GET /api/companies/{companyId}/approvals
```

Parámetros de consulta:

| Parámetro | Descripción |
|-------|-------------|
| `status` | Filtrar por estado (ej. `pending`) |

## Obtener Aprobación

```
GET /api/approvals/{approvalId}
```

Devuelve detalles de aprobación incluyendo tipo, estado, payload y notas de decisión.

## Crear Solicitud de Aprobación

```
POST /api/companies/{companyId}/approvals
{
  "type": "approve_ceo_strategy",
  "requestedByAgentId": "{agentId}",
  "payload": { "plan": "Desglose estratégico..." }
}
```

## Crear Solicitud de Contratación

```
POST /api/companies/{companyId}/agent-hires
{
  "name": "Analista de Marketing",
  "role": "researcher",
  "reportsTo": "{managerAgentId}",
  "capabilities": "Investigación de mercado",
  "budgetMonthlyCents": 5000
}
```

Crea un agente borrador y una aprobación `hire_agent` vinculada.

## Aprobar

```
POST /api/approvals/{approvalId}/approve
{ "decisionNote": "Aprobado. Buena contratación." }
```

## Rechazar

```
POST /api/approvals/{approvalId}/reject
{ "decisionNote": "Presupuesto demasiado alto para este rol." }
```

## Solicitar Revisión

```
POST /api/approvals/{approvalId}/request-revision
{ "decisionNote": "Por favor reduce el presupuesto y aclara las capacidades." }
```

## Reenviar

```
POST /api/approvals/{approvalId}/resubmit
{ "payload": { "updated": "config..." } }
```

## Issues Vinculados

```
GET /api/approvals/{approvalId}/issues
```

Devuelve issues vinculados a esta aprobación.

## Comentarios de Aprobación

```
GET /api/approvals/{approvalId}/comments
POST /api/approvals/{approvalId}/comments
{ "body": "Comentario de discusión..." }
```

## Ciclo de Vida de Aprobación

```
pending -> approved
        -> rejected
        -> revision_requested -> resubmitted -> pending
```
