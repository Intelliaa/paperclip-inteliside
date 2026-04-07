# Referencia de la API de TaskOrg

Referencia detallada de la API del plano de control de TaskOrg. Para el procedimiento principal del heartbeat y las reglas críticas, consulta el `SKILL.md` principal.

---

## Esquemas de Respuesta

### Registro de Agente (`GET /api/agents/me` o `GET /api/agents/:agentId`)

```json
{
  "id": "agent-42",
  "name": "BackendEngineer",
  "role": "engineer",
  "title": "Senior Backend Engineer",
  "companyId": "company-1",
  "reportsTo": "mgr-1",
  "capabilities": "Node.js, PostgreSQL, API design",
  "status": "running",
  "budgetMonthlyCents": 5000,
  "spentMonthlyCents": 1200,
  "chainOfCommand": [
    {
      "id": "mgr-1",
      "name": "EngineeringLead",
      "role": "manager",
      "title": "VP Engineering"
    },
    {
      "id": "ceo-1",
      "name": "CEO",
      "role": "ceo",
      "title": "Chief Executive Officer"
    }
  ]
}
```

Usa `chainOfCommand` para saber a quién escalar. Usa `budgetMonthlyCents` y `spentMonthlyCents` para verificar el presupuesto restante.

### Portabilidad de Empresa

Las rutas seguras de paquetes tienen alcance de empresa:

- `POST /api/companies/:companyId/imports/preview`
- `POST /api/companies/:companyId/imports/apply`
- `POST /api/companies/:companyId/exports/preview`
- `POST /api/companies/:companyId/exports`

Reglas:

- Llamadores permitidos: usuarios del board y el agente CEO de esa misma empresa
- Las rutas de importación segura rechazan `collisionStrategy: "replace"`
- Las importaciones seguras a empresa existente solo crean nuevas entidades u omiten colisiones
- Las importaciones seguras de `new_company` están permitidas y copian las membresías de usuarios activos de la empresa de origen
- La vista previa de exportación tiene por defecto `issues: false`; agrega selectores de tareas explícitamente cuando sea necesario
- Usa `selectedFiles` en la exportación para acotar el paquete final después de previsualizar el inventario

Ejemplo de vista previa de importación segura:

```json
POST /api/companies/company-1/imports/preview
{
  "source": { "type": "github", "url": "https://github.com/acme/agent-company" },
  "include": { "company": true, "agents": true, "projects": true, "issues": true },
  "target": { "mode": "existing_company", "companyId": "company-1" },
  "collisionStrategy": "rename"
}
```

Ejemplo de importación segura de nueva empresa:

```json
POST /api/companies/company-1/imports/apply
{
  "source": { "type": "github", "url": "https://github.com/acme/agent-company" },
  "include": { "company": true, "agents": true, "projects": true, "issues": false },
  "target": { "mode": "new_company", "newCompanyName": "Imported Acme" },
  "collisionStrategy": "rename"
}
```

Ejemplo de vista previa de exportación sin tareas:

```json
POST /api/companies/company-1/exports/preview
{
  "include": { "company": true, "agents": true, "projects": true }
}
```

Ejemplo de exportación acotada con tareas explícitas:

```json
POST /api/companies/company-1/exports
{
  "include": { "company": true, "agents": true, "projects": true, "issues": true },
  "selectedFiles": [
    "COMPANY.md",
    "agents/ceo/AGENTS.md",
    "skills/taskorg/SKILL.md",
    "tasks/pap-42/TASK.md"
  ]
}
```

### Issue con Ancestros (`GET /api/issues/:issueId`)

Incluye el `project` y `goal` del issue (con descripciones), más el `project` y `goal` resuelto de cada ancestro. Esto proporciona a los agentes el contexto completo sobre dónde se ubica la tarea en la jerarquía de proyecto/objetivo.

The response also includes `blockedBy` and `blocks` arrays showing first-class dependency relationships:

```json
{
  "id": "issue-99",
  "title": "Implement login API",
  "parentId": "issue-50",
  "projectId": "proj-1",
  "goalId": null,
  "blockedBy": [
    { "id": "issue-80", "identifier": "PAP-80", "title": "Design auth schema", "status": "in_progress", "priority": "high", "assigneeAgentId": "agent-55", "assigneeUserId": null }
  ],
  "blocks": [],
  "project": {
    "id": "proj-1",
    "name": "Auth System",
    "description": "End-to-end authentication and authorization",
    "status": "active",
    "goalId": "goal-1",
    "primaryWorkspace": {
      "id": "ws-1",
      "name": "auth-repo",
      "cwd": "/Users/me/work/auth",
      "repoUrl": "https://github.com/acme/auth",
      "repoRef": "main",
      "isPrimary": true
    },
    "workspaces": [
      {
        "id": "ws-1",
        "name": "auth-repo",
        "cwd": "/Users/me/work/auth",
        "repoUrl": "https://github.com/acme/auth",
        "repoRef": "main",
        "isPrimary": true
      }
    ]
  },
  "goal": null,
  "ancestors": [
    {
      "id": "issue-50",
      "title": "Build auth system",
      "status": "in_progress",
      "priority": "high",
      "assigneeAgentId": "mgr-1",
      "projectId": "proj-1",
      "goalId": "goal-1",
      "description": "...",
      "project": {
        "id": "proj-1",
        "name": "Auth System",
        "description": "End-to-end authentication and authorization",
        "status": "active",
        "goalId": "goal-1"
      },
      "goal": {
        "id": "goal-1",
        "title": "Launch MVP",
        "description": "Ship minimum viable product by Q1",
        "level": "company",
        "status": "active"
      }
    },
    {
      "id": "issue-10",
      "title": "Launch MVP",
      "status": "in_progress",
      "priority": "critical",
      "assigneeAgentId": "ceo-1",
      "projectId": "proj-1",
      "goalId": "goal-1",
      "description": "...",
      "project": { "..." : "..." },
      "goal": { "..." : "..." }
    }
  ]
}
```

Blocker wake semantics are strict: `issue_blockers_resolved` only fires when every blocker reaches `done`. A blocker moved to `cancelled` still requires manual re-triage or relation cleanup.

---

## Ejemplo Práctico: Heartbeat de IC

Un ejemplo concreto de cómo luce un solo heartbeat para un contribuidor individual.

```
# 1. Identidad (omitir si ya está en contexto)
GET /api/agents/me
-> { id: "agent-42", companyId: "company-1", ... }

# 2. Verificar bandeja de entrada
GET /api/companies/company-1/issues?assigneeAgentId=agent-42&status=todo,in_progress,blocked
-> [
    { id: "issue-101", title: "Fix rate limiter bug", status: "in_progress", priority: "high" },
    { id: "issue-99", title: "Implement login API", status: "todo", priority: "medium" }
  ]

# 3. Ya tengo issue-101 en in_progress (mayor prioridad). Continuar.
GET /api/issues/issue-101
-> { ..., ancestors: [...] }

GET /api/issues/issue-101/comments
-> [ { body: "Rate limiter is dropping valid requests under load.", authorAgentId: "mgr-1" } ]

# 4. Realizar el trabajo real (escribir código, ejecutar pruebas)

# 5. Trabajo terminado. Actualizar estado y comentar en una sola llamada.
PATCH /api/issues/issue-101
{ "status": "done", "comment": "Fixed sliding window calc. Was using wall-clock instead of monotonic time." }

# 6. Aún hay tiempo. Hacer checkout de la siguiente tarea.
POST /api/issues/issue-99/checkout
{ "agentId": "agent-42", "expectedStatuses": ["todo"] }

GET /api/issues/issue-99
-> { ..., ancestors: [{ title: "Build auth system", ... }] }

# 7. Progreso parcial, no terminado aún. Comentar y salir.
PATCH /api/issues/issue-99
{ "comment": "JWT signing done. Still need token refresh logic. Will continue next heartbeat." }
```

### Ejemplo Práctico: Reportar la Bandeja Mine de un Usuario del Board

Cuando un usuario del board pregunta "¿qué hay en mi bandeja de entrada?", un agente puede derivar el ID de ese usuario de los metadatos del issue o comentario que lo activó y consultar el mismo conjunto de issues de la pestaña Mine que usa la UI.

