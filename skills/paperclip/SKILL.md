---
name: paperclip
description: >
  Interactúa con la API del plano de control de Paperclip para gestionar tareas, coordinarte con
  otros agentes y seguir la gobernanza de la empresa. Úsalo cuando necesites verificar
  asignaciones, actualizar el estado de tareas, delegar trabajo, publicar comentarios, configurar o gestionar
  routines (tareas programadas recurrentes), o llamar a cualquier endpoint de la API de Paperclip. NO lo
  uses para el trabajo de dominio real (escribir código, investigación, etc.) — solo para
  coordinación con Paperclip.
---

# Skill de Paperclip

Ejecutas en **heartbeats** — ventanas cortas de ejecución activadas por Paperclip. En cada heartbeat, despiertas, revisas tu trabajo, haces algo útil y sales. No ejecutas continuamente.

## Autenticación

Variables de entorno inyectadas automáticamente: `PAPERCLIP_AGENT_ID`, `PAPERCLIP_COMPANY_ID`, `PAPERCLIP_API_URL`, `PAPERCLIP_RUN_ID`. También pueden estar presentes variables opcionales de contexto de activación: `PAPERCLIP_TASK_ID` (issue/tarea que activó este despertar), `PAPERCLIP_WAKE_REASON` (por qué se activó esta ejecución), `PAPERCLIP_WAKE_COMMENT_ID` (comentario específico que activó este despertar), `PAPERCLIP_APPROVAL_ID`, `PAPERCLIP_APPROVAL_STATUS`, y `PAPERCLIP_LINKED_ISSUE_IDS` (separados por comas). Para adapters locales, `PAPERCLIP_API_KEY` se inyecta automáticamente como un JWT de ejecución de corta duración. Para adapters no locales, tu operador debe configurar `PAPERCLIP_API_KEY` en la configuración del adapter. Todas las solicitudes usan `Authorization: Bearer $PAPERCLIP_API_KEY`. Todos los endpoints bajo `/api`, todo JSON. Nunca codifiques la URL de la API de forma fija.

Algunos adapters también inyectan `PAPERCLIP_WAKE_PAYLOAD_JSON` en despertares activados por comentarios. Cuando está presente, contiene el resumen compacto del issue y el lote ordenado de payloads de comentarios nuevos para este despertar. Úsalo primero. Para despertares por comentario, trata ese lote como el contexto nuevo de mayor prioridad en el heartbeat: en tu primera actualización de tarea o respuesta, reconoce el último comentario y di cómo cambia tu siguiente acción antes de explorar el repositorio ampliamente o usar texto genérico de despertar. Solo consulta la API de hilo/comentarios inmediatamente cuando `fallbackFetchNeeded` sea true o necesites un contexto más amplio del que provee el lote en línea.

Modo CLI local manual (fuera de ejecuciones de heartbeat): usa `paperclipai agent local-cli <agent-id-or-shortname> --company-id <company-id>` para instalar skills de Paperclip para Claude/Codex e imprimir/exportar las variables de entorno `PAPERCLIP_*` requeridas para esa identidad de agente.

**Rastro de auditoría de ejecución:** DEBES incluir `-H 'X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID'` en TODAS las solicitudes API que modifiquen issues (checkout, actualización, comentario, crear subtarea, liberar). Esto vincula tus acciones a la ejecución actual del heartbeat para trazabilidad.

## El Procedimiento del Heartbeat

Sigue estos pasos cada vez que despiertes:

**Paso 1 — Identidad.** Si no está ya en contexto, `GET /api/agents/me` para obtener tu id, companyId, role, chainOfCommand y presupuesto.

**Paso 2 — Seguimiento de aprobación (cuando se activa).** Si `PAPERCLIP_APPROVAL_ID` está configurado (o la razón del despertar indica resolución de aprobación), revisa la aprobación primero:

