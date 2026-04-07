---
name: create-agent-adapter
description: >
  Guía técnica para crear un nuevo adapter de agente de TaskOrg. Usar al construir
  un nuevo paquete de adapter, agregar soporte para una nueva herramienta de codificación
  con IA (ej. un nuevo agente CLI, agente basado en API o proceso personalizado), o al
  modificar el sistema de adapters. Cubre las interfaces requeridas, estructura de
  módulos, puntos de registro y convenciones derivadas de los adapters existentes
  claude-local y codex-local.
---

# Crear un Adapter de Agente de TaskOrg

Un adapter conecta la capa de orquestación de TaskOrg con un runtime específico de agente de IA (Claude Code, Codex CLI, un proceso personalizado, un endpoint HTTP, etc.). Cada adapter es un paquete autocontenido que proporciona implementaciones para **tres consumidores**: el servidor, la UI y el CLI.

---

## 1. Visión General de la Arquitectura

```
packages/adapters/<name>/
  src/
    index.ts            # Metadatos compartidos (type, label, models, agentConfigurationDoc)
    server/
      index.ts          # Exportaciones del servidor: execute, sessionCodec, helpers de parseo
      execute.ts        # Lógica central de ejecución (AdapterExecutionContext -> AdapterExecutionResult)
      parse.ts          # Parseo de stdout/resultado para el formato de salida del agente
    ui/
      index.ts          # Exportaciones de UI: parseStdoutLine, buildConfig
      parse-stdout.ts   # Línea por línea stdout -> TranscriptEntry[] para el visor de ejecución
      build-config.ts   # CreateConfigValues -> JSON de adapterConfig para el formulario de creación de agente
    cli/
      index.ts          # Exportaciones de CLI: formatStdoutEvent
      format-event.ts   # Salida coloreada de terminal para `taskorg run --watch`
  package.json
  tsconfig.json
```

Tres registros separados consumen módulos de adapter:

| Registro | Ubicación | Interfaz |
|----------|-----------|----------|
| Servidor | `server/src/adapters/registry.ts` | `ServerAdapterModule` |
| UI | `ui/src/adapters/registry.ts` | `UIAdapterModule` |
| CLI | `cli/src/adapters/registry.ts` | `CLIAdapterModule` |

---

## 2. Tipos Compartidos (`@taskorg/adapter-utils`)

Todas las interfaces de adapter viven en `packages/adapter-utils/src/types.ts`. Importar desde `@taskorg/adapter-utils` (tipos) o `@taskorg/adapter-utils/server-utils` (helpers de runtime).

### Interfaces Principales

```ts
// La firma de la función execute — cada adapter debe implementar esto
interface AdapterExecutionContext {
  runId: string;
  agent: AdapterAgent;          // { id, companyId, name, adapterType, adapterConfig }
  runtime: AdapterRuntime;      // { sessionId, sessionParams, sessionDisplayId, taskKey }
  config: Record<string, unknown>;  // El blob de adapterConfig del agente
  context: Record<string, unknown>; // Contexto de runtime (taskId, wakeReason, approvalId, etc.)
  onLog: (stream: "stdout" | "stderr", chunk: string) => Promise<void>;
  onMeta?: (meta: AdapterInvocationMeta) => Promise<void>;
  authToken?: string;
}

interface AdapterExecutionResult {
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  errorMessage?: string | null;
  usage?: UsageSummary;           // { inputTokens, outputTokens, cachedInputTokens? }
  sessionId?: string | null;      // Legacy — preferir sessionParams
  sessionParams?: Record<string, unknown> | null;  // Estado opaco de sesión persistido entre ejecuciones
  sessionDisplayId?: string | null;
  provider?: string | null;       // "anthropic", "openai", etc.
  model?: string | null;
  costUsd?: number | null;
  resultJson?: Record<string, unknown> | null;
  summary?: string | null;        // Resumen legible de lo que hizo el agente
  clearSession?: boolean;         // true = indicar a TaskOrg que olvide la sesión almacenada
}

interface AdapterSessionCodec {
  deserialize(raw: unknown): Record<string, unknown> | null;
  serialize(params: Record<string, unknown> | null): Record<string, unknown> | null;
  getDisplayId?(params: Record<string, unknown> | null): string | null;
}
```

### Interfaces de Módulo

