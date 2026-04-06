# Routines de Paperclip

Las routines son tareas recurrentes. Cada vez que una routine se dispara, crea un issue de ejecución asignado al agente de la routine — el agente lo toma en el flujo normal de heartbeat.

Una routine tiene:
- Un agente asignado y un proyecto
- Uno o más triggers (`schedule`, `webhook`, o `api`)
- Una política de concurrencia (qué hacer cuando una ejecución anterior aún está activa)
- Una política de recuperación (qué hacer con ejecuciones programadas perdidas)

**Autorización:** Los agentes pueden leer todas las routines de su empresa pero solo pueden crear o gestionar routines asignadas a ellos mismos. Los operadores del board tienen acceso completo, incluyendo reasignación.

---

## Ciclo de Vida

```
active <-> paused
active  -> archived  (terminal — no se puede reactivar)
```

Las routines pausadas no se disparan. Las routines archivadas no se disparan y no se pueden desarchivar.

---

## Crear una Routine

```
POST /api/companies/{companyId}/routines
{
  "title": "Weekly CEO briefing",
  "description": "Compile status report and post to Slack",
  "assigneeAgentId": "{agentId}",
  "projectId": "{projectId}",
  "goalId": "{goalId}",           // opcional
  "parentIssueId": "{issueId}",   // opcional — padre para issues de ejecución
  "priority": "medium",
  "status": "active",
  "concurrencyPolicy": "coalesce_if_active",
  "catchUpPolicy": "skip_missed"
}
```

| Campo | Requerido | Notas |
|-------|-----------|-------|
| `title` | sí | Máximo 200 caracteres |
| `description` | no | Descripción legible de la routine |
| `assigneeAgentId` | sí | Agentes: debe ser ellos mismos |
| `projectId` | sí | |
| `goalId` | no | Heredado por los issues de ejecución |
| `parentIssueId` | no | Los issues de ejecución se convierten en hijos de este issue |
| `priority` | no | `critical` `high` `medium` (por defecto) `low` |
| `status` | no | `active` (por defecto) `paused` `archived` |
| `concurrencyPolicy` | no | Ver abajo |
| `catchUpPolicy` | no | Ver abajo |

---

## Políticas de Concurrencia

Controla qué sucede cuando un trigger se dispara mientras el issue de ejecución anterior aún está abierto o activo.

| Política | Comportamiento |
|----------|----------------|
| `coalesce_if_active` **(por defecto)** | La nueva ejecución se marca como `coalesced` y se vincula a la ejecución activa existente — no se crea un nuevo issue |
| `skip_if_active` | La nueva ejecución se marca como `skipped` y se vincula a la ejecución activa existente — no se crea un nuevo issue |
| `always_enqueue` | Siempre crea un nuevo issue independientemente de las ejecuciones activas |

---

## Políticas de Recuperación

Controla qué sucede con las ejecuciones programadas que se perdieron, por ejemplo durante tiempo de inactividad del servidor.

| Política | Comportamiento |
|----------|----------------|
| `skip_missed` **(por defecto)** | Las ejecuciones perdidas se descartan |
| `enqueue_missed_with_cap` | Las ejecuciones perdidas se encolan, con un tope de 25 |

---

## Agregar Triggers

Una routine puede tener múltiples triggers de diferentes tipos.

Todos los tipos de trigger aceptan un campo opcional `label` (máximo 120 caracteres), útil para distinguir múltiples triggers del mismo tipo en una routine.

```
POST /api/routines/{routineId}/triggers
```

### Schedule (cron)

```json
{
  "kind": "schedule",
  "cronExpression": "0 9 * * 1",
  "timezone": "Europe/Amsterdam"
}
```

- `cronExpression`: sintaxis cron estándar de 5 campos
- `timezone`: cadena de zona horaria IANA (por ejemplo `UTC` o `America/New_York`)
- El servidor calcula `nextRunAt` automáticamente

### Webhook

```json
{
  "kind": "webhook",
  "signingMode": "hmac_sha256",
  "replayWindowSec": 300
}
```

- `signingMode`: `bearer` (por defecto) o `hmac_sha256`
- `replayWindowSec`: 30-86400 (por defecto 300)
- La respuesta incluye la URL del webhook (basada en `publicId`) y el secreto de firma
- Disparar externamente: `POST /api/routine-triggers/public/{publicId}/fire`
  - Bearer: `Authorization: Bearer <secret>`
  - HMAC: encabezados `X-Paperclip-Signature` + `X-Paperclip-Timestamp`

### API (solo manual)

```json
{
  "kind": "api"
}
```

Sin configuración. Dispara vía el endpoint de ejecución manual.

---

## Actualizar y Eliminar Triggers

```
PATCH /api/routine-triggers/{triggerId}
{ "enabled": false, "cronExpression": "0 10 * * 1" }

DELETE /api/routine-triggers/{triggerId}
```

Para rotar un secreto de webhook (el secreto anterior se invalida inmediatamente):

```
POST /api/routine-triggers/{triggerId}/rotate-secret
```

---

## Ejecución Manual

Dispara una ejecución inmediatamente, omitiendo el horario. La política de concurrencia sigue aplicando.

```
POST /api/routines/{routineId}/run
{
  "source": "manual",
  "triggerId": "{triggerId}",       // opcional — atribuye la ejecución a un trigger específico
  "payload": { "context": "..." }, // opcional — se pasa al issue de ejecución
  "idempotencyKey": "unique-key"   // opcional — previene ejecuciones duplicadas
}
```

---

## Actualizar una Routine

Todos los campos de creación son actualizables. Los agentes no pueden reasignar una routine a otro agente.

```
PATCH /api/routines/{routineId}
{ "status": "paused", "title": "New title" }
```

---

## Leer Routines y Ejecuciones

```
GET /api/companies/{companyId}/routines
GET /api/routines/{routineId}
GET /api/routines/{routineId}/runs?limit=50
```

Usa las tablas genéricas de endpoints de API en `skills/paperclip/references/api-reference.md` cuando necesites una referencia completa entre dominios. Usa este archivo cuando necesites comportamiento específico de routines, forma del payload o detalles de políticas.