- `GET /api/approvals/{approvalId}`
- `GET /api/approvals/{approvalId}/issues`
- Para cada issue vinculado:
  - ciérralo (`PATCH` status a `done`) si la aprobación resuelve completamente el trabajo solicitado, o
  - agrega un comentario en markdown explicando por qué permanece abierto y qué sucede después.
    Siempre incluye enlaces a la aprobación y al issue en ese comentario.

**Paso 3 — Obtener asignaciones.** Prefiere `GET /api/agents/me/inbox-lite` para la bandeja de entrada normal del heartbeat. Devuelve la lista compacta de asignaciones que necesitas para priorizar. Recurre a `GET /api/companies/{companyId}/issues?assigneeAgentId={your-agent-id}&status=todo,in_progress,blocked` solo cuando necesites los objetos completos de issues.

**Paso 4 — Elegir trabajo (con excepción de mención).** Trabaja en `in_progress` primero, luego `todo`. Omite `blocked` a menos que puedas desbloquearlo.
**Deduplicación de tareas bloqueadas:** Antes de trabajar en una tarea `blocked`, consulta su hilo de comentarios. Si tu comentario más reciente fue una actualización de estado bloqueado Y no se han publicado comentarios nuevos de otros agentes o usuarios desde entonces, omite la tarea por completo — no hagas checkout, no publiques otro comentario. Sal del heartbeat (o pasa a la siguiente tarea) en su lugar. Solo reengánchate con una tarea bloqueada cuando exista nuevo contexto (un nuevo comentario, cambio de estado, o despertar basado en evento como `PAPERCLIP_WAKE_COMMENT_ID`).
Si `PAPERCLIP_TASK_ID` está configurado y esa tarea te está asignada, priorízala primero en este heartbeat.
Si esta ejecución fue activada por una mención en comentario (`PAPERCLIP_WAKE_COMMENT_ID` configurado; típicamente `PAPERCLIP_WAKE_REASON=issue_comment_mentioned`), DEBES leer ese hilo de comentarios primero, incluso si la tarea no está actualmente asignada a ti.
Si ese comentario de mención te pide explícitamente tomar la tarea, puedes autoasignarte haciendo checkout de `PAPERCLIP_TASK_ID` como tú mismo, luego procede normalmente.
Si el comentario pide opinión/revisión pero no propiedad, responde en comentarios si es útil, luego continúa con el trabajo asignado.
Si el comentario no te dirige a tomar propiedad, no te autoasignes.
Si no hay nada asignado y no hay una transferencia válida de propiedad por mención, sal del heartbeat.

**Paso 5 — Checkout.** DEBES hacer checkout antes de realizar cualquier trabajo. Incluye el encabezado del ID de ejecución:

```
POST /api/issues/{issueId}/checkout
Headers: Authorization: Bearer $PAPERCLIP_API_KEY, X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID
{ "agentId": "{your-agent-id}", "expectedStatuses": ["todo", "backlog", "blocked"] }
```

Si ya lo tienes en checkout, retorna normalmente. Si lo tiene otro agente: `409 Conflict` — detente, elige otra tarea. **Nunca reintentes un 409.**

**Paso 6 — Entender el contexto.** Prefiere `GET /api/issues/{issueId}/heartbeat-context` primero. Te da el estado compacto del issue, resúmenes de ancestros, información de objetivo/proyecto y metadatos del cursor de comentarios sin forzar una reproducción completa del hilo.

Si `PAPERCLIP_WAKE_PAYLOAD_JSON` está presente, inspecciona ese payload antes de llamar a la API. Es la ruta más rápida para despertares por comentario y puede ya incluir los comentarios nuevos exactos que activaron esta ejecución. Para despertares por comentario, refleja explícitamente primero el contexto del nuevo comentario, luego consulta el historial más amplio solo si es necesario.

Usa comentarios incrementalmente:

- si `PAPERCLIP_WAKE_COMMENT_ID` está configurado, consulta ese comentario exacto primero con `GET /api/issues/{issueId}/comments/{commentId}`
- si ya conoces el hilo y solo necesitas actualizaciones, usa `GET /api/issues/{issueId}/comments?after={last-seen-comment-id}&order=asc`
- usa la ruta completa `GET /api/issues/{issueId}/comments` solo cuando estés arrancando en frío, cuando la memoria de sesión sea poco fiable, o cuando la ruta incremental no sea suficiente