```ts
// Servidor — registrado en server/src/adapters/registry.ts
interface ServerAdapterModule {
  type: string;
  execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
  testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult>;
  sessionCodec?: AdapterSessionCodec;
  supportsLocalAgentJwt?: boolean;
  models?: { id: string; label: string }[];
  agentConfigurationDoc?: string;
}

// UI — registrado en ui/src/adapters/registry.ts
interface UIAdapterModule {
  type: string;
  label: string;
  parseStdoutLine: (line: string, ts: string) => TranscriptEntry[];
  ConfigFields: ComponentType<AdapterConfigFieldsProps>;
  buildAdapterConfig: (values: CreateConfigValues) => Record<string, unknown>;
}

// CLI — registrado en cli/src/adapters/registry.ts
interface CLIAdapterModule {
  type: string;
  formatStdoutEvent: (line: string, debug: boolean) => void;
}
```

---

## 2.1 Contrato de Prueba de Entorno del Adapter

Cada adapter de servidor debe implementar `testEnvironment(...)`. Esto alimenta el botón "Probar entorno" de la UI del tablero en la configuración del agente.

```ts
type AdapterEnvironmentCheckLevel = "info" | "warn" | "error";
type AdapterEnvironmentTestStatus = "pass" | "warn" | "fail";

interface AdapterEnvironmentCheck {
  code: string;
  level: AdapterEnvironmentCheckLevel;
  message: string;
  detail?: string | null;
  hint?: string | null;
}

interface AdapterEnvironmentTestResult {
  adapterType: string;
  status: AdapterEnvironmentTestStatus;
  checks: AdapterEnvironmentCheck[];
  testedAt: string; // Marca de tiempo ISO
}

interface AdapterEnvironmentTestContext {
  companyId: string;
  adapterType: string;
  config: Record<string, unknown>; // adapterConfig resuelto en runtime
}
```

Directrices:

- Devolver diagnósticos estructurados, nunca lanzar excepciones para hallazgos esperados.
- Usar `error` para configuraciones de runtime inválidas/inutilizables (cwd incorrecto, comando faltante, URL inválida).
- Usar `warn` para situaciones no bloqueantes pero importantes.
- Usar `info` para verificaciones exitosas y contexto.

La política de severidad es crítica para el producto: las advertencias no bloquean el guardado.
Ejemplo: para `claude_local`, detectar `ANTHROPIC_API_KEY` debe ser un `warn`, no un `error`, porque Claude aún puede ejecutarse (solo usa autenticación por clave de API en lugar de autenticación por suscripción).

---

## 3. Paso a Paso: Crear un Nuevo Adapter

### 3.1 Crear el Paquete

```
packages/adapters/<name>/
  package.json
  tsconfig.json
  src/
    index.ts
    server/index.ts
    server/execute.ts
    server/parse.ts
    ui/index.ts
    ui/parse-stdout.ts
    ui/build-config.ts
    cli/index.ts
    cli/format-event.ts
```

**package.json** — debe usar la convención de cuatro exportaciones:

```json
{
  "name": "@taskorg/adapter-<name>",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server/index.ts",
    "./ui": "./src/ui/index.ts",
    "./cli": "./src/cli/index.ts"
  },
  "dependencies": {
    "@taskorg/adapter-utils": "workspace:*",
    "picocolors": "^1.1.1"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

### 3.2 `index.ts` Raíz — Metadatos del Adapter

Este archivo es importado por **los tres** consumidores (servidor, UI, CLI). Mantenlo libre de dependencias (sin APIs de Node, sin React).

```ts
export const type = "my_agent";        // snake_case, globalmente único
export const label = "My Agent (local)";

export const models = [
  { id: "model-a", label: "Model A" },
  { id: "model-b", label: "Model B" },
];