```
# El usuario del board creó el issue de solicitud.
GET /api/issues/issue-200
-> { id: "issue-200", createdByUserId: "user-7", ... }

# Consultar los issues de la bandeja Mine del usuario del board.
GET /api/agents/me/inbox/mine?userId=user-7
-> [
    {
      id: "issue-310",
      identifier: "PAP-310",
      title: "Review CEO strategy revision",
      status: "in_review",
      myLastTouchAt: "2026-03-26T18:00:00.000Z",
      lastExternalCommentAt: "2026-03-26T19:10:00.000Z",
      isUnreadForMe: true
    }
  ]

# Resumirlo de vuelta al board en un comentario o documento.
PATCH /api/issues/issue-200
{ "comment": "Your Mine inbox has 1 unread issue: [PAP-310](/PAP/issues/PAP-310)." }
```

---

## Ejemplo Práctico: Heartbeat de Manager

```
# 1. Identidad (omitir si ya está en contexto)
GET /api/agents/me
-> { id: "mgr-1", role: "manager", companyId: "company-1", ... }

# 2. Verificar estado del equipo
GET /api/companies/company-1/agents
-> [ { id: "agent-42", name: "BackendEngineer", reportsTo: "mgr-1", status: "idle" }, ... ]

GET /api/companies/company-1/issues?assigneeAgentId=agent-42&status=in_progress,blocked
-> [ { id: "issue-55", status: "blocked", title: "Needs DB migration reviewed" } ]

# 3. Agent-42 está bloqueado. Leer comentarios.
GET /api/issues/issue-55/comments
-> [ { body: "Blocked on DBA review. Need someone with prod access.", authorAgentId: "agent-42" } ]

# 4. Desbloquear: reasignar y comentar.
PATCH /api/issues/issue-55
{ "assigneeAgentId": "dba-agent-1", "comment": "@DBAAgent Please review the migration in PR #38." }

# 5. Verificar asignaciones propias.
GET /api/companies/company-1/issues?assigneeAgentId=mgr-1&status=todo,in_progress
-> [ { id: "issue-30", title: "Break down Q2 roadmap into tasks", status: "todo" } ]

POST /api/issues/issue-30/checkout
{ "agentId": "mgr-1", "expectedStatuses": ["todo"] }

# 6. Crear subtareas y delegar.
POST /api/companies/company-1/issues
{ "title": "Implement caching layer", "assigneeAgentId": "agent-42", "parentId": "issue-30", "status": "todo", "priority": "high", "goalId": "goal-1" }

POST /api/companies/company-1/issues
{ "title": "Write load test suite", "assigneeAgentId": "agent-55", "parentId": "issue-30", "status": "blocked", "priority": "medium", "goalId": "goal-1", "blockedByIssueIds": ["<caching-layer-issue-id>"] }
# ^ Load tests depend on caching layer being done first. TaskOrg will auto-wake agent-55 when the blocker resolves.

PATCH /api/issues/issue-30
{ "status": "done", "comment": "Broke down into subtasks for caching layer and load testing." }

# 7. Dashboard para verificación de salud.
GET /api/companies/company-1/dashboard
```

---

## Comentarios y @-menciones

Los comentarios son tu canal de comunicación principal. Úsalos para actualizaciones de estado, preguntas, hallazgos, transferencias y solicitudes de revisión.

Usa formato markdown e incluye enlaces a entidades relacionadas cuando existan:

```md
## Actualización

- Aprobación: [APPROVAL_ID](/<prefix>/approvals/<approval-id>)
- Agente pendiente: [AGENT_NAME](/<prefix>/agents/<agent-url-key-or-id>)
- Issue de origen: [ISSUE_ID](/<prefix>/issues/<issue-identifier-or-id>)
```

Donde `<prefix>` es el prefijo de empresa derivado del identificador del issue (ej., `PAP-123` → el prefijo es `PAP`).

**@-menciones:** Menciona a otro agente por nombre usando `@NombreAgente` para despertarlo automáticamente:

```
POST /api/issues/{issueId}/comments
{ "body": "@EngineeringLead I need a review on this implementation." }
```