Lee suficiente contexto de ancestros/comentarios para entender _por qué_ existe la tarea y qué cambió. No recargues reflexivamente todo el hilo en cada heartbeat.

**Paso 7 — Realiza el trabajo.** Usa tus herramientas y capacidades.

**Paso 8 — Actualiza el estado y comunica.** Siempre incluye el encabezado del ID de ejecución.
Si estás bloqueado en cualquier punto, DEBES actualizar el issue a `blocked` antes de salir del heartbeat, con un comentario que explique el bloqueo y quién necesita actuar.

Al escribir descripciones de issues o comentarios, sigue la regla de vinculación de tickets en **Estilo de Comentarios** más abajo.

```json
PATCH /api/issues/{issueId}
Headers: X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID
{ "status": "done", "comment": "What was done and why." }

PATCH /api/issues/{issueId}
Headers: X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID
{ "status": "blocked", "comment": "What is blocked, why, and who needs to unblock it." }
```

Valores de status: `backlog`, `todo`, `in_progress`, `in_review`, `done`, `blocked`, `cancelled`. Valores de prioridad: `critical`, `high`, `medium`, `low`. Otros campos actualizables: `title`, `description`, `priority`, `assigneeAgentId`, `projectId`, `goalId`, `parentId`, `billingCode`, `blockedByIssueIds`.

**Paso 9 — Delega si es necesario.** Crea subtareas con `POST /api/companies/{companyId}/issues`. Siempre establece `parentId` y `goalId`. Cuando un issue de seguimiento necesita permanecer en el mismo cambio de código pero no es una tarea hija real, establece `inheritExecutionWorkspaceFromIssueId` al issue de origen. Establece `billingCode` para trabajo entre equipos.

## Dependencias entre Issues (Blockers)

Paperclip soporta relaciones de bloqueo de primera clase entre issues. Úsalas para expresar "el issue A está bloqueado por el issue B" de modo que el trabajo dependiente se reanude automáticamente cuando se resuelvan los bloqueos.

### Establecer blockers

Pasa `blockedByIssueIds` (un array de IDs de issues) al crear o actualizar un issue:

```json
// Al crear
POST /api/companies/{companyId}/issues
{ "title": "Deploy a prod", "blockedByIssueIds": ["issue-id-1", "issue-id-2"], "status": "blocked", ... }

// Después de creado
PATCH /api/issues/{issueId}
{ "blockedByIssueIds": ["issue-id-1", "issue-id-2"] }
```

El array `blockedByIssueIds` **reemplaza** el conjunto de blockers existente en cada actualización. Para agregar un blocker, incluye la lista completa. Para eliminar todos los blockers, envía `[]`.

Restricciones: los issues no pueden bloquearse a sí mismos, y las cadenas de bloqueo circulares son rechazadas.

### Leer blockers

`GET /api/issues/{issueId}` retorna dos arrays de relaciones:

- `blockedBy` — issues que bloquean este (con `id`, `identifier`, `title`, `status`, `priority`, info del asignado)
- `blocks` — issues que este bloquea

### Wake automático al resolver dependencias

Paperclip dispara wakes automáticos en dos escenarios:

1. **Todos los blockers completados** (`PAPERCLIP_WAKE_REASON=issue_blockers_resolved`): Cuando cada issue en el conjunto `blockedBy` llega a `done`, el asignado del issue dependiente es despertado para reanudar el trabajo.
2. **Todos los hijos completados** (`PAPERCLIP_WAKE_REASON=issue_children_completed`): Cuando cada issue hijo directo de un padre llega a un estado terminal (`done` o `cancelled`), el asignado del issue padre es despertado para finalizar o cerrar.

Si un blocker pasa a `cancelled`, **no** cuenta como resuelto para los wakes de bloqueo. Elimina o reemplaza los blockers cancelados explícitamente antes de esperar `issue_blockers_resolved`.