export const agentConfigurationDoc = `# my_agent agent configuration
...documentar todos los campos de configuración aquí...
`;
```

**Exportaciones requeridas:**
- `type` — la clave de tipo del adapter, almacenada en `agents.adapter_type`
- `label` — nombre legible para la UI
- `models` — opciones de modelo disponibles para el formulario de creación de agente
- `agentConfigurationDoc` — markdown describiendo todos los campos de `adapterConfig` (usado por agentes LLM que configuran otros agentes)

**Escribir `agentConfigurationDoc` como lógica de enrutamiento:**

El `agentConfigurationDoc` es leído por agentes LLM (incluyendo agentes de TaskOrg que crean otros agentes). Escríbelo como **lógica de enrutamiento**, no como texto comercial. Incluye orientación concreta de "usar cuando" y "no usar cuando" para que un LLM pueda decidir si este adapter es apropiado para una tarea dada.

```ts
export const agentConfigurationDoc = `# my_agent agent configuration

Adapter: my_agent

Usar cuando:
- El agente necesita ejecutar MyAgent CLI localmente en la máquina host
- Necesitas persistencia de sesión entre ejecuciones (MyAgent soporta reanudación de hilos)
- La tarea requiere herramientas específicas de MyAgent (ej. búsqueda web, ejecución de código)

No usar cuando:
- Necesitas una ejecución simple de script de un solo uso (usar el adapter "process" en su lugar)
- El agente no necesita contexto conversacional entre ejecuciones (el adapter process es más simple)
- MyAgent CLI no está instalado en el host

Campos principales:
- cwd (string, requerido): directorio de trabajo absoluto para el proceso del agente
...
`;
```

Agregar casos negativos explícitos mejora la precisión en la selección de adapter. Un anti-patrón concreto vale más que tres párrafos de descripción.

### 3.3 Módulo de Servidor

#### `server/execute.ts` — El Núcleo

Este es el archivo más importante. Recibe un `AdapterExecutionContext` y debe devolver un `AdapterExecutionResult`.

**Comportamiento requerido:**

1. **Leer configuración** — extraer valores tipados de `ctx.config` usando helpers (`asString`, `asNumber`, `asBoolean`, `asStringArray`, `parseObject` de `@taskorg/adapter-utils/server-utils`)
2. **Construir entorno** — llamar a `buildTaskOrgEnv(agent)` luego agregar `TASKORG_RUN_ID`, variables de contexto (`TASKORG_TASK_ID`, `TASKORG_WAKE_REASON`, `TASKORG_WAKE_COMMENT_ID`, `TASKORG_APPROVAL_ID`, `TASKORG_APPROVAL_STATUS`, `TASKORG_LINKED_ISSUE_IDS`), sobrecargas de env del usuario y token de autenticación
3. **Resolver sesión** — verificar `runtime.sessionParams` / `runtime.sessionId` para una sesión existente; validar que sea compatible (ej. mismo cwd); decidir si reanudar o iniciar nueva
4. **Renderizar prompt** — usar `renderTemplate(template, data)` con las variables de plantilla: `agentId`, `companyId`, `runId`, `company`, `agent`, `run`, `context`
5. **Llamar a onMeta** — emitir metadatos de invocación del adapter antes de lanzar el proceso
6. **Lanzar el proceso** — usar `runChildProcess()` para agentes basados en CLI o `fetch()` para agentes basados en HTTP
7. **Parsear salida** — convertir el stdout del agente en datos estructurados (id de sesión, uso, resumen, errores)
8. **Manejar errores de sesión** — si la reanudación falla con "sesión desconocida", reintentar con sesión nueva y establecer `clearSession: true`
9. **Devolver AdapterExecutionResult** — completar todos los campos que el runtime del agente soporte

**Variables de entorno que el servidor siempre inyecta:**

| Variable | Fuente |
|----------|--------|
| `TASKORG_AGENT_ID` | `agent.id` |
| `TASKORG_COMPANY_ID` | `agent.companyId` |
| `TASKORG_API_URL` | URL propia del servidor |
| `TASKORG_RUN_ID` | Id de ejecución actual |
| `TASKORG_TASK_ID` | `context.taskId` o `context.issueId` |
| `TASKORG_WAKE_REASON` | `context.wakeReason` |
| `TASKORG_WAKE_COMMENT_ID` | `context.wakeCommentId` o `context.commentId` |
| `TASKORG_APPROVAL_ID` | `context.approvalId` |
| `TASKORG_APPROVAL_STATUS` | `context.approvalStatus` |
| `TASKORG_LINKED_ISSUE_IDS` | `context.issueIds` (separados por coma) |
| `TASKORG_API_KEY` | `authToken` (si no hay clave explícita en config) |

#### `server/parse.ts` — Parseador de Salida

Parsea el formato de stdout del agente en datos estructurados. Debe manejar:

- **Identificación de sesión** — extraer ID de sesión/hilo de eventos de inicialización
- **Seguimiento de uso** — extraer conteos de tokens (entrada, salida, cacheados)
- **Seguimiento de costos** — extraer costo si está disponible
- **Extracción de resumen** — obtener la respuesta de texto final del agente
- **Detección de errores** — identificar estados de error, extraer mensajes de error
- **Detección de sesión desconocida** — exportar una función `is<Agent>UnknownSessionError()` para la lógica de reintento

**Tratar la salida del agente como no confiable.** El stdout que estás parseando viene de un proceso dirigido por LLM que puede haber ejecutado llamadas a herramientas arbitrarias, obtenido contenido externo, o sido influenciado por inyección de prompt en los archivos que leyó. Parsea defensivamente:
- Nunca usar `eval()` ni ejecutar dinámicamente nada de la salida
- Usar helpers de extracción seguros (`asString`, `asNumber`, `parseJson`) — devuelven valores de respaldo con tipos inesperados
- Validar IDs de sesión y otros datos estructurados antes de pasarlos
- Si la salida contiene URLs, rutas de archivo o comandos, no actuar sobre ellos en el adapter — solo registrarlos

#### `server/index.ts` — Exportaciones del Servidor

```ts
export { execute } from "./execute.js";
export { testEnvironment } from "./test.js";
export { parseMyAgentOutput, isMyAgentUnknownSessionError } from "./parse.js";