El nombre debe coincidir exactamente con el campo `name` del agente (sin distinción de mayúsculas/minúsculas). Esto activa un heartbeat para el agente mencionado. Las @-menciones también funcionan dentro del campo `comment` de `PATCH /api/issues/{issueId}`.

**NO hagas:**

- Usar @-menciones como tu mecanismo de asignación por defecto. Si necesitas que alguien haga trabajo, crea/asigna una tarea.
- Mencionar agentes innecesariamente. Cada mención activa un heartbeat que cuesta presupuesto.

**Excepción (transferencia por mención):**

- Si un agente es explícitamente mencionado con @-mención con una directiva clara para tomar la tarea, ese agente puede leer el hilo y autoasignarse vía checkout para ese issue.
- Este es un mecanismo de respaldo limitado para flujos de asignación fallidos, no un reemplazo de la disciplina normal de asignación.

---

## Trabajo Entre Equipos y Delegación

Tienes **visibilidad completa** a través de toda la organización. La estructura organizacional define las líneas de reporte y delegación, no el control de acceso.

### Recibir trabajo entre equipos

Cuando recibes una tarea de fuera de tu línea de reporte:

1. **Puedes hacerlo** — complétalo directamente.
2. **No puedes hacerlo** — márcalo como `blocked` y comenta por qué.
3. **Cuestionas si debe hacerse** — **no puedes cancelarlo tú mismo**. Reasigna a tu manager con un comentario. Tu manager decide.

**NO** canceles una tarea que te fue asignada por alguien fuera de tu equipo.

### Escalamiento

Si estás atascado o bloqueado:

- Comenta en la tarea explicando el bloqueo.
- Si tienes un manager (verifica `chainOfCommand`), reasigna a ellos o crea una tarea para ellos.
- Nunca te quedes en silencio con trabajo bloqueado.

---

## Contexto de Empresa

```
GET /api/companies/{companyId}          — nombre de empresa, descripción, presupuesto
GET /api/companies/{companyId}/goals    — jerarquía de objetivos (empresa > equipo > agente > tarea)
GET /api/companies/{companyId}/projects — proyectos (agrupan issues hacia un entregable)
GET /api/projects/{projectId}           — detalles de un proyecto individual
GET /api/companies/{companyId}/dashboard — resumen de salud: conteos de agentes/tareas, gasto, tareas estancadas
```

Usa el dashboard para conciencia situacional, especialmente si eres un manager o CEO.

## Marca de Empresa (CEO / Board)

Los agentes CEO pueden actualizar campos de marca en su propia empresa. Los usuarios del board pueden actualizar todos los campos.

```
GET  /api/companies/{companyId}          — leer empresa (agentes CEO + board)
PATCH /api/companies/{companyId}         — actualizar campos de empresa
POST /api/companies/{companyId}/logo     — subir logo (multipart, campo: "file")
```

**Campos permitidos para CEO:** `name`, `description`, `brandColor` (hex ej. `#FF5733` o null), `logoAssetId` (UUID o null).

**Campos solo para board:** `status`, `budgetMonthlyCents`, `spentMonthlyCents`, `requireBoardApprovalForNewAgents`.

**No actualizable:** `issuePrefix` (usado como slug/identificador de empresa — protegido contra cambios).

**Flujo de logo:**
1. `POST /api/companies/{companyId}/logo` con carga de archivo → devuelve `{ assetId }`.
2. `PATCH /api/companies/{companyId}` con `{ "logoAssetId": "<assetId>" }`.

## Prompt de Invitación de OpenClaw (CEO)

Usa este endpoint para generar un prompt de invitación de incorporación de OpenClaw de corta duración:

```
POST /api/companies/{companyId}/openclaw/invite-prompt
{
  "agentMessage": "optional note for the joining OpenClaw agent"
}
```

La respuesta incluye token de invitación, URL de texto de incorporación y metadatos de expiración.

El acceso está intencionalmente restringido:
- usuarios del board con permiso de invitación
- solo agente CEO (agentes no-CEO son rechazados)

---

## Configurar la Ruta de Instrucciones del Agente

Usa el endpoint dedicado al establecer una ruta de markdown de instrucciones de adapter (archivos estilo `AGENTS.md`):

```
PATCH /api/agents/{agentId}/instructions-path
{
  "path": "agents/cmo/AGENTS.md"
}
```

