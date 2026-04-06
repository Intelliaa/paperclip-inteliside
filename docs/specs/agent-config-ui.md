# UI de Configuración y Actividad de Agentes

## Contexto

Los agentes son los empleados de una compañía Paperclip. Cada agente tiene un tipo de adapter (`claude_local`, `codex_local`, `process`, `http`) que determina cómo se ejecuta, una posición en el organigrama (a quién reporta), una política de heartbeat (cómo/cuándo se despierta), y un presupuesto. La UI en `/agents` necesita soportar crear y configurar agentes, ver su jerarquía de organización, e inspeccionar qué han estado haciendo -- su historial de ejecuciones, logs en vivo, y costos acumulados.

Esta especificación cubre tres superficies:

1. **Diálogo de Creación de Agente** -- el flujo "Nuevo Agente"
2. **Página de Detalle de Agente** -- configuración, actividad, y logs
3. **Página de Lista de Agentes** -- mejoras a la lista existente

---

## 1. Diálogo de Creación de Agente

Sigue el patrón existente `NewIssueDialog` / `NewProjectDialog`: un componente `Dialog` con alternar expandir/minimizar, breadcrumb de badge de compañía, y submit con Cmd+Enter.

### Campos

**Identidad (siempre visible):**

| Campo | Control | Requerido | Predeterminado | Notas |
|-------|---------|----------|---------|-------|
| Nombre | Text input (grande, auto-enfocado) | Sí | -- | p.ej. "Alice", "Build Bot" |
| Título | Text input (estilo subtítulo) | No | -- | p.ej. "VP de Ingeniería" |
| Rol | Chip popover (seleccionar) | No | `general` | Valores de `AGENT_ROLES`: ceo, cto, cmo, cfo, engineer, designer, pm, qa, devops, researcher, general |
| Reporta a | Chip popover (seleccionar agente) | No | -- | Dropdown de agentes existentes en la compañía. Si este es el primer agente, auto-establecer rol a `ceo` y desactivar Reporta a. De lo contrario requerido a menos que rol sea `ceo`. |
| Capacidades | Text input | No | -- | Descripción de texto libre de qué puede hacer este agente |

**Adapter (sección colapsible, abierto por defecto):**

| Campo | Control | Predeterminado | Notas |
|-------|---------|---------|-------|
| Tipo de Adapter | Chip popover (seleccionar) | `claude_local` | `claude_local`, `codex_local`, `process`, `http` |
| Entorno de prueba | Botón | -- | Ejecuta diagnósticos específicos del adapter y retorna verificaciones pass/warn/fail para la configuración actual no guardada |
| CWD | Text input | -- | Directorio de trabajo para adapters locales |
| Plantilla de Prompt | Textarea | -- | Soporta `{{ agent.id }}`, `{{ agent.name }}` etc. |
| Modelo | Text input | -- | Anulación de modelo opcional |

**Campos específicos del adapter (mostrados/ocultados basado en tipo de adapter):**

*claude_local:*
| Campo | Control | Predeterminado |
|-------|---------|---------|
| Max Turns Por Ejecución | Number input | 80 |
| Saltar Permisos | Toggle | true |

*codex_local:*
| Campo | Control | Predeterminado |
|-------|---------|---------|
| Búsqueda | Toggle | false |
| Bypass Sandbox | Toggle | true |

*process:*
| Campo | Control | Predeterminado |
|-------|---------|---------|
| Comando | Text input | -- |
| Args | Text input (separado por comas) | -- |

*http:*
| Campo | Control | Predeterminado |
|-------|---------|---------|
| URL | Text input | -- |
| Método | Select | POST |
| Headers | Pares clave-valor | -- |

**Runtime (sección colapsible, colapsado por defecto):**

| Campo | Control | Predeterminado |
|-------|---------|---------|
| Modo de Contexto | Chip popover | `thin` |
| Presupuesto Mensual (centavos) | Number input | 0 |
| Timeout (seg) | Number input | 900 |
| Período de Gracia (seg) | Number input | 15 |
| Args Extra | Text input | -- |
| Variables Env | Editor de pares clave-valor | -- |

**Política de Heartbeat (sección colapsible, colapsado por defecto):**

| Campo | Control | Predeterminado |
|-------|---------|---------|
| Habilitado | Toggle | true |
| Intervalo (seg) | Number input | 300 |
| Despertar en Asignación | Toggle | true |
| Despertar en Bajo Demanda | Toggle | true |
| Despertar en Automatización | Toggle | true |
| Cooldown (seg) | Number input | 10 |

### Comportamiento

- Al submit, llama `agentsApi.create(companyId, data)` donde `data` empaqueta campos de identidad en el nivel superior y campos específicos del adapter en `adapterConfig` y heartbeat/runtime en `runtimeConfig`.
- Después de la creación, navega a la página de detalle del nuevo agente.
- Si la compañía tiene cero agentes, pre-llena rol como `ceo` y desactiva Reporta a.
- La sección de configuración del adapter actualiza sus campos visibles cuando el tipo de adapter cambia, preservando cualquier valor de campo compartido (cwd, promptTemplate, etc.).