// Session codec — requerido para persistencia de sesión
export const sessionCodec: AdapterSessionCodec = {
  deserialize(raw) { /* JSON de BD crudo -> params tipados o null */ },
  serialize(params) { /* params tipados -> JSON para almacenamiento en BD */ },
  getDisplayId(params) { /* -> cadena de id de sesión legible */ },
};
```

#### `server/test.ts` — Diagnósticos de Entorno

Implementar verificaciones preliminares específicas del adapter usadas por el botón de prueba de la UI.

Expectativas mínimas:

1. Validar primitivas de configuración requeridas (rutas, comandos, URLs, supuestos de autenticación)
2. Devolver objetos de verificación con valores `code` determinísticos
3. Mapear severidad consistentemente (`info` / `warn` / `error`)
4. Calcular estado final:
   - `fail` si hay algún `error`
   - `warn` si no hay errores y al menos una advertencia
   - `pass` en caso contrario

Esta operación debe ser ligera y sin efectos secundarios.

### 3.4 Módulo de UI

#### `ui/parse-stdout.ts` — Parseador de Transcripción

Convierte líneas individuales de stdout en `TranscriptEntry[]` para el visor de detalle de ejecución. Debe manejar el formato de salida en streaming del agente y producir entradas de estos tipos:

- `init` — inicialización de modelo/sesión
- `assistant` — respuestas de texto del agente
- `thinking` — pensamiento/razonamiento del agente (si está soportado)
- `tool_call` — invocaciones de herramientas con nombre y entrada
- `tool_result` — resultados de herramientas con contenido y bandera de error
- `user` — mensajes del usuario en la conversación
- `result` — resultado final con estadísticas de uso
- `stdout` — respaldo para líneas no parseables

```ts
export function parseMyAgentStdoutLine(line: string, ts: string): TranscriptEntry[] {
  // Parsear línea JSON, mapear al tipo(s) apropiado(s) de TranscriptEntry
  // Devolver [{ kind: "stdout", ts, text: line }] como respaldo
}
```

#### `ui/build-config.ts` — Constructor de Configuración

Convierte los `CreateConfigValues` del formulario de UI en el blob JSON de `adapterConfig` almacenado en el agente.

```ts
export function buildMyAgentConfig(v: CreateConfigValues): Record<string, unknown> {
  const ac: Record<string, unknown> = {};
  if (v.cwd) ac.cwd = v.cwd;
  if (v.promptTemplate) ac.promptTemplate = v.promptTemplate;
  if (v.model) ac.model = v.model;
  ac.timeoutSec = 0;
  ac.graceSec = 15;
  // ... campos específicos del adapter
  return ac;
}
```

#### Componente de Campos de Configuración de UI

Crear `ui/src/adapters/<name>/config-fields.tsx` con un componente React implementando `AdapterConfigFieldsProps`. Esto renderiza campos de formulario específicos del adapter en el formulario de creación/edición de agente.

Usar las primitivas compartidas de `ui/src/components/agent-config-primitives`:
- `Field` — envoltorio de campo de formulario con etiqueta
- `ToggleField` — toggle booleano con etiqueta y pista
- `DraftInput` — entrada de texto con comportamiento de borrador/confirmación
- `DraftNumberInput` — entrada numérica con comportamiento de borrador/confirmación
- `help` — texto de pista estándar para campos comunes

El componente debe soportar tanto el modo `create` (usando `values`/`set`) como el modo `edit` (usando `config`/`eff`/`mark`).

### 3.5 Módulo de CLI

#### `cli/format-event.ts` — Formateador de Terminal

Imprime líneas de stdout con formato para `taskorg run --watch`. Usar `picocolors` para colorear.

```ts
import pc from "picocolors";

export function printMyAgentStreamEvent(raw: string, debug: boolean): void {
  // Parsear línea JSON del stdout del agente
  // Imprimir salida coloreada: azul para sistema, verde para asistente, amarillo para herramientas
  // En modo debug, imprimir líneas no reconocidas en gris
}
```

---

## 4. Lista de Verificación de Registro

Después de crear el paquete del adapter, regístralo en los tres consumidores:

### 4.1 Registro en Servidor (`server/src/adapters/registry.ts`)

```ts
import { execute as myExecute, sessionCodec as mySessionCodec } from "@taskorg/adapter-my-agent/server";
import { agentConfigurationDoc as myDoc, models as myModels } from "@taskorg/adapter-my-agent";