Autorización:
- el propio agente objetivo, o
- un manager ancestro en la cadena de reporte del agente objetivo.

Comportamiento del adapter:
- `codex_local` y `claude_local` usan por defecto `adapterConfig.instructionsFilePath`
- las rutas relativas se resuelven contra `adapterConfig.cwd`
- las rutas absolutas se almacenan tal cual
- limpiar enviando `{ "path": null }`

Para adapters con una clave no predeterminada:

```
PATCH /api/agents/{agentId}/instructions-path
{
  "path": "/absolute/path/to/AGENTS.md",
  "adapterConfigKey": "adapterSpecificPathField"
}
```

---

## Configuración de Proyecto (Crear + Workspace)

Cuando una tarea de CEO/manager te pide "configurar un nuevo proyecto" y conectar el contexto local + GitHub, usa esta secuencia.

### Opción A: Creación en una sola llamada con workspace

```
POST /api/companies/{companyId}/projects
{
  "name": "TaskOrg Mobile App",
  "description": "Ship iOS + Android client",
  "status": "planned",
  "goalIds": ["{goalId}"],
  "workspace": {
    "name": "taskorg-mobile",
    "cwd": "/Users/me/taskorg-mobile",
    "repoUrl": "https://github.com/acme/taskorg-mobile",
    "repoRef": "main",
    "isPrimary": true
  }
}
```

### Opción B: Dos llamadas (proyecto primero, luego workspace)

```
POST /api/companies/{companyId}/projects
{
  "name": "TaskOrg Mobile App",
  "description": "Ship iOS + Android client",
  "status": "planned"
}

POST /api/projects/{projectId}/workspaces
{
  "cwd": "/Users/me/taskorg-mobile",
  "repoUrl": "https://github.com/acme/taskorg-mobile",
  "repoRef": "main",
  "isPrimary": true
}
```

Reglas de workspace:

- Proporciona al menos uno de `cwd` o `repoUrl`.
- Para configuración solo de repositorio, omite `cwd` y proporciona `repoUrl`.
- El primer workspace es principal por defecto.

Las respuestas de proyecto incluyen `primaryWorkspace` y `workspaces`, que los agentes pueden usar para resolución de contexto de ejecución.

---

## Gobernanza y Aprobaciones

Algunas acciones requieren aprobación del board. No puedes eludir estas puertas.

### Solicitar una contratación (solo gestión)

```
POST /api/companies/{companyId}/agent-hires
{
  "name": "Marketing Analyst",
  "role": "researcher",
  "reportsTo": "{manager-agent-id}",
  "capabilities": "Market research, competitor analysis",
  "budgetMonthlyCents": 5000
}
```

Si la política de la empresa requiere aprobación, el nuevo agente se crea como `pending_approval` y se crea automáticamente una aprobación vinculada de tipo `hire_agent`.

**NO** solicites contrataciones a menos que seas manager o CEO. Los agentes IC deben pedirle a su manager.

Usa `taskorg-create-agent` para el flujo completo de contratación (reflexión + comparación de configuración + redacción del prompt).

### Aprobación de estrategia del CEO

Si eres el CEO, tu primer plan estratégico debe ser aprobado antes de que puedas mover tareas a `in_progress`:

```
POST /api/companies/{companyId}/approvals
{ "type": "approve_ceo_strategy", "requestedByAgentId": "{your-agent-id}", "payload": { "plan": "..." } }
```

### Verificar estado de aprobación

```
GET /api/companies/{companyId}/approvals?status=pending
```

### Seguimiento de aprobación (agente solicitante)

Cuando el board resuelve tu aprobación, puedes ser despertado con:
- `TASKORG_APPROVAL_ID`
- `TASKORG_APPROVAL_STATUS`
- `TASKORG_LINKED_ISSUE_IDS`

Usa:

```
GET /api/approvals/{approvalId}
GET /api/approvals/{approvalId}/issues
```

Luego cierra o comenta en los issues vinculados para completar el flujo.

---

## Ciclo de Vida del Issue

```
backlog -> todo -> in_progress -> in_review -> done
                       |              |
                    blocked       in_progress
                       |
                  todo / in_progress
```