---

## 2. Página de Detalle de Agente

Reestructura el layout tabbed existente. Mantén el header (nombre, rol, título, badge de estado, botones de acción) y agrega tabs más ricos.

### Header

```
[StatusBadge]  Nombre de Agente                    [Invocar] [Pausa/Reanudar] [...]
               Rol / Título
```

El menú de overflow `[...]` contiene: Terminar, Reiniciar Sesión, Crear Clave API.

### Tabs

#### Tab Descripción General

Layout de dos columnas: columna izquierda es una tarjeta de resumen, columna derecha es la posición de organización.

**Tarjeta de resumen:**
- Tipo de adapter + modelo (si está establecido)
- Intervalo de heartbeat (p.ej. "cada 5 min") o "Deshabilitado"
- Tiempo del último heartbeat (relativo, p.ej. "hace 3 min")
- Estado de sesión: "Activo (sesión abc123...)" o "Sin sesión"
- Gasto del mes actual / presupuesto con barra de progreso

**Tarjeta de posición de organización:**
- Reporta a: nombre de agente clickeable (enlace a su página de detalle)
- Reportes directos: lista de agentes que reportan a este agente (clickeable)

#### Tab de Configuración

Formulario editable con las mismas secciones que el diálogo de creación (Adapter, Runtime, Política de Heartbeat) pero pre-poblado con valores actuales. Usa edición inline -- haz clic en un valor para editar, presiona Enter o desenfoca para guardar vía `agentsApi.update()`.

Secciones:
- **Identidad**: nombre, título, rol, reporta a, capacidades
- **Configuración de Adapter**: todos los campos específicos del adapter para el tipo de adapter actual
- **Política de Heartbeat**: habilitar/deshabilitar, intervalo, triggers de despertar, cooldown
- **Runtime**: modo de contexto, presupuesto, timeout, gracia, variables env, args extra

Cada sección es una tarjeta colapsible. El guardado sucede por campo (PATCH en desenfoque/enter), no un único submit de formulario. Los errores de validación se muestran inline.

#### Tab de Ejecuciones

Esta es la vista principal de actividad/historial. Muestra una lista paginada de ejecuciones de heartbeat, la más reciente primero.

**Elemento de lista de ejecución:**
```
[StatusIcon] #run-id-short   source: timer     hace 2 min     1.2k tokens   $0.03
             "Revisó 3 PRs e filed 2 issues"
```

Campos por fila:
- Icono de estado (check verde = exitoso, X rojo = falló, spinner amarillo = corriendo, reloj gris = encolado, timeout naranja = timed_out, barra diagonal = cancelado)
- ID de Ejecución (corto, primeros 8 caracteres)
- Chip de fuente de invocación (timer, assignment, on_demand, automation)
- Timestamp relativo
- Resumen de uso de tokens (total input + output)
- Costo
- Resumen de resultado (primera línea de resultado o error)

**Hacer clic en una ejecución** abre un detalle de ejecución inline (expansión de acordeón) o un panel slide-over que muestra:

- Línea de tiempo de estado completo (encolado -> corriendo -> resultado) con timestamps
- Sesión antes/después
- Desglose de tokens: input, output, input cacheado
- Desglose de costo
- Mensaje de error y código de error (si falló)
- Código de salida y señal (si es aplicable)

**Visor de log** dentro del detalle de ejecución:
- Streams `heartbeat_run_events` para la ejecución, ordenado por `seq`
- Cada evento renderizado como una línea de log con timestamp, nivel (codificado por color), y mensaje
- Eventos de tipo `stdout`/`stderr` mostrados en monoespaciado
- Eventos del sistema mostrados con estilo distinto
- Para ejecuciones en corrimiento, auto-scrolls y se agrega en vivo vía WebSocket events (`heartbeat.run.event`, `heartbeat.run.log`)
- Enlace "Ver log completo" obtiene desde `heartbeatsApi.log(runId)` y muestra en un contenedor monoespaciado scrollable
- Truncamiento: mostrar últimos 200 eventos por defecto, botón "Cargar más" para obtener eventos anteriores

#### Tab de Issues

Mantén tal cual: lista de issues asignadas a este agente con estado, clickeable para navegar a detalle de issue.

#### Tab de Costos

Expande el tab de costos existente:

- **Totales acumulativos** desde `agent_runtime_state`: total de tokens input, total de tokens output, total de tokens cacheados, costo total
- **Barra de progreso de presupuesto mensual** (gasto del mes actual vs presupuesto)
- **Tabla de costo por ejecución**: fecha, ID de ejecución, tokens in/out/cached, costo -- ordenable por fecha o costo
- **Gráfico** (stretch): gráfico de barras simple de gasto diario en los últimos 30 días

### Panel de Propiedades (Barra Lateral Derecha)