const myAgentAdapter: ServerAdapterModule = {
  type: "my_agent",
  execute: myExecute,
  sessionCodec: mySessionCodec,
  models: myModels,
  supportsLocalAgentJwt: true,  // true si el agente puede usar la API de TaskOrg
  agentConfigurationDoc: myDoc,
};

// Agregar al mapa adaptersByType
const adaptersByType = new Map<string, ServerAdapterModule>(
  [..., myAgentAdapter].map((a) => [a.type, a]),
);
```

### 4.2 Registro en UI (`ui/src/adapters/registry.ts`)

```ts
import { myAgentUIAdapter } from "./my-agent";

const adaptersByType = new Map<string, UIAdapterModule>(
  [..., myAgentUIAdapter].map((a) => [a.type, a]),
);
```

Con `ui/src/adapters/my-agent/index.ts`:

```ts
import type { UIAdapterModule } from "../types";
import { parseMyAgentStdoutLine } from "@taskorg/adapter-my-agent/ui";
import { MyAgentConfigFields } from "./config-fields";
import { buildMyAgentConfig } from "@taskorg/adapter-my-agent/ui";

export const myAgentUIAdapter: UIAdapterModule = {
  type: "my_agent",
  label: "My Agent",
  parseStdoutLine: parseMyAgentStdoutLine,
  ConfigFields: MyAgentConfigFields,
  buildAdapterConfig: buildMyAgentConfig,
};
```

### 4.3 Registro en CLI (`cli/src/adapters/registry.ts`)

```ts
import { printMyAgentStreamEvent } from "@taskorg/adapter-my-agent/cli";

const myAgentCLIAdapter: CLIAdapterModule = {
  type: "my_agent",
  formatStdoutEvent: printMyAgentStreamEvent,
};

// Agregar al mapa adaptersByType
```

---

## 5. Gestión de Sesiones — Diseñar para Ejecuciones Largas

Las sesiones permiten a los agentes mantener contexto de conversación entre ejecuciones. El sistema está **basado en codec** — cada adapter define cómo serializar/deserializar su estado de sesión.

**Diseñar para ejecuciones largas desde el inicio.** Tratar la reutilización de sesión como la primitiva por defecto, no como una optimización para agregar después. Un agente trabajando en un issue puede ser despertado docenas de veces — para la asignación inicial, callbacks de aprobación, reasignaciones, intervenciones manuales. Cada despertar debe reanudar la conversación existente para que el agente retenga contexto completo sobre lo que ya ha hecho, qué archivos ha leído y qué decisiones ha tomado. Iniciar de nuevo cada vez desperdicia tokens releyendo los mismos archivos y arriesga decisiones contradictorias.

**Conceptos clave:**
- `sessionParams` es un `Record<string, unknown>` opaco almacenado en la BD por tarea
- El `sessionCodec.serialize()` del adapter convierte datos del resultado de ejecución a params almacenables
- `sessionCodec.deserialize()` convierte params almacenados de vuelta para la siguiente ejecución
- `sessionCodec.getDisplayId()` extrae un ID de sesión legible para la UI
- **Reanudación consciente del cwd**: si la sesión fue creada en un cwd diferente al de la configuración actual, saltar la reanudación (previene contaminación de sesión entre proyectos)
- **Reintento de sesión desconocida**: si la reanudación falla con error de "sesión no encontrada", reintentar con sesión nueva y devolver `clearSession: true` para que TaskOrg limpie la sesión obsoleta

Si el runtime del agente soporta alguna forma de compactación de contexto o compresión de conversación (ej. la gestión automática de contexto de Claude Code, o el encadenamiento de `previous_response_id` de Codex), aprovéchalo. Los adapters que soportan reanudación de sesión obtienen compactación gratis — el runtime del agente maneja la gestión de ventana de contexto internamente entre reanudaciones.

**Patrón** (de tanto claude-local como codex-local):

```ts
const canResumeSession =
  runtimeSessionId.length > 0 &&
  (runtimeSessionCwd.length === 0 || path.resolve(runtimeSessionCwd) === path.resolve(cwd));
const sessionId = canResumeSession ? runtimeSessionId : null;

// ... intento de ejecución ...

