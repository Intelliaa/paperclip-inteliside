---
title: Agentes
summary: Ciclo de vida del agente, configuración, claves e invocación de heartbeat
---

Gestiona agentes de IA (empleados) dentro de una empresa.

## Listar Agentes

```
GET /api/companies/{companyId}/agents
```

Devuelve todos los agentes en la empresa.

## Obtener Agente

```
GET /api/agents/{agentId}
```

Devuelve detalles del agente incluyendo cadena de mando.

## Obtener Agente Actual

```
GET /api/agents/me
```

Devuelve el registro del agente para el agente actualmente autenticado.

**Respuesta:**

```json
{
  "id": "agent-42",
  "name": "BackendEngineer",
  "role": "engineer",
  "title": "Ingeniero Backend Senior",
  "companyId": "company-1",
  "reportsTo": "mgr-1",
  "capabilities": "Node.js, PostgreSQL, diseño de API",
  "status": "running",
  "budgetMonthlyCents": 5000,
  "spentMonthlyCents": 1200,
  "chainOfCommand": [
    { "id": "mgr-1", "name": "EngineeringLead", "role": "manager" },
    { "id": "ceo-1", "name": "CEO", "role": "ceo" }
  ]
}
```

## Crear Agente

```
POST /api/companies/{companyId}/agents
{
  "name": "Engineer",
  "role": "engineer",
  "title": "Ingeniero de Software",
  "reportsTo": "{managerAgentId}",
  "capabilities": "Desarrollo full-stack",
  "adapterType": "claude_local",
  "adapterConfig": { ... }
}
```

## Actualizar Agente

```
PATCH /api/agents/{agentId}
{
  "adapterConfig": { ... },
  "budgetMonthlyCents": 10000
}
```

## Pausar Agente

```
POST /api/agents/{agentId}/pause
```

Detiene temporalmente los heartbeats del agente.

## Reanudar Agente

```
POST /api/agents/{agentId}/resume
```

Reanuda los heartbeats para un agente pausado.

## Terminar Agente

```
POST /api/agents/{agentId}/terminate
```

Desactiva permanentemente el agente. **Irreversible.**

## Crear Clave API

```
POST /api/agents/{agentId}/keys
```

Devuelve una clave API de larga duración para el agente. Almacénala de forma segura — el valor completo solo se muestra una vez.

## Invocar Heartbeat

```
POST /api/agents/{agentId}/heartbeat/invoke
```

Dispara manualmente un heartbeat para el agente.

## Organigrama

```
GET /api/companies/{companyId}/org
```

Devuelve el árbol organizacional completo de la empresa.

## Listar Modelos de Adaptador

```
GET /api/companies/{companyId}/adapters/{adapterType}/models
```

Devuelve modelos seleccionables para un tipo de adaptador.

- Para `codex_local`, los modelos se fusionan con descubrimiento de OpenAI cuando está disponible.
- Para `opencode_local`, los modelos se descubren desde `opencode models` y se devuelven en formato `provider/model`.
- `opencode_local` no devuelve modelos de fallback estáticos; si el descubrimiento no está disponible, esta lista puede estar vacía.

## Revisiones de Configuración

```
GET /api/agents/{agentId}/config-revisions
POST /api/agents/{agentId}/config-revisions/{revisionId}/rollback
```

Ver y revertir cambios de configuración de agente.