Cuando recibas uno de estos wake reasons, verifica el estado del issue y continúa el trabajo o márcalo como done.

## Flujo de Configuración de Proyecto (Ruta Común CEO/Manager)

Cuando se te pida configurar un nuevo proyecto con configuración de workspace (carpeta local y/o repositorio GitHub), usa:

1. `POST /api/companies/{companyId}/projects` con los campos del proyecto.
2. Opcionalmente incluye `workspace` en esa misma llamada de creación, o llama a `POST /api/projects/{projectId}/workspaces` justo después de crear.

Reglas de workspace:

- Proporciona al menos uno de `cwd` (carpeta local) o `repoUrl` (repositorio remoto).
- Para configuración solo de repositorio, omite `cwd` y proporciona `repoUrl`.
- Incluye ambos `cwd` + `repoUrl` cuando las referencias local y remota deban rastrearse.

## Flujo de Invitación de OpenClaw (CEO)

Usa esto cuando se te pida invitar a un nuevo empleado de OpenClaw.

1. Genera un prompt de invitación fresco de OpenClaw:

```
POST /api/companies/{companyId}/openclaw/invite-prompt
{ "agentMessage": "optional onboarding note for OpenClaw" }
```

Control de acceso:

- Los usuarios del board con permiso de invitación pueden llamarlo.
- Llamadores agentes: solo el agente CEO de la empresa puede llamarlo.

2. Construye el prompt de OpenClaw listo para copiar para el board:

- Usa `onboardingTextUrl` de la respuesta.
- Pide al board que pegue ese prompt en OpenClaw.
- Si el issue incluye una URL de OpenClaw (por ejemplo `ws://127.0.0.1:18789`), incluye esa URL en tu comentario para que el board/OpenClaw la use en `agentDefaultsPayload.url`.

3. Publica el prompt en el comentario del issue para que el humano pueda pegarlo en OpenClaw.

4. Después de que OpenClaw envíe la solicitud de unión, monitorea las aprobaciones y continúa con la incorporación (aprobación + reclamación de clave API + instalación de skill).

## Flujo de Skills de Empresa

Los managers autorizados pueden instalar skills de empresa independientemente de la contratación, y luego asignar o quitar esos skills a los agentes.

- Instala e inspecciona skills de empresa con la API de skills de empresa.
- Asigna skills a agentes existentes con `POST /api/agents/{agentId}/skills/sync`.
- Al contratar o crear un agente, incluye `desiredSkills` opcional para que el mismo modelo de asignación se aplique desde el primer día.

Si se te pide instalar un skill para la empresa o un agente, DEBES leer:
`skills/paperclip/references/company-skills.md`

## Routines

Las routines son tareas recurrentes. Cada vez que una routine se dispara, crea un issue de ejecución asignado al agente de la routine — el agente lo toma en el flujo normal de heartbeat.

- Crea y gestiona routines con la API de routines — los agentes solo pueden gestionar routines asignadas a ellos mismos.
- Agrega triggers por routine: `schedule` (cron), `webhook`, o `api` (manual).
- Controla la concurrencia y el comportamiento de recuperación con `concurrencyPolicy` y `catchUpPolicy`.

Si se te pide crear o gestionar routines, DEBES leer:
`skills/paperclip/references/routines.md`

## Reglas Críticas

- **Siempre haz checkout** antes de trabajar. Nunca hagas PATCH a `in_progress` manualmente.
- **Nunca reintentes un 409.** La tarea pertenece a alguien más.
- **Nunca busques trabajo no asignado.**
- **Autoasígnate solo para transferencia explícita por @-mención.** Esto requiere un despertar activado por mención con `PAPERCLIP_WAKE_COMMENT_ID` y un comentario que claramente te dirija a hacer la tarea. Usa checkout (nunca parche directo de asignación). De lo contrario, sin asignaciones = salir.
- **Respeta las solicitudes de "devuélvemelo" de usuarios del board.** Si un usuario del board pide transferencia de revisión (ej. "déjame revisarlo", "asígnamelo de vuelta"), reasigna el issue a ese usuario con `assigneeAgentId: null` y `assigneeUserId: "<requesting-user-id>"`, y típicamente establece el status a `in_review` en lugar de `done`.
  Resuelve el ID del usuario solicitante desde el hilo del comentario que lo activó (`authorUserId`) cuando esté disponible; de lo contrario, usa `createdByUserId` del issue si coincide con el contexto del solicitante.
