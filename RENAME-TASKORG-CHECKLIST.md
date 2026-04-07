# Checklist: Renombrar Paperclip → TaskOrg

> **Empresa:** Inteliside  
> **Producto:** TaskOrg  
> **Estrategia env vars:** Fallback con deprecation warning  
> **Branch:** `feat/rename-taskorg`  
> **Fecha inicio:** 2026-04-06  
> **Estado:** Fases 0–3 completadas ✅ | Pendiente: validar build

---

## Fase 0: Preparación Legal

- [x] Actualizar `LICENSE` — copyright dual (Paperclip AI + Inteliside 2026)
- [x] Crear archivo `NOTICE` en la raíz con atribución al fork
- [ ] Verificar que `pnpm build` pasa *(pendiente — ejecutar en Fase 4)*
- [ ] Verificar que `pnpm test:run` pasa *(pendiente — ejecutar en Fase 4)*

---

## Fase 1: Reemplazo masivo automatizado ✅

Script Python (`scripts/rename-to-taskorg.py`) ejecutado — ~813 archivos modificados.

### 1.1 Reemplazos de scope y paquetes ✅
- [x] `@paperclipai/` → `@taskorg/` (en imports y package.json)
- [x] `paperclipai` → `taskorg` (CLI binary, npm package name)
- [x] `PAPERCLIPAI_VERSION` → `TASKORG_VERSION` (scripts y CI)

### 1.2 Variables de entorno ✅
- [x] `PAPERCLIP_` → `TASKORG_` (en definiciones y usos de env vars)

### 1.3 Paths y configuración ✅
- [x] `.paperclip/` → `.taskorg/` (paths de directorio)
- [x] `.paperclip.yaml` → `.taskorg.yaml` (archivos de config)

### 1.4 Branding y texto ✅
- [x] `Paperclip AI` → `Inteliside` (nombre empresa)
- [x] `Paperclip` → `TaskOrg` (branding, tipos TS, texto UI)
- [x] `paperclip` → `taskorg` (identifiers, CSS classes, localStorage keys, DB creds)

### 1.5 Verificación post-reemplazo ✅
- [x] `LICENSE` intacto con copyright original Paperclip AI
- [x] `NOTICE` intacto con atribución al fork
- [x] `packages/db/src/migrations/` NO fue tocado (0 cambios)
- [x] `releases/` NO fue tocado (0 cambios)

---

## Fase 2: Renombrar directorios y archivos ✅

### 2.1 Skills ✅
- [x] `skills/paperclip/` → `skills/taskorg/`
- [x] `skills/paperclip-create-agent/` → `skills/taskorg-create-agent/`
- [x] `skills/paperclip-create-plugin/` → `skills/taskorg-create-plugin/`

### 2.2 Plugins ✅
- [x] `packages/plugins/create-paperclip-plugin/` → `packages/plugins/create-taskorg-plugin/`

### 2.3 Docker quadlets ✅
- [x] `docker/quadlet/paperclip.container` → `docker/quadlet/taskorg.container`
- [x] `docker/quadlet/paperclip-db.container` → `docker/quadlet/taskorg-db.container`
- [x] `docker/quadlet/paperclip.pod` → `docker/quadlet/taskorg.pod`

### 2.4 Scripts ✅
- [x] `scripts/paperclip-commit-metrics.ts` → `scripts/taskorg-commit-metrics.ts`

### 2.5 Tests ✅
- [x] `server/src/__tests__/paperclip-env.test.ts` → `server/src/__tests__/taskorg-env.test.ts`
- [x] `server/src/__tests__/paperclip-skill-utils.test.ts` → `server/src/__tests__/taskorg-skill-utils.test.ts`

### 2.6 Symlinks Claude ✅
- [x] `.claude/skills/paperclip` (symlink roto) → `.claude/skills/taskorg` → `skills/taskorg`

### 2.7 Docs ✅
- [x] `docs/start/what-is-paperclip.md` → `docs/start/what-is-taskorg.md`

---

## Fase 3: Ajustes manuales ✅

### 3.1 Fallback de env vars (compatibilidad) ✅
- [x] Helper `readEnv()` creado en `packages/shared/src/env.ts`
- [x] Exportado desde `packages/shared/src/index.ts`
- [x] Aplicado en `server/src/home-paths.ts` — `TASKORG_HOME`, `TASKORG_INSTANCE_ID`
- [x] Aplicado en `server/src/paths.ts` — `TASKORG_CONFIG`
- [x] Aplicado en `cli/src/config/home.ts` — inline fallback para CLI

### 3.2 localStorage migration (UI) ✅
- [x] Creado `ui/src/lib/storage-migration.ts` con mapeo de 13 keys
- [x] `migrateLocalStorage()` llamada en `ui/src/main.tsx` antes del render

### 3.3 Grep final de validación ✅
- [x] Cero referencias no-intencionales a "paperclip" en codebase
- [x] Referencias intencionales confirmadas: LICENSE, NOTICE, migrations DB, storage-migration, helpers de fallback

---

## Fase 4: Validación

- [ ] `pnpm install` — regenerar lockfile
- [ ] `pnpm build` — build completo sin errores
- [ ] `pnpm test:run` — tests pasan
- [ ] `pnpm typecheck` — sin errores de tipos
- [ ] Smoke test manual: UI muestra "TaskOrg" en título del browser
- [ ] Smoke test manual: `~/.taskorg/` se crea correctamente

---

## Fase 5: Assets visuales (pendiente diseño)

- [ ] Reemplazar `ui/public/favicon.svg` con logo TaskOrg
- [ ] Reemplazar `ui/public/favicon.ico`
- [ ] Reemplazar `ui/public/favicon-16x16.png` y `favicon-32x32.png`
- [ ] Reemplazar `ui/public/apple-touch-icon.png`
- [ ] Reemplazar `ui/public/android-chrome-*.png`
- [ ] Actualizar `doc/assets/header.png`
- [ ] Actualizar `docs/images/logo-light.svg` y `logo-dark.svg`

---

## Lo que NO se renombró (intencional)

| Qué | Por qué |
|---|---|
| `LICENSE` (copyright Paperclip AI) | Requerimiento legal MIT |
| `NOTICE` (mención a Paperclip) | Atribución del fork |
| `packages/db/src/migrations/` | Inmutable, histórico |
| `releases/*.md` | Notas de release históricas |
| `storage-migration.ts` keys legacy | Son las keys *viejas* que se migran |
| `readEnv(_, "PAPERCLIP_*")` en home-paths | Backward compat intencional |
| Git history | No se reescribe |