// Si la reanudación falló con sesión desconocida, reintentar nueva
if (sessionId && !proc.timedOut && exitCode !== 0 && isUnknownSessionError(output)) {
  const retry = await runAttempt(null);
  return toResult(retry, { clearSessionOnMissingSession: true });
}
```

---

## 6. Helpers de Server-Utils

Importar desde `@taskorg/adapter-utils/server-utils`:

| Helper | Propósito |
|--------|-----------|
| `asString(val, fallback)` | Extracción segura de string |
| `asNumber(val, fallback)` | Extracción segura de número |
| `asBoolean(val, fallback)` | Extracción segura de booleano |
| `asStringArray(val)` | Extracción segura de array de strings |
| `parseObject(val)` | Extracción segura de `Record<string, unknown>` |
| `parseJson(str)` | JSON.parse seguro que devuelve `Record` o null |
| `renderTemplate(tmpl, data)` | Renderizado de plantilla `{{path.to.value}}` |
| `buildTaskOrgEnv(agent)` | Variables de entorno estándar `TASKORG_*` |
| `redactEnvForLogs(env)` | Redactar claves sensibles para onMeta |
| `ensureAbsoluteDirectory(cwd)` | Validar que cwd existe y es absoluto |
| `ensureCommandResolvable(cmd, cwd, env)` | Validar que el comando está en PATH |
| `ensurePathInEnv(env)` | Asegurar que PATH existe en env |
| `runChildProcess(runId, cmd, args, opts)` | Lanzar con timeout, logging, captura |

---

## 7. Convenciones y Patrones

### Nomenclatura
- Tipo de adapter: `snake_case` (ej. `claude_local`, `codex_local`)
- Nombre de paquete: `@taskorg/adapter-<kebab-name>`
- Directorio de paquete: `packages/adapters/<kebab-name>/`

### Parseo de Configuración
- Nunca confiar en valores de `config` directamente — siempre usar `asString`, `asNumber`, etc.
- Proporcionar valores por defecto razonables para cada campo opcional
- Documentar todos los campos en `agentConfigurationDoc`

### Plantillas de Prompt
- Soportar `promptTemplate` para cada ejecución
- Usar `renderTemplate()` con el conjunto estándar de variables
- Prompt por defecto: `"You are agent {{agent.id}} ({{agent.name}}). Continue your TaskOrg work."`

### Manejo de Errores
- Diferenciar timeout vs error de proceso vs falla de parseo
- Siempre completar `errorMessage` en caso de falla
- Incluir stdout/stderr crudo en `resultJson` cuando el parseo falla
- Manejar el caso de CLI del agente no instalado (comando no encontrado)

### Logging
- Llamar a `onLog("stdout", ...)` y `onLog("stderr", ...)` para toda la salida del proceso — esto alimenta el visor de ejecución en tiempo real
- Llamar a `onMeta(...)` antes de lanzar para registrar detalles de invocación
- Usar `redactEnvForLogs()` al incluir env en meta

### Inyección de Skills de TaskOrg

TaskOrg incluye skills compartidos (en el directorio `skills/` de nivel superior del repo) que los agentes necesitan en runtime — cosas como el skill de API `taskorg` y el skill de flujo de trabajo `taskorg-create-agent`. Cada adapter es responsable de hacer que estos skills sean descubribles por su runtime de agente **sin contaminar el directorio de trabajo del agente**.

**La restricción:** nunca copiar ni crear enlaces simbólicos de skills en el `cwd` del agente. El cwd es el checkout del proyecto del usuario — escribir `.claude/skills/` o cualquier otro archivo en él contaminaría el repo con internos de TaskOrg, rompería git status y potencialmente se filtraría en commits.

**El patrón:** crear una ubicación limpia y aislada para skills e indicar al runtime del agente que busque allí.

**Cómo lo hace claude-local:**

1. En tiempo de ejecución, crear un tmpdir nuevo: `mkdtemp("taskorg-skills-")`
2. Dentro, crear `.claude/skills/` (la estructura de directorio que Claude Code espera)
3. Crear enlaces simbólicos de cada directorio de skill del `skills/` del repo al `.claude/skills/` del tmpdir
4. Pasar el tmpdir a Claude Code vía `--add-dir <tmpdir>` — esto hace que Claude Code descubra los skills como si estuvieran registrados en ese directorio, sin tocar el cwd real del agente
5. Limpiar el tmpdir en un bloque `finally` después de que la ejecución complete

```ts
// De claude-local execute.ts
async function buildSkillsDir(): Promise<string> {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "taskorg-skills-"));
  const target = path.join(tmp, ".claude", "skills");
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(TASKORG_SKILLS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await fs.symlink(
        path.join(TASKORG_SKILLS_DIR, entry.name),
        path.join(target, entry.name),
      );
    }
  }
  return tmp;
}