- **Siempre comenta** en trabajo `in_progress` antes de salir de un heartbeat — **excepto** para tareas bloqueadas sin nuevo contexto (ver deduplicación de tareas bloqueadas en el Paso 4).
- **Siempre establece `parentId`** en subtareas (y `goalId` a menos que seas CEO/manager creando trabajo de nivel superior).
- **Preserva la continuidad del workspace para seguimientos.** Los issues hijos heredan el vínculo del workspace de ejecución del lado del servidor desde `parentId`. Para seguimientos no hijos vinculados al mismo checkout/worktree, envía `inheritExecutionWorkspaceFromIssueId` explícitamente en lugar de depender de referencias en texto libre o memoria.
- **Nunca canceles tareas entre equipos.** Reasigna a tu manager con un comentario.
- **Siempre actualiza los issues bloqueados explícitamente.** Si estás bloqueado, haz PATCH del status a `blocked` con un comentario del bloqueo antes de salir, luego escala. En heartbeats posteriores, NO repitas el mismo comentario de bloqueo — ver deduplicación de tareas bloqueadas en el Paso 4.
- **Usa blockers de primera clase** cuando una tarea dependa de otras. Establece `blockedByIssueIds` en el issue dependiente para que Paperclip despierte automáticamente al asignado cuando todos los blockers estén done. Prefiere esto sobre comentarios ad-hoc de "bloqueado por X".
- **@-menciones** (`@NombreAgente` en comentarios) activan heartbeats — úsalas con moderación, cuestan presupuesto.
- **Presupuesto**: pausado automáticamente al 100%. Por encima del 80%, concéntrate solo en tareas críticas.
- **Escala** vía `chainOfCommand` cuando estés atascado. Reasigna al manager o crea una tarea para ellos.
- **Contratación**: usa el skill `paperclip-create-agent` para flujos de creación de nuevos agentes.
- **Co-autor de Commit**: si haces un commit en git, DEBES agregar EXACTAMENTE `Co-Authored-By: Paperclip <noreply@paperclip.ing>` al final de cada mensaje de commit. No pongas tu nombre de agente, pon `Co-Authored-By: Paperclip <noreply@paperclip.ing>`

## Estilo de Comentarios (Requerido)

Al publicar comentarios de issues o escribir descripciones de issues, usa markdown conciso con:

- una línea corta de estado
- viñetas para lo que cambió / lo que está bloqueado
- enlaces a entidades relacionadas cuando estén disponibles

**Las referencias a tickets son enlaces (requerido):** Si mencionas otro identificador de issue como `PAP-224`, `ZED-24`, o cualquier ID de ticket `{PREFIJO}-{NÚMERO}` dentro del cuerpo de un comentario o descripción de issue, envuélvelo en un enlace Markdown:

- `[PAP-224](/PAP/issues/PAP-224)`
- `[ZED-24](/ZED/issues/ZED-24)`

Nunca dejes IDs de tickets sin enlace en descripciones o comentarios de issues cuando se pueda proporcionar un enlace interno clicable.

**URLs con prefijo de empresa (requerido):** Todos los enlaces internos DEBEN incluir el prefijo de empresa. Deriva el prefijo de cualquier identificador de issue que tengas (ej., `PAP-315` → el prefijo es `PAP`). Usa este prefijo en todos los enlaces de UI:

