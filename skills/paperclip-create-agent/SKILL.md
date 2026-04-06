---
name: paperclip-create-agent
description: >
  Crea nuevos agentes en Paperclip con contratación consciente de gobernanza. Úsalo cuando necesites
  inspeccionar opciones de configuración de adapter, comparar configuraciones de agentes existentes,
  redactar un prompt/configuración para un nuevo agente y enviar una solicitud de contratación.
---

# Skill de Creación de Agentes de Paperclip

Usa este skill cuando se te pida contratar/crear un agente.

## Precondiciones

Necesitas uno de:

- acceso al board, o
- permiso de agente `can_create_agents=true` en tu empresa

Si no tienes este permiso, escala a tu CEO o board.

## Flujo de Trabajo

1. Confirma la identidad y el contexto de la empresa.

```sh
curl -sS "$PAPERCLIP_API_URL/api/agents/me" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

2. Descubre la documentación de configuración de adapter disponible para esta instancia de Paperclip.

```sh
curl -sS "$PAPERCLIP_API_URL/llms/agent-configuration.txt" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

3. Lee la documentación específica del adapter (ejemplo: `claude_local`).

```sh
curl -sS "$PAPERCLIP_API_URL/llms/agent-configuration/claude_local.txt" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

4. Compara las configuraciones de agentes existentes en tu empresa.

```sh
curl -sS "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/agent-configurations" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

5. Descubre los iconos de agente permitidos y elige uno que coincida con el rol.

```sh
curl -sS "$PAPERCLIP_API_URL/llms/agent-icons.txt" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

6. Redacta la configuración del nuevo contratado:
- rol/título/nombre
- icono (requerido en la práctica; usa uno de `/llms/agent-icons.txt`)
- línea de reporte (`reportsTo`)
- tipo de adapter
- `desiredSkills` opcional de la biblioteca de skills de empresa cuando este rol necesita skills instalados desde el primer día
- configuración de adapter y runtime alineada a este entorno
- capacidades
- prompt de ejecución en la configuración del adapter (`promptTemplate` donde aplique)
- vinculación al issue de origen (`sourceIssueId` o `sourceIssueIds`) cuando esta contratación provino de un issue

7. Envía la solicitud de contratación.

```sh
curl -sS -X POST "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/agent-hires" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CTO",
    "role": "cto",
    "title": "Chief Technology Officer",
    "icon": "crown",
    "reportsTo": "<ceo-agent-id>",
    "capabilities": "Owns technical roadmap, architecture, staffing, execution",
    "desiredSkills": ["vercel-labs/agent-browser/agent-browser"],
    "adapterType": "codex_local",
    "adapterConfig": {"cwd": "/abs/path/to/repo", "model": "o4-mini"},
    "runtimeConfig": {"heartbeat": {"enabled": true, "intervalSec": 300, "wakeOnDemand": true}},
    "sourceIssueId": "<issue-id>"
  }'
```

8. Gestiona el estado de gobernanza:
- si la respuesta tiene `approval`, la contratación está en `pending_approval`
- monitorea y discute en el hilo de aprobación
- cuando el board apruebe, serás despertado con `PAPERCLIP_APPROVAL_ID`; lee los issues vinculados y cierra/comenta el seguimiento

```sh
curl -sS "$PAPERCLIP_API_URL/api/approvals/<approval-id>" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"

curl -sS -X POST "$PAPERCLIP_API_URL/api/approvals/<approval-id>/comments" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"body":"## CTO hire request submitted\n\n- Approval: [<approval-id>](/approvals/<approval-id>)\n- Pending agent: [<agent-ref>](/agents/<agent-url-key-or-id>)\n- Source issue: [<issue-ref>](/issues/<issue-identifier-or-id>)\n\nUpdated prompt and adapter config per board feedback."}'
```

Si la aprobación ya existe y necesita vinculación manual al issue:

```sh
curl -sS -X POST "$PAPERCLIP_API_URL/api/issues/<issue-id>/approvals" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"approvalId":"<approval-id>"}'
```

Después de que se otorgue la aprobación, ejecuta este bucle de seguimiento:

```sh
curl -sS "$PAPERCLIP_API_URL/api/approvals/$PAPERCLIP_APPROVAL_ID" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"

curl -sS "$PAPERCLIP_API_URL/api/approvals/$PAPERCLIP_APPROVAL_ID/issues" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

Para cada issue vinculado, ya sea:
- ciérralo si la aprobación resolvió la solicitud, o
- comenta en markdown con enlaces a la aprobación y las siguientes acciones.

## Barra de Calidad

Antes de enviar una solicitud de contratación:

- si el rol necesita skills, asegúrate de que ya existan en la biblioteca de la empresa o instálalos primero usando el flujo de skills de empresa de Paperclip
- Reutiliza patrones de configuración probados de agentes relacionados cuando sea posible.
- Establece un `icon` concreto de `/llms/agent-icons.txt` para que el nuevo contratado sea identificable en las vistas de organización y tareas.
- Evita secretos en texto plano a menos que el comportamiento del adapter lo requiera.
- Asegura que la línea de reporte sea correcta y dentro de la empresa.
- Asegura que el prompt sea específico del rol y con alcance operativo.
- Si el board solicita revisión, actualiza el payload y reenvía a través del flujo de aprobación.

Para formas de payload de endpoints y ejemplos completos, lee:
`skills/paperclip-create-agent/references/api-reference.md`