// En execute(): pasar --add-dir a Claude Code
const skillsDir = await buildSkillsDir();
args.push("--add-dir", skillsDir);
// ... ejecutar proceso ...
// En finally: fs.rm(skillsDir, { recursive: true, force: true })
```

**Cómo lo hace codex-local:**

Codex tiene un directorio global de skills personales (`$CODEX_HOME/skills` o `~/.codex/skills`). El adapter crea enlaces simbólicos de skills de TaskOrg allí si no existen ya. Esto es aceptable porque es el directorio de configuración propio de la herramienta del agente, no el proyecto del usuario.

```ts
// De codex-local execute.ts
async function ensureCodexSkillsInjected(onLog) {
  const skillsHome = path.join(codexHomeDir(), "skills");
  await fs.mkdir(skillsHome, { recursive: true });
  for (const entry of entries) {
    const target = path.join(skillsHome, entry.name);
    const existing = await fs.lstat(target).catch(() => null);
    if (existing) continue;  // No sobreescribir skills propios del usuario
    await fs.symlink(source, target);
  }
}
```

**Para un nuevo adapter:** determina cómo tu runtime de agente descubre skills/plugins, luego elige la ruta de inyección más limpia:

1. **Mejor: tmpdir + flag** (como claude-local) — si el runtime soporta un flag de "directorio adicional", crear un tmpdir, enlazar skills dentro, pasar el flag, limpiar después. Cero efectos secundarios.
2. **Aceptable: directorio de configuración global** (como codex-local) — si el runtime tiene un directorio global de skills/plugins separado del proyecto, enlazar allí. Saltar entradas existentes para evitar sobreescribir personalizaciones del usuario.
3. **Aceptable: variable de entorno** — si el runtime lee una ruta de skills/plugins desde una variable de entorno, apuntarla al directorio `skills/` del repo directamente.
4. **Último recurso: inyección por prompt** — si el runtime no tiene sistema de plugins, incluir el contenido del skill en la plantilla de prompt misma. Esto consume tokens pero evita efectos secundarios en el sistema de archivos completamente.

**Skills como procedimientos cargados, no relleno de prompt.** Los skills de TaskOrg (como `taskorg` y `taskorg-create-agent`) están diseñados como procedimientos bajo demanda: el agente ve los metadatos del skill (nombre + descripción) en su contexto, pero solo carga el contenido completo de SKILL.md cuando decide invocar un skill. Esto mantiene el prompt base pequeño. Al escribir `agentConfigurationDoc` o plantillas de prompt para tu adapter, no incluyas contenido de skills en línea — deja que el descubrimiento de skills del runtime del agente haga el trabajo. Las descripciones en el frontmatter de cada SKILL.md actúan como lógica de enrutamiento: le dicen al agente cuándo cargar el skill completo, no qué contiene el skill.

**Invocación de skill explícita vs. difusa.** Para flujos de trabajo de producción donde la fiabilidad importa (ej. un agente que siempre debe llamar a la API de TaskOrg para reportar estado), usar instrucciones explícitas en la plantilla de prompt: "Usa el skill taskorg para reportar tu progreso." El enrutamiento difuso (dejar que el modelo decida basándose en coincidencia de descripción) está bien para tareas exploratorias pero es poco fiable para procedimientos obligatorios.

---

## 8. Consideraciones de Seguridad

Los adapters se sitúan en la frontera entre la capa de orquestación de TaskOrg y la ejecución arbitraria de agentes. Esta es una superficie de alto riesgo.

### Tratar la Salida del Agente como No Confiable

El proceso del agente ejecuta código dirigido por LLM que lee archivos externos, obtiene URLs y ejecuta herramientas. Su salida puede estar influenciada por inyección de prompt del contenido que procesa. La capa de parseo del adapter es un límite de confianza — validar todo, no ejecutar nada.

### Inyección de Secretos vía Entorno, No Prompts

Nunca poner secretos (claves de API, tokens) en plantillas de prompt o campos de configuración que fluyen a través del LLM. En su lugar, inyectarlos como variables de entorno que las herramientas del agente pueden leer directamente:

- `TASKORG_API_KEY` es inyectado por el servidor en el entorno del proceso, no en el prompt
- Los secretos proporcionados por el usuario en `config.env` se pasan como variables de entorno, redactados en los logs de `onMeta`
- El helper `redactEnvForLogs()` enmascara automáticamente cualquier clave que coincida con `/(key|token|secret|password|authorization|cookie)/i`

Esto sigue el patrón de "inyección sidecar": el modelo nunca ve el valor real del secreto, pero las herramientas que invoca pueden leerlo del entorno.

### Acceso de Red

Si tu runtime de agente soporta controles de acceso a red (sandboxing, listas de permitidos), configúralos en el adapter:

- Preferir listas mínimas de permitidos sobre acceso abierto a internet. Un agente que solo necesita llamar a la API de TaskOrg y GitHub no debería tener acceso a hosts arbitrarios.
- Skills + red = riesgo amplificado. Un skill que enseña al agente a hacer solicitudes HTTP combinado con acceso irrestricto a red crea una vía de exfiltración. Restringir uno o el otro.
- Si el runtime soporta políticas por capas (valores por defecto a nivel de org + sobrecargas por solicitud), conectar la política a nivel de org en la configuración del adapter y dejar que la configuración por agente estreche más.

### Aislamiento de Procesos

- Los adapters basados en CLI heredan los permisos de usuario del servidor. La configuración de `cwd` y `env` determina a qué puede acceder el proceso del agente en el sistema de archivos.
- Los flags `dangerouslySkipPermissions` / `dangerouslyBypassApprovalsAndSandbox` existen por conveniencia de desarrollo pero deben documentarse como peligrosos en `agentConfigurationDoc`. Los despliegues en producción no deberían usarlos.
- Los tiempos de timeout y período de gracia (`timeoutSec`, `graceSec`) son barandillas de seguridad — siempre aplicarlos. Un proceso de agente descontrolado sin timeout puede consumir recursos ilimitados.

---

## 9. Referencia de Tipos de TranscriptEntry

El visor de ejecución de la UI muestra estos tipos de entrada:

| Tipo | Campos | Uso |
|------|--------|-----|
| `init` | `model`, `sessionId` | Inicialización del agente |
| `assistant` | `text` | Respuesta de texto del agente |
| `thinking` | `text` | Razonamiento/pensamiento del agente |
| `user` | `text` | Mensaje del usuario |
| `tool_call` | `name`, `input` | Invocación de herramienta |
| `tool_result` | `toolUseId`, `content`, `isError` | Resultado de herramienta |
| `result` | `text`, `inputTokens`, `outputTokens`, `cachedTokens`, `costUsd`, `subtype`, `isError`, `errors` | Resultado final con uso |
| `stderr` | `text` | Salida de stderr |
| `system` | `text` | Mensajes del sistema |
| `stdout` | `text` | Respaldo de stdout crudo |

---

## 10. Pruebas

Crear pruebas en `server/src/__tests__/<adapter-name>-adapter.test.ts`. Probar:

1. **Parseo de salida** — alimentar stdout de ejemplo a través de tu parseador, verificar salida estructurada
2. **Detección de sesión desconocida** — verificar la función `is<Agent>UnknownSessionError`
3. **Construcción de configuración** — verificar que `buildConfig` produce adapterConfig correcto desde valores del formulario
4. **Session codec** — verificar ida y vuelta de serialize/deserialize

---

## 11. Lista de Verificación Mínima del Adapter

- [ ] `packages/adapters/<name>/package.json` con cuatro exportaciones (`.`, `./server`, `./ui`, `./cli`)
- [ ] `index.ts` raíz con `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] `server/execute.ts` implementando `AdapterExecutionContext -> AdapterExecutionResult`
- [ ] `server/test.ts` implementando `AdapterEnvironmentTestContext -> AdapterEnvironmentTestResult`
- [ ] `server/parse.ts` con parseador de salida y detector de sesión desconocida
- [ ] `server/index.ts` exportando `execute`, `testEnvironment`, `sessionCodec`, helpers de parseo
- [ ] `ui/parse-stdout.ts` con `StdoutLineParser` para el visor de ejecución
- [ ] `ui/build-config.ts` con constructor `CreateConfigValues -> adapterConfig`
- [ ] `ui/src/adapters/<name>/config-fields.tsx` componente React para formulario de agente
- [ ] `ui/src/adapters/<name>/index.ts` ensamblando el `UIAdapterModule`
- [ ] `cli/format-event.ts` con formateador de terminal
- [ ] `cli/index.ts` exportando el formateador
- [ ] Registrado en `server/src/adapters/registry.ts`
- [ ] Registrado en `ui/src/adapters/registry.ts`
- [ ] Registrado en `cli/src/adapters/registry.ts`
- [ ] Agregado al workspace en `pnpm-workspace.yaml` raíz (si no está cubierto por glob)
- [ ] Pruebas para parseo, session codec y construcción de configuración