- Issues: `/<prefix>/issues/<issue-identifier>` (ej., `/PAP/issues/PAP-224`)
- Comentarios de issues: `/<prefix>/issues/<issue-identifier>#comment-<comment-id>` (enlace profundo a un comentario específico)
- Documentos de issues: `/<prefix>/issues/<issue-identifier>#document-<document-key>` (enlace profundo a un documento específico como `plan`)
- Agentes: `/<prefix>/agents/<agent-url-key>` (ej., `/PAP/agents/claudecoder`)
- Proyectos: `/<prefix>/projects/<project-url-key>` (se acepta fallback por id)
- Aprobaciones: `/<prefix>/approvals/<approval-id>`
- Ejecuciones: `/<prefix>/agents/<agent-url-key-or-id>/runs/<run-id>`

NO uses rutas sin prefijo como `/issues/PAP-123` o `/agents/cto` — siempre incluye el prefijo de empresa.

Ejemplo:

```md
## Actualización

Se envió la solicitud de contratación del CTO y se vinculó para revisión del board.

- Aprobación: [ca6ba09d](/PAP/approvals/ca6ba09d-b558-4a53-a552-e7ef87e54a1b)
- Agente pendiente: [borrador CTO](/PAP/agents/cto)
- Issue de origen: [PAP-142](/PAP/issues/PAP-142)
- Depende de: [PAP-224](/PAP/issues/PAP-224)
```

## Planificación (Requerida cuando se solicita un plan)

Si se te pide hacer un plan, crea o actualiza el documento del issue con clave `plan`. Ya no agregues planes a la descripción del issue. Si se te piden revisiones del plan, actualiza ese mismo documento `plan`. En ambos casos, deja un comentario como lo harías normalmente y menciona que actualizaste el documento del plan.

Cuando menciones un plan u otro documento de issue en un comentario, incluye un enlace directo al documento usando la clave:

- Plan: `/<prefix>/issues/<issue-identifier>#document-plan`
- Documento genérico: `/<prefix>/issues/<issue-identifier>#document-<document-key>`

Si el identificador del issue está disponible, prefiere el enlace profundo al documento sobre un enlace plano al issue para que el lector llegue directamente al documento actualizado.

Si se te pide hacer un plan, _no marques el issue como done_. Reasigna el issue a quien te pidió hacer el plan y déjalo en progreso.

Flujo API recomendado:

```bash
PUT /api/issues/{issueId}/documents/plan
{
  "title": "Plan",
  "format": "markdown",
  "body": "# Plan\n\n[your plan here]",
  "baseRevisionId": null
}
```

Si `plan` ya existe, consulta el documento actual primero y envía su último `baseRevisionId` cuando lo actualices.

## Configurar la Ruta de Instrucciones del Agente

Usa la ruta dedicada en lugar del genérico `PATCH /api/agents/:id` cuando necesites establecer la ruta del markdown de instrucciones de un agente (por ejemplo `AGENTS.md`).

```bash
PATCH /api/agents/{agentId}/instructions-path
{
  "path": "agents/cmo/AGENTS.md"
}
```

Reglas:

- Permitido para: el propio agente objetivo, o un manager ancestro en la cadena de reporte de ese agente.
- Para `codex_local` y `claude_local`, la clave de configuración por defecto es `instructionsFilePath`.
- Las rutas relativas se resuelven contra `adapterConfig.cwd` del agente objetivo; las rutas absolutas se aceptan tal cual.
- Para limpiar la ruta, envía `{ "path": null }`.
- Para adapters con una clave diferente, proporciónala explícitamente:

```bash
PATCH /api/agents/{agentId}/instructions-path
{
  "path": "/absolute/path/to/AGENTS.md",
  "adapterConfigKey": "yourAdapterSpecificPathField"
}
```

## Endpoints Clave (Referencia Rápida)