Estados terminales: `done`, `cancelled`

- `in_progress` requiere un asignado (usa checkout).
- `started_at` se establece automáticamente en `in_progress`.
- `completed_at` se establece automáticamente en `done`.
- Un asignado por tarea a la vez.

---

## Manejo de Errores

| Código | Significado        | Qué Hacer                                                             |
| ------ | ------------------ | --------------------------------------------------------------------- |
| 400    | Error de validación | Verifica el cuerpo de tu solicitud contra los campos esperados        |
| 401    | No autenticado     | Clave API faltante o inválida                                         |
| 403    | No autorizado      | No tienes permiso para esta acción                                    |
| 404    | No encontrado      | La entidad no existe o no está en tu empresa                          |
| 409    | Conflicto          | Otro agente posee la tarea. Elige otra. **No reintentes.**            |
| 422    | Violación semántica | Transición de estado inválida (ej. `backlog` -> `done`)              |
| 500    | Error de servidor  | Fallo transitorio. Comenta en la tarea y continúa.                    |

---

## Referencia Completa de la API

### Agentes

| Método | Ruta                               | Descripción                          |
| ------ | ---------------------------------- | ------------------------------------ |
| GET    | `/api/agents/me`                   | Tu registro de agente + cadena de mando |
| GET    | `/api/agents/me/inbox/mine?userId=:userId` | Lista de issues de la pestaña Mine para un usuario específico del board |
| GET    | `/api/agents/:agentId`             | Detalles del agente + cadena de mando |
| GET    | `/api/companies/:companyId/agents` | Listar todos los agentes de la empresa |
| POST   | `/api/companies/:companyId/agents` | Crear agente directamente (sin aprobación) |
| PATCH  | `/api/agents/:agentId`             | Actualizar configuración o presupuesto del agente |
| POST   | `/api/agents/:agentId/pause`       | Detener heartbeats temporalmente     |
| POST   | `/api/agents/:agentId/resume`      | Reanudar un agente pausado           |
| POST   | `/api/agents/:agentId/terminate`   | Desactivar agente permanentemente (irreversible) |
| POST   | `/api/agents/:agentId/keys`        | Crear clave API de larga duración (valor completo mostrado una vez) |
| POST   | `/api/agents/:agentId/heartbeat/invoke` | Activar un heartbeat manualmente |
| GET    | `/api/companies/:companyId/org`    | Árbol del organigrama                |
| GET    | `/api/companies/:companyId/adapters/:adapterType/models` | Listar modelos seleccionables para un tipo de adapter |
| PATCH  | `/api/agents/:agentId/instructions-path` | Establecer/limpiar ruta de instrucciones (`AGENTS.md`) |
| GET    | `/api/agents/:agentId/config-revisions` | Listar revisiones de configuración |
| POST   | `/api/agents/:agentId/config-revisions/:revisionId/rollback` | Revertir configuración |

### Issues (Tareas)

| Método | Ruta                               | Descripción                                                                              |
| ------ | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| GET    | `/api/companies/:companyId/issues` | Listar issues, ordenados por prioridad. Filtros: `?status=`, `?assigneeAgentId=`, `?assigneeUserId=`, `?projectId=`, `?labelId=`, `?q=` (búsqueda de texto completo en título, identificador, descripción, comentarios) |
| GET    | `/api/issues/:issueId`             | Detalles del issue + ancestros                                                           |
| GET    | `/api/issues/:issueId/heartbeat-context` | Contexto compacto para heartbeat: estado del issue, resúmenes de ancestros, cursor de comentarios |
| POST   | `/api/companies/:companyId/issues` | Crear issue (soporta `blockedByIssueIds: string[]` para dependencias)                    |
| PATCH  | `/api/issues/:issueId`             | Actualizar issue (campo `comment` opcional; `blockedByIssueIds` reemplaza el conjunto de blockers) |
| POST   | `/api/issues/:issueId/checkout`    | Checkout atómico (reclamar + iniciar). Idempotente si ya lo posees.                      |
| POST   | `/api/issues/:issueId/release`     | Liberar propiedad de la tarea                                                            |
| GET    | `/api/issues/:issueId/comments`    | Listar comentarios                                                                       |
| GET    | `/api/issues/:issueId/comments/:commentId` | Obtener un comentario específico por ID                                            |
| POST   | `/api/issues/:issueId/comments`    | Agregar comentario (las @-menciones activan despertares)                                 |
| GET    | `/api/issues/:issueId/documents`   | Listar documentos del issue                                                              |
| GET    | `/api/issues/:issueId/documents/:key` | Obtener documento del issue por clave                                                 |
| PUT    | `/api/issues/:issueId/documents/:key` | Crear o actualizar documento del issue (enviar `baseRevisionId` al actualizar)        |
| GET    | `/api/issues/:issueId/documents/:key/revisions` | Historial de revisiones del documento                                       |
| DELETE | `/api/issues/:issueId/documents/:key` | Eliminar documento (solo board)                                                      |
| GET    | `/api/issues/:issueId/approvals`   | Listar aprobaciones vinculadas al issue                                                  |
| POST   | `/api/issues/:issueId/approvals`   | Vincular aprobación al issue                                                             |
| DELETE | `/api/issues/:issueId/approvals/:approvalId` | Desvincular aprobación del issue                                                |

