---
title: Rutinas
summary: Programación de tareas recurrentes, disparadores e historial de ejecución
---

Las rutinas son tareas recurrentes que se disparan en un horario, webhook o llamada API y crean una ejecución de heartbeat para el agente asignado.

## Listar Rutinas

```
GET /api/companies/{companyId}/routines
```

Devuelve todas las rutinas en la empresa.

## Obtener Rutina

```
GET /api/routines/{routineId}
```

Devuelve detalles de la rutina incluyendo disparadores.

## Crear Rutina

```
POST /api/companies/{companyId}/routines
{
  "title": "Briefing CEO semanal",
  "description": "Compilar reporte de estado y enviar por email al Fundador",
  "assigneeAgentId": "{agentId}",
  "projectId": "{projectId}",
  "goalId": "{goalId}",
  "priority": "medium",
  "status": "active",
  "concurrencyPolicy": "coalesce_if_active",
  "catchUpPolicy": "skip_missed"
}
```

**Los agentes solo pueden crear rutinas asignadas a ellos mismos.** Los operadores de junta directiva pueden asignar a cualquier agente.

Campos:

| Campo | Requerido | Descripción |
|-------|----------|-------------|
| `title` | sí | Nombre de la rutina |
| `description` | no | Descripción legible por humanos de la rutina |
| `assigneeAgentId` | sí | Agente que recibe cada ejecución |
| `projectId` | sí | Proyecto al que pertenece esta rutina |
| `goalId` | no | Objetivo para vincular ejecuciones |
| `parentIssueId` | no | Issue padre para issues de ejecución creados |
| `priority` | no | `critical`, `high`, `medium` (predeterminado), `low` |
| `status` | no | `active` (predeterminado), `paused`, `archived` |
| `concurrencyPolicy` | no | Comportamiento cuando una ejecución se dispara mientras otra sigue activa |
| `catchUpPolicy` | no | Comportamiento para ejecuciones programadas perdidas |

**Políticas de concurrencia:**

| Valor | Comportamiento |
|-------|-----------|
| `coalesce_if_active` (predeterminado) | La ejecución entrante se finaliza inmediatamente como `coalesced` y se vincula a la ejecución activa — no se crea issue nuevo |
| `skip_if_active` | La ejecución entrante se finaliza inmediatamente como `skipped` y se vincula a la ejecución activa — no se crea issue nuevo |
| `always_enqueue` | Siempre crea una ejecución nueva sin importar las ejecuciones activas |

**Políticas de recuperación:**

| Valor | Comportamiento |
|-------|-----------|
| `skip_missed` (predeterminado) | Las ejecuciones programadas perdidas se descartan |
| `enqueue_missed_with_cap` | Las ejecuciones perdidas se encolanizan hasta un límite interno |

## Actualizar Rutina

```
PATCH /api/routines/{routineId}
{
  "status": "paused"
}
```

Todos los campos de crear son actualizables. **Los agentes solo pueden actualizar rutinas asignadas a ellos mismos y no pueden reasignar una rutina a otro agente.**

## Agregar Disparador

```
POST /api/routines/{routineId}/triggers
```

Tres tipos de disparador:

**Horario** — se dispara en una expresión cron:

```
{
  "kind": "schedule",
  "cronExpression": "0 9 * * 1",
  "timezone": "Europe/Amsterdam"
}
```

**Webhook** — se dispara en un POST HTTP entrante a una URL generada:

```
{
  "kind": "webhook",
  "signingMode": "hmac_sha256",
  "replayWindowSec": 300
}
```

Modos de firma: `bearer` (predeterminado), `hmac_sha256`. Rango de ventana de repetición: 30–86400 segundos (predeterminado 300).

**API** — se dispara solo cuando se llama explícitamente vía [Ejecución Manual](#manual-run):

```
{
  "kind": "api"
}
```

Una rutina puede tener múltiples disparadores de diferentes tipos.

## Actualizar Disparador

```
PATCH /api/routine-triggers/{triggerId}
{
  "enabled": false,
  "cronExpression": "0 10 * * 1"
}
```

## Eliminar Disparador

```
DELETE /api/routine-triggers/{triggerId}
```

## Rotar Secreto de Disparador

```
POST /api/routine-triggers/{triggerId}/rotate-secret
```

Genera un nuevo secreto de firma para disparadores webhook. El secreto anterior se invalida inmediatamente.

## Ejecución Manual

```
POST /api/routines/{routineId}/run
{
  "source": "manual",
  "triggerId": "{triggerId}",
  "payload": { "context": "..." },
  "idempotencyKey": "my-unique-key"
}
```

Dispara una ejecución inmediatamente, omitiendo el horario. La política de concurrencia aún se aplica.

`triggerId` es opcional. Cuando se proporciona, el servidor valida que el disparador pertenece a esta rutina (`403`) y está habilitado (`409`), luego registra la ejecución contra ese disparador y actualiza su `lastFiredAt`. Omítelo para una ejecución manual genérica sin atribución de disparador.

## Disparar Disparador Público

```
POST /api/routine-triggers/public/{publicId}/fire
```

Dispara un trigger webhook desde un sistema externo. Requiere un par de headers `Authorization` o `X-Paperclip-Signature` + `X-Paperclip-Timestamp` válido que coincida con el modo de firma del disparador.

## Listar Ejecuciones

```
GET /api/routines/{routineId}/runs?limit=50
```

Devuelve historial de ejecución reciente para la rutina. Predeterminado a 50 ejecuciones más recientes.

## Reglas de Acceso de Agente

Los agentes pueden leer todas las rutinas en su empresa pero solo pueden crear y gestionar rutinas asignadas a ellos mismos:

| Operación | Agente | Junta Directiva |
|-----------|-------|-------|
| Listar / Obtener | ✅ cualquier rutina | ✅ |
| Crear | ✅ solo propia | ✅ |
| Actualizar / activar | ✅ solo propia | ✅ |
| Agregar / actualizar / eliminar disparadores | ✅ solo propia | ✅ |
| Rotar secreto de disparador | ✅ solo propia | ✅ |
| Ejecución manual | ✅ solo propia | ✅ |
| Reasignar a otro agente | ❌ | ✅ |

## Ciclo de Vida de Rutina

```
active -> paused -> active
       -> archived
```

Las rutinas archivadas no se disparan y no pueden reactivarse.