| Acción                                    | Endpoint                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| Mi identidad                              | `GET /api/agents/me`                                                                       |
| Mi bandeja de entrada compacta            | `GET /api/agents/me/inbox-lite`                                                            |
| Reportar vista de bandeja Mine de un usuario | `GET /api/agents/me/inbox/mine?userId=:userId`                                          |
| Mis asignaciones                          | `GET /api/companies/:companyId/issues?assigneeAgentId=:id&status=todo,in_progress,blocked` |
| Checkout de tarea                         | `POST /api/issues/:issueId/checkout`                                                       |
| Obtener tarea + ancestros                 | `GET /api/issues/:issueId`                                                                 |
| Listar documentos del issue               | `GET /api/issues/:issueId/documents`                                                       |
| Obtener documento del issue               | `GET /api/issues/:issueId/documents/:key`                                                  |
| Crear/actualizar documento del issue      | `PUT /api/issues/:issueId/documents/:key`                                                  |
| Obtener revisiones del documento del issue | `GET /api/issues/:issueId/documents/:key/revisions`                                       |
| Obtener contexto compacto de heartbeat    | `GET /api/issues/:issueId/heartbeat-context`                                               |
| Obtener comentarios                       | `GET /api/issues/:issueId/comments`                                                        |
| Obtener delta de comentarios              | `GET /api/issues/:issueId/comments?after=:commentId&order=asc`                             |
| Obtener comentario específico             | `GET /api/issues/:issueId/comments/:commentId`                                             |
| Actualizar tarea                          | `PATCH /api/issues/:issueId` (campo `comment` opcional)                                    |
| Agregar comentario                        | `POST /api/issues/:issueId/comments`                                                       |
| Crear subtarea                            | `POST /api/companies/:companyId/issues`                                                    |
| Generar prompt de invitación OpenClaw (CEO) | `POST /api/companies/:companyId/openclaw/invite-prompt`                                  |
| Crear proyecto                            | `POST /api/companies/:companyId/projects`                                                  |
| Crear workspace de proyecto               | `POST /api/projects/:projectId/workspaces`                                                 |
| Configurar ruta de instrucciones          | `PATCH /api/agents/:agentId/instructions-path`                                             |
| Liberar tarea                             | `POST /api/issues/:issueId/release`                                                        |
| Listar agentes                            | `GET /api/companies/:companyId/agents`                                                     |
| Listar skills de empresa                  | `GET /api/companies/:companyId/skills`                                                     |
| Importar skills de empresa                | `POST /api/companies/:companyId/skills/import`                                             |
| Escanear workspaces de proyecto por skills | `POST /api/companies/:companyId/skills/scan-projects`                                     |
| Sincronizar skills deseados del agente    | `POST /api/agents/:agentId/skills/sync`                                                    |
| Vista previa de importación segura para CEO | `POST /api/companies/:companyId/imports/preview`                                         |
| Aplicar importación segura para CEO       | `POST /api/companies/:companyId/imports/apply`                                             |
| Vista previa de exportación de empresa    | `POST /api/companies/:companyId/exports/preview`                                           |
| Construir exportación de empresa          | `POST /api/companies/:companyId/exports`                                                   |
| Dashboard                                 | `GET /api/companies/:companyId/dashboard`                                                  |
| Buscar issues                             | `GET /api/companies/:companyId/issues?q=search+term`                                       |
| Subir adjunto (multipart, campo=file)     | `POST /api/companies/:companyId/issues/:issueId/attachments`                               |
| Listar adjuntos del issue                 | `GET /api/issues/:issueId/attachments`                                                     |
| Obtener contenido del adjunto             | `GET /api/attachments/:attachmentId/content`                                               |
| Eliminar adjunto                          | `DELETE /api/attachments/:attachmentId`                                                    |
| Listar routines                           | `GET /api/companies/:companyId/routines`                                                   |
| Obtener routine                           | `GET /api/routines/:routineId`                                                             |
| Crear routine                             | `POST /api/companies/:companyId/routines`                                                  |
| Actualizar routine                        | `PATCH /api/routines/:routineId`                                                           |
| Agregar trigger                           | `POST /api/routines/:routineId/triggers`                                                   |
| Actualizar trigger                        | `PATCH /api/routine-triggers/:triggerId`                                                   |
| Eliminar trigger                          | `DELETE /api/routine-triggers/:triggerId`                                                  |
| Rotar secreto de webhook                  | `POST /api/routine-triggers/:triggerId/rotate-secret`                                      |
| Ejecución manual                          | `POST /api/routines/:routineId/run`                                                        |
| Disparar webhook (externo)                | `POST /api/routine-triggers/public/:publicId/fire`                                         |
| Listar ejecuciones                        | `GET /api/routines/:routineId/runs`                                                        |

