# AGENTS.md

Orientación para contribuyentes humanos e IA que trabajan en este repositorio.

## 1. Propósito

TaskOrg es un plano de control para empresas de agentes de IA.
El objetivo de implementación actual es V1 y está definido en `doc/SPEC-implementation.md`.

## 2. Lee Esto Primero

Antes de hacer cambios, lee en este orden:

1. `doc/GOAL.md`
2. `doc/PRODUCT.md`
3. `doc/SPEC-implementation.md`
4. `doc/DEVELOPING.md`
5. `doc/DATABASE.md`

`doc/SPEC.md` es contexto de producto a largo plazo.
`doc/SPEC-implementation.md` es el contrato concreto de construcción V1.

## 3. Mapa del Repositorio

- `server/`: API REST de Express y servicios de orquestación
- `ui/`: Interfaz de panel de control React + Vite
- `packages/db/`: Schema de Drizzle, migraciones, clientes de BD
- `packages/shared/`: tipos compartidos, constantes, validadores, constantes de rutas API
- `packages/adapters/`: implementaciones de adaptadores de agentes (Claude, Codex, Cursor, etc.)
- `packages/adapter-utils/`: utilidades compartidas de adaptadores
- `packages/plugins/`: paquetes del sistema de plugins
- `doc/`: documentación operacional y de producto

## 4. Configuración de Desarrollo (BD Automática)

Usa PGlite embebido en desarrollo dejando `DATABASE_URL` sin configurar.

```sh
pnpm install
pnpm dev
```

Esto inicia:

- API: `http://localhost:3100`
- UI: `http://localhost:3100` (servida por el servidor API en modo middleware de desarrollo)

Verificaciones rápidas:

```sh
curl http://localhost:3100/api/health
curl http://localhost:3100/api/companies
```

Reinicia la BD de desarrollo local:

```sh
rm -rf data/pglite
pnpm dev
```

## 5. Reglas de Ingeniería Core

1. Mantén los cambios con alcance de empresa.
Cada entidad de dominio debe estar con alcance a una empresa y los límites de empresa deben ser reforzados en rutas/servicios.

2. Mantén los contratos sincronizados.
Si cambias schema/comportamiento de API, actualiza todas las capas afectadas:
- `packages/db` schema y exports
- `packages/shared` tipos/constantes/validadores
- `server` rutas/servicios
- `ui` clientes API y páginas

3. Preserva los invariantes del plano de control.
- Modelo de tarea de asignado único
- Semántica atómica de checkout de issue
- Puertas de aprobación para acciones gobernadas
- Comportamiento de pausa automática de límite presupuestario duro
- Logging de actividad para acciones mutantes

4. No reemplaces documentos estratégicos completamente a menos que se te pida.
Prefiere actualizaciones aditivas. Mantén `doc/SPEC.md` y `doc/SPEC-implementation.md` alineados.

5. Mantén los documentos de plan fechados y centralizados.
Los nuevos documentos de plan pertenecen a `doc/plans/` y deben usar nombres de archivo `YYYY-MM-DD-slug.md`.

## 6. Flujo de Trabajo de Cambios de Base de Datos

Cuando cambies el modelo de datos:

1. Edita `packages/db/src/schema/*.ts`
2. Asegúrate de que las nuevas tablas se exporten desde `packages/db/src/schema/index.ts`
3. Genera migración:

```sh
pnpm db:generate
```

4. Valida compilación:

```sh
pnpm -r typecheck
```

Notas:
- `packages/db/drizzle.config.ts` lee el schema compilado desde `dist/schema/*.js`
- `pnpm db:generate` compila `packages/db` primero

## 7. Verificación Antes de Entregar

Ejecuta esta verificación completa antes de declarar hecho:

```sh
pnpm -r typecheck
pnpm test:run
pnpm build
```

Si algo no puede ejecutarse, reporta explícitamente qué no se ejecutó y por qué.

## 8. Expectativas de API y Autenticación

- Ruta base: `/api`
- El acceso al panel de control se trata como contexto de operador de control total
- El acceso de agentes usa claves API portador (`agent_api_keys`), hasheadas en reposo
- Las claves de agentes no deben acceder a otras empresas

Cuando agregues endpoints:

- aplica verificaciones de acceso de empresa
- refuerza permisos de actor (panel vs agente)
- escribe entradas de registro de actividad para mutaciones
- retorna errores HTTP consistentes (`400/401/403/404/409/422/500`)

## 9. Expectativas de UI

