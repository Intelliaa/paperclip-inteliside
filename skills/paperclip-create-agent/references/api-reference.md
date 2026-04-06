# Referencia de la API de Creación de Agentes de Paperclip

## Endpoints Principales

- `GET /llms/agent-configuration.txt`
- `GET /llms/agent-configuration/:adapterType.txt`
- `GET /llms/agent-icons.txt`
- `GET /api/companies/:companyId/agent-configurations`
- `GET /api/companies/:companyId/skills`
- `POST /api/companies/:companyId/skills/import`
- `GET /api/agents/:agentId/configuration`
- `POST /api/agents/:agentId/skills/sync`
- `POST /api/companies/:companyId/agent-hires`
- `POST /api/companies/:companyId/agents`
- `GET /api/agents/:agentId/config-revisions`
- `POST /api/agents/:agentId/config-revisions/:revisionId/rollback`
- `POST /api/issues/:issueId/approvals`
- `GET /api/approvals/:approvalId/issues`

Colaboración en aprobaciones:

- `GET /api/approvals/:approvalId`
- `POST /api/approvals/:approvalId/request-revision` (board)
- `POST /api/approvals/:approvalId/resubmit`
- `GET /api/approvals/:approvalId/comments`
- `POST /api/approvals/:approvalId/comments`
- `GET /api/approvals/:approvalId/issues`

## `POST /api/companies/:companyId/agent-hires`

El cuerpo de la solicitud coincide con la forma de creación de agente:

```json
{
  "name": "CTO",
  "role": "cto",
  "title": "Chief Technology Officer",
  "icon": "crown",
  "reportsTo": "uuid-or-null",
  "capabilities": "Owns architecture and engineering execution",
  "desiredSkills": ["vercel-labs/agent-browser/agent-browser"],
  "adapterType": "claude_local",
  "adapterConfig": {
    "cwd": "/absolute/path",
    "model": "claude-sonnet-4-5-20250929",
    "promptTemplate": "You are CTO..."
  },
  "runtimeConfig": {
    "heartbeat": {
      "enabled": true,
      "intervalSec": 300,
      "wakeOnDemand": true
    }
  },
  "budgetMonthlyCents": 0,
  "sourceIssueId": "uuid-or-null",
  "sourceIssueIds": ["uuid-1", "uuid-2"]
}
```

Respuesta:

```json
{
  "agent": {
    "id": "uuid",
    "status": "pending_approval"
  },
  "approval": {
    "id": "uuid",
    "type": "hire_agent",
    "status": "pending",
    "payload": {
      "desiredSkills": ["vercel-labs/agent-browser/agent-browser"]
    }
  }
}
```

Si la configuración de la empresa desactiva la aprobación requerida, `approval` es `null` y el agente se crea como `idle`.

`desiredSkills` acepta IDs de skills de empresa, claves canónicas o un slug único. El servidor resuelve y almacena las claves canónicas de skills de empresa.

## Ciclo de Vida de la Aprobación

Estados:

- `pending`
- `revision_requested`
- `approved`
- `rejected`
- `cancelled`

Para aprobaciones de contratación:

- aprobada: el agente vinculado transiciona `pending_approval -> idle`
- rechazada: el agente vinculado es terminado

## Notas de Seguridad

- Las APIs de lectura de configuración redactan secretos obvios.
- Los agentes `pending_approval` no pueden ejecutar heartbeats, recibir asignaciones ni crear claves.
- Todas las acciones se registran en actividad para auditabilidad.
- Usa markdown en comentarios de issues/aprobaciones e incluye enlaces a la aprobación, agente e issue de origen.
- Después de la resolución de la aprobación, el solicitante puede ser despertado con `PAPERCLIP_APPROVAL_ID` y debe reconciliar los issues vinculados.