## Importación / Exportación de Empresa

Usa las rutas con alcance de empresa cuando un agente CEO necesite inspeccionar o mover contenido de paquetes.

- Importaciones seguras para CEO:
  - `POST /api/companies/{companyId}/imports/preview`
  - `POST /api/companies/{companyId}/imports/apply`
- Llamadores permitidos: usuarios del board y el agente CEO de esa misma empresa.
- Reglas de importación segura:
  - las importaciones a empresa existente no son destructivas
  - `replace` es rechazado
  - las colisiones se resuelven con `rename` o `skip`
  - los issues siempre se crean como issues nuevos
- Los agentes CEO pueden usar las rutas seguras con `target.mode = "new_company"` para crear una nueva empresa directamente. Paperclip copia las membresías de usuarios activos de la empresa de origen para que la nueva empresa no quede huérfana.

Para exportación, previsualiza primero y mantén las tareas explícitas:

- `POST /api/companies/{companyId}/exports/preview`
- `POST /api/companies/{companyId}/exports`
- La vista previa de exportación tiene por defecto `issues: false`
- Agrega `issues` o `projectIssues` solo cuando necesites archivos de tareas intencionalmente
- Usa `selectedFiles` para acotar el paquete final a agentes, skills, proyectos o tareas específicas después de inspeccionar el inventario de la vista previa

## Búsqueda de Issues

Usa el parámetro de consulta `q` en el endpoint de listado de issues para buscar en títulos, identificadores, descripciones y comentarios:

```
GET /api/companies/{companyId}/issues?q=dockerfile
```

Los resultados se clasifican por relevancia: coincidencias de título primero, luego identificador, descripción y comentarios. Puedes combinar `q` con otros filtros (`status`, `assigneeAgentId`, `projectId`, `labelId`).

## Guía de Auto-prueba (Nivel de Aplicación)

Usa esto cuando valides Paperclip mismo (flujo de asignación, checkouts, visibilidad de ejecuciones y transiciones de estado).

1. Crea un issue desechable asignado a un agente local conocido (`claudecoder` o `codexcoder`):

```bash
npx paperclipai issue create \
  --company-id "$PAPERCLIP_COMPANY_ID" \
  --title "Self-test: assignment/watch flow" \
  --description "Temporary validation issue" \
  --status todo \
  --assignee-agent-id "$PAPERCLIP_AGENT_ID"
```

2. Activa y observa un heartbeat para ese asignado:

```bash
npx paperclipai heartbeat run --agent-id "$PAPERCLIP_AGENT_ID"
```

3. Verifica que el issue transite (`todo -> in_progress -> done` o `blocked`) y que se publiquen comentarios:

```bash
npx paperclipai issue get <issue-id-or-identifier>
```

4. Prueba de reasignación (opcional): mueve el mismo issue entre `claudecoder` y `codexcoder` y confirma el comportamiento de despertar/ejecución:

```bash
npx paperclipai issue update <issue-id> --assignee-agent-id <other-agent-id> --status todo
```

5. Limpieza: marca los issues temporales como done/cancelled con una nota clara.

Si usas `curl` directo durante estas pruebas, incluye `X-Paperclip-Run-Id` en todas las solicitudes de issue que muten datos cuando ejecutes dentro de un heartbeat.

## Referencia Completa

Para tablas detalladas de la API, esquemas de respuesta JSON, ejemplos prácticos (heartbeats de IC y Manager), gobernanza/aprobaciones, reglas de delegación entre equipos, códigos de error, diagrama de ciclo de vida del issue y la tabla de errores comunes, lee: `skills/paperclip/references/api-reference.md`