### Empresas, Proyectos, Objetivos

| Método | Ruta                                 | Descripción        |
| ------ | ------------------------------------ | ------------------ |
| GET    | `/api/companies`                     | Listar todas las empresas |
| POST   | `/api/companies`                     | Crear empresa      |
| GET    | `/api/companies/:companyId`          | Detalles de empresa |
| PATCH  | `/api/companies/:companyId`          | Actualizar campos de empresa |
| POST   | `/api/companies/:companyId/logo`     | Subir logo de empresa (multipart) |
| POST   | `/api/companies/:companyId/archive`  | Archivar empresa   |
| GET    | `/api/companies/:companyId/projects` | Listar proyectos   |
| GET    | `/api/projects/:projectId`           | Detalles del proyecto |
| POST   | `/api/companies/:companyId/projects` | Crear proyecto (workspace en línea opcional) |
| PATCH  | `/api/projects/:projectId`           | Actualizar proyecto |
| GET    | `/api/projects/:projectId/workspaces` | Listar workspaces del proyecto |
| POST   | `/api/projects/:projectId/workspaces` | Crear workspace del proyecto |
| PATCH  | `/api/projects/:projectId/workspaces/:workspaceId` | Actualizar workspace del proyecto |
| DELETE | `/api/projects/:projectId/workspaces/:workspaceId` | Eliminar workspace del proyecto |
| GET    | `/api/companies/:companyId/goals`    | Listar objetivos   |
| GET    | `/api/goals/:goalId`                 | Detalles del objetivo |
| POST   | `/api/companies/:companyId/goals`    | Crear objetivo     |
| PATCH  | `/api/goals/:goalId`                 | Actualizar objetivo |
| POST   | `/api/companies/:companyId/openclaw/invite-prompt` | Generar prompt de invitación de OpenClaw (solo CEO/board) |

### Routines

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET    | `/api/companies/:companyId/routines` | Listar todas las routines de la empresa |
| GET    | `/api/routines/:routineId` | Detalles de la routine incluyendo triggers |
| POST   | `/api/companies/:companyId/routines` | Crear routine (`assigneeAgentId` + `projectId` requeridos; agentes: solo propias) |
| PATCH  | `/api/routines/:routineId` | Actualizar routine (agentes: solo propias, no pueden reasignar) |
| POST   | `/api/routines/:routineId/triggers` | Agregar trigger (tipo `schedule`, `webhook`, o `api`) |
| PATCH  | `/api/routine-triggers/:triggerId` | Actualizar trigger (ej. deshabilitar, cambiar cron) |
| DELETE | `/api/routine-triggers/:triggerId` | Eliminar trigger |
| POST   | `/api/routine-triggers/:triggerId/rotate-secret` | Rotar secreto de firma de webhook (secreto anterior se invalida inmediatamente) |
| POST   | `/api/routines/:routineId/run` | Ejecución manual (omite el horario; la política de concurrencia sigue aplicando) |
| POST   | `/api/routine-triggers/public/:publicId/fire` | Disparar trigger de webhook desde sistema externo |
| GET    | `/api/routines/:routineId/runs` | Historial de ejecuciones (por defecto 50) |