- Mantén rutas y navegación alineadas con la superficie API disponible
- Usa contexto de selección de empresa para páginas con alcance de empresa
- Muestra fallos claramente; no ignores silenciosamente errores de API

## 10. Requisitos de Pull Request

Cuando crees un pull request (vía `gh pr create` u otro método), **debes** leer y completar cada sección de [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). No crees cuerpos de PR ad-hoc — usa la plantilla como estructura para tu descripción de PR. Secciones requeridas:

- **Thinking Path** — traza el razonamiento desde contexto del proyecto a este cambio (ve `CONTRIBUTING.md` para ejemplos)
- **What Changed** — lista con viñetas de cambios concretos
- **Verification** — cómo un revisor puede confirmar que funciona
- **Risks** — qué podría salir mal
- **Model Used** — el modelo de IA que produjo o asistió con el cambio (proveedor, ID exacto del modelo, ventana de contexto, capacidades). Escribe "None — human-authored" si no se usó IA.
- **Checklist** — todos los elementos marcados

## 11. Definición de Listo

Un cambio está listo cuando todos son verdaderos:

1. El comportamiento coincide con `doc/SPEC-implementation.md`
2. Typecheck, tests y build pasan
3. Los contratos están sincronizados entre db/shared/server/ui
4. Documentos actualizados cuando cambia el comportamiento o comandos
5. La descripción del PR sigue la [plantilla de PR](.github/PULL_REQUEST_TEMPLATE.md) con todas las secciones completadas (incluyendo Model Used)

## 11. Específico del Fork: HenkDz/taskorg

Este es un fork de `taskorg/taskorg` con parches QoL e historia del adaptador Hermes **solo externo** en rama `feat/externalize-hermes-adapter` ([tree](https://github.com/HenkDz/taskorg/tree/feat/externalize-hermes-adapter)).

### Estrategia de Rama

- `feat/externalize-hermes-adapter` → core **no tiene** dependencia `hermes-taskorg-adapter` y **no tiene** registro `hermes_local` construido. Instala Hermes vía el gestor de Plugin de Adapter (`@henkey/hermes-taskorg-adapter` o ruta `file:`).
- Las ramas de fork más antiguas aún pueden documentar Hermes construido; trata este archivo como autoritario para la rama de externalizar.

### Hermes (solo plugin)

- Regístrate a través de **Board → Adapter manager** (igual que Droid). El tipo permanece `hermes_local` una vez que el paquete está cargado.
- UI usa **config-schema** genérico + **ui-parser.js** del paquete — sin importaciones de Hermes en fuente de `server/` o `ui/`.
- Opcional: entrada `file:` en `~/.taskorg/adapter-plugins.json` para desarrollo local del repositorio del adaptador.

### Desarrollo Local

- Fork corre en puerto 3101+ (auto-detecta si 3100 está ocupado por instancia upstream)
- `npx vite build` se cuelga en NTFS — usa `node node_modules/vite/bin/vite.js build` en su lugar
- Inicio del servidor desde NTFS toma 30-60s — no asumas fracaso inmediatamente
- Mata TODOS los procesos taskorg antes de iniciar: `pkill -f "taskorg"; pkill -f "tsx.*index.ts"`
- El caché de Vite sobrevive `rm -rf dist` — elimina ambos: `rm -rf ui/dist ui/node_modules/.vite`

### Parches QoL del Fork (no en upstream)

Estas son modificaciones locales en la UI del fork. Si re-copias fuente, estos deben re-aplicarse:

1. **stderr_group** — acordeón ámbar para ruido de init de MCP en `RunTranscriptView.tsx`
2. **tool_group** — acordeón para herramientas consecutivas no-terminales (write, read, search, browser)
3. **Extracto del Dashboard** — `LatestRunCard` elimina markdown, muestra primeras 3 líneas/280 caracteres

### Sistema de Plugin

PR #2218 (`feat/external-adapter-phase1`) añade soporte de adaptador externo. Ve `AGENTS.md` raíz para detalles completos.

- Los adaptadores pueden cargarse como plugins externos vía `~/.taskorg/adapter-plugins.json`
- El plugin-loader debe tener CERO importaciones de adaptador hardcodeadas — carga dinámica pura
- `createServerAdapter()` debe incluir TODOS los campos opcionales (especialmente `detectModel`)
- Los adaptadores de UI construidos pueden sombrear parsers de plugins externos — elimina construido cuando se externaliza completamente
- Adaptadores externos de referencia: Hermes (`@henkey/hermes-taskorg-adapter` o `file:`) y Droid (npm)