El panel existente `AgentProperties` continúa mostrando la información de vista rápida. Agrega:
- ID de Sesión (truncado, con botón de copia)
- Último error (si hay, en rojo)
- Enlace a "Ver Configuración" (scrolls a / cambia a tab de Configuración)

---

## 3. Página de Lista de Agentes

### Estado actual

Muestra una lista plana de agentes con badge de estado, nombre, rol, título, y barra de presupuesto.

### Mejoras

**Agrega botón "Nuevo Agente"** en el header (Icono Plus + "Nuevo Agente"), abre el diálogo de creación.

**Agrega alternar de vista**: vista de Lista (actual) y vista de Organigrama.

**Vista de Organigrama:**
- Layout de árbol mostrando jerarquía de reporteo
- Cada nodo muestra: nombre de agente, rol, badge de estado
- CEO en la parte superior, reportes directos abajo, etc.
- Usa el endpoint `agentsApi.org(companyId)` que ya retorna `OrgNode[]`
- Hacer clic en un nodo navega a detalle de agente

**Mejoras de vista de Lista:**
- Agrega tipo de adapter como un chip/tag pequeño en cada fila
- Agrega timestamp relativo "última activo"
- Agrega indicador de corrimiento (punto animado) si el agente actualmente tiene un heartbeat corriendo

**Filtrado:**
- Filtros de Tab: Todos, Activos, Pausados, Error (similar al patrón de página de Issues)

---

## 4. Inventario de Componentes

Nuevos componentes necesarios:

| Componente | Propósito |
|-----------|---------|
| `NewAgentDialog` | Diálogo de formulario de creación de agente |
| `AgentConfigForm` | Secciones de formulario compartidas para crear + editar (adapter, heartbeat, runtime) |
| `AdapterConfigFields` | Campos condicionales basados en tipo de adapter |
| `HeartbeatPolicyFields` | Campos de configuración de heartbeat |
| `EnvVarEditor` | Editor de pares clave-valor para variables de entorno |
| `RunListItem` | Fila de ejecución única en la lista de ejecuciones |
| `RunDetail` | Detalle de ejecución expandido con visor de log |
| `LogViewer` | Visor de log streaming con auto-scroll |
| `OrgChart` | Visualización de árbol de jerarquía de agentes |
| `AgentSelect` | Selector de agente reutilizable (para Reporta a, etc.) |

Componentes existentes reutilizados:
- `StatusBadge`, `EntityRow`, `EmptyState`, `PropertyRow`
- shadcn: `Dialog`, `Tabs`, `Button`, `Popover`, `Command`, `Separator`, `Toggle`

---

## 5. Superficie de API

Todos los endpoints ya existen. Sin nuevo trabajo de servidor necesario para V1.

| Acción | Endpoint | Usado por |
|--------|----------|---------|
| Listar agentes | `GET /companies/:id/agents` | Página de lista |
| Obtener árbol de organización | `GET /companies/:id/org` | Vista de organigrama |
| Crear agente | `POST /companies/:id/agents` | Diálogo de creación |
| Actualizar agente | `PATCH /agents/:id` | Tab de configuración |
| Pausa/Reanudar/Terminar | `POST /agents/:id/{action}` | Acciones de header |
| Reiniciar sesión | `POST /agents/:id/runtime-state/reset-session` | Menú de overflow |
| Crear clave API | `POST /agents/:id/keys` | Menú de overflow |
| Obtener estado de runtime | `GET /agents/:id/runtime-state` | Tab descripción general, panel de propiedades |
| Invocar/Despertar | `POST /agents/:id/heartbeat/invoke` | Botón de invocación de header |
| Listar ejecuciones | `GET /companies/:id/heartbeat-runs?agentId=X` | Tab de ejecuciones |
| Cancelar ejecución | `POST /heartbeat-runs/:id/cancel` | Detalle de ejecución |
| Eventos de ejecución | `GET /heartbeat-runs/:id/events` | Visor de log |
| Log de ejecución | `GET /heartbeat-runs/:id/log` | Vista de log completo |

---

## 6. Orden de Implementación

1. **Diálogo Nuevo Agente** -- desbloquea creación de agente desde la UI
2. **Mejoras de Lista de Agentes** -- agrega botón Nuevo Agente, filtros de tab, chip de adapter, indicador de corrimiento
3. **Detalle de Agente: Tab de Configuración** -- configuración editable de adapter/heartbeat/runtime
4. **Detalle de Agente: Tab de Ejecuciones** -- lista de historial de ejecuciones con estado, tokens, costo
5. **Detalle de Agente: Detalle de Ejecución + Visor de Log** -- detalle de ejecución expandible con logs streaming
6. **Detalle de Agente: Tab Descripción General** -- tarjeta de resumen, posición de organización
7. **Detalle de Agente: Tab de Costos** -- desglose de costo expandido
8. **Vista de Organigrama** -- visualización de árbol en página de lista
9. **Actualizaciones de panel de propiedades** -- ID de sesión, último error

Los pasos 1-5 son el núcleo. Los pasos 6-9 son pulido.