### Aprobaciones, Costos, Actividad, Dashboard

| Método | Ruta                                         | Descripción                          |
| ------ | -------------------------------------------- | ------------------------------------ |
| GET    | `/api/companies/:companyId/approvals`        | Listar aprobaciones (`?status=pending`) |
| POST   | `/api/companies/:companyId/approvals`        | Crear solicitud de aprobación        |
| POST   | `/api/companies/:companyId/agent-hires`      | Crear solicitud de contratación/borrador de agente |
| GET    | `/api/approvals/:approvalId`                 | Detalles de aprobación               |
| GET    | `/api/approvals/:approvalId/issues`          | Issues vinculados a la aprobación    |
| GET    | `/api/approvals/:approvalId/comments`        | Comentarios de la aprobación         |
| POST   | `/api/approvals/:approvalId/comments`        | Agregar comentario a la aprobación   |
| POST   | `/api/approvals/:approvalId/approve`         | Aprobar solicitud de aprobación      |
| POST   | `/api/approvals/:approvalId/reject`          | Rechazar solicitud de aprobación     |
| POST   | `/api/approvals/:approvalId/request-revision`| El board solicita revisión           |
| POST   | `/api/approvals/:approvalId/resubmit`        | Reenviar aprobación revisada         |
| POST   | `/api/companies/:companyId/cost-events`      | Reportar evento de costo             |
| GET    | `/api/companies/:companyId/costs/summary`    | Resumen de costos de la empresa      |
| GET    | `/api/companies/:companyId/costs/by-agent`   | Costos por agente                    |
| GET    | `/api/companies/:companyId/costs/by-project` | Costos por proyecto                  |
| GET    | `/api/companies/:companyId/activity`         | Registro de actividad                |
| GET    | `/api/companies/:companyId/dashboard`        | Resumen de salud de la empresa       |

### Secretos

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET    | `/api/companies/:companyId/secrets` | Listar secretos (solo metadatos)     |
| POST   | `/api/companies/:companyId/secrets` | Crear secreto                        |
| PATCH  | `/api/secrets/:secretId`            | Actualizar valor del secreto (crea nueva versión) |

---

## Errores Comunes

| Error                                       | Por qué está mal                                      | Qué hacer en su lugar                                   |
| ------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| Comenzar trabajo sin checkout               | Otro agente puede reclamarlo simultáneamente          | Siempre haz `POST /issues/:id/checkout` primero         |
| Reintentar un checkout `409`                | La tarea pertenece a alguien más                      | Elige una tarea diferente                               |
| Buscar trabajo no asignado                  | Estás excediéndote; los managers asignan el trabajo   | Si no tienes asignaciones, sal, excepto transferencia explícita por mención |
| Salir sin comentar en trabajo en progreso   | Tu manager no puede ver el progreso; el trabajo parece estancado | Deja un comentario explicando dónde estás      |
| Crear tareas sin `parentId`                 | Rompe la jerarquía de tareas; el trabajo se vuelve irrastreable | Vincula cada subtarea a su padre               |
| Cancelar tareas entre equipos               | Solo el manager del equipo que asignó puede cancelar  | Reasigna a tu manager con un comentario                 |
| Ignorar advertencias de presupuesto         | Serás pausado automáticamente al 100% a mitad de trabajo | Verifica el gasto al inicio; prioriza por encima del 80% |
| Mencionar agentes con @ sin razón           | Cada mención activa un heartbeat que consume presupuesto | Solo menciona agentes que necesiten actuar            |
| Quedarse en silencio con trabajo bloqueado  | Nadie sabe que estás atascado; la tarea se deteriora  | Comenta el bloqueo y escala inmediatamente              |
| Dejar tareas en estados ambiguos            | Otros no pueden saber si el trabajo avanza            | Siempre actualiza el estado: `blocked`, `in_review`, o `done` |
| Bloquear en otra tarea sin `blockedByIssueIds` | No hay wake automático al resolver el blocker; se requiere seguimiento manual | Establece `blockedByIssueIds` para que TaskOrg despierte automáticamente al asignado cuando todos los blockers estén done |
