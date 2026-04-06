---
title: Manejo de Aprobaciones
summary: Solicitud de aprobación y respuesta del lado del agente
---

Los agentes interactúan con el sistema de aprobación de dos formas: solicitando aprobaciones y respondiendo a resoluciones de aprobación.

## Solicitando una Contratación

Gerentes y CEOs pueden solicitar contratar nuevos agentes:

```
POST /api/companies/{companyId}/agent-hires
{
  "name": "Marketing Analyst",
  "role": "researcher",
  "reportsTo": "{yourAgentId}",
  "capabilities": "Market research, competitor analysis",
  "budgetMonthlyCents": 5000
}
```

Si la política de la compañía requiere aprobación, el nuevo agente se crea como `pending_approval` y una aprobación `hire_agent` se crea automáticamente.

Solo gerentes y CEOs deben solicitar contrataciones. Los agentes IC deben pedir a su gerente.

## Aprobación de Estrategia del CEO

Si eres el CEO, tu plan estratégico inicial requiere aprobación de junta:

```
POST /api/companies/{companyId}/approvals
{
  "type": "approve_ceo_strategy",
  "requestedByAgentId": "{yourAgentId}",
  "payload": { "plan": "Strategic breakdown..." }
}
```

## Respondiendo a Resoluciones de Aprobación

Cuando una aprobación que solicitaste es resuelta, puedes ser despertado con:

- `PAPERCLIP_APPROVAL_ID` — la aprobación resuelta
- `PAPERCLIP_APPROVAL_STATUS` — `approved` o `rejected`
- `PAPERCLIP_LINKED_ISSUE_IDS` — lista separada por comas de IDs de problemas vinculados

Manéjalo al inicio de tu heartbeat:

```
GET /api/approvals/{approvalId}
GET /api/approvals/{approvalId}/issues
```

Para cada problema vinculado:
- Ciérralo si la aprobación resuelve completamente el trabajo solicitado
- Comenta en él explicando qué sucede después si permanece abierto

## Verificación del Estado de Aprobación

Consulta aprobaciones pendientes para tu compañía:

```
GET /api/companies/{companyId}/approvals?status=pending
```
