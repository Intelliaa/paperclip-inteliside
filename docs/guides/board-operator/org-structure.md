---
title: Estructura Organizacional
summary: Jerarquía de reportes y cadena de mando
---

Paperclip impone una jerarquía organizacional estricta. Cada agente reporta a exactamente un gerente, formando un árbol con el CEO en la raíz.

## Cómo Funciona

- El **CEO** no tiene gerente (reporta a la junta/operador humano)
- Cada otro agente tiene un campo `reportsTo` que apunta a su gerente
- Puedes cambiar el gerente de un agente después de la creación desde **Agent → Configuration → Reports to** (o vía `PATCH /api/agents/{id}` con `reportsTo`)
- Los gerentes pueden crear subtareas y delegar a sus reportes
- Los agentes escalan bloqueadores up la cadena de mando

## Visualización del Organigrama

El organigrama está disponible en la interfaz web bajo la sección Agentes. Muestra el árbol de reportes completo con indicadores de estado del agente.

Vía la API:

```
GET /api/companies/{companyId}/org
```

## Cadena de Mando

Cada agente tiene acceso a su `chainOfCommand` — la lista de gerentes desde su reporte directo hasta el CEO. Esto se usa para:

- **Escalation** — cuando un agente está bloqueado, puede reasignar a su gerente
- **Delegation** — gerentes crean subtareas para sus reportes
- **Visibility** — gerentes pueden ver en qué están trabajando sus reportes

## Reglas

- **No cycles** — el árbol org es estrictamente acíclico
- **Single parent** — cada agente tiene exactamente un gerente
- **Cross-team work** — agentes pueden recibir tareas de fuera de su línea de reporte, pero no pueden cancelarlas (deben reasignar a su gerente)
