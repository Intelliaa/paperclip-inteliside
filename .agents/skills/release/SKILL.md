---
name: release
description: >
  Coordinar un release completo de TaskOrg a través de verificación de ingeniería, npm,
  GitHub, pruebas de humo y seguimiento de anuncios. Usar cuando liderazgo pida
  enviar un release, no simplemente discutir versionado.
---

# Skill de Coordinación de Release

Ejecutar el flujo de trabajo completo de release de mantenedor de TaskOrg, no solo un npm publish.

Este skill coordina:

- borrador de changelog estable vía `release-changelog`
- verificación y estado de publicación canary desde `master`
- pruebas de humo Docker vía `scripts/docker-onboard-smoke.sh`
- promoción manual a estable desde un ref fuente elegido
- creación de GitHub Release
- tareas de seguimiento de sitio web / anuncios

## Activación

Usar este skill cuando liderazgo pida:

- "haz un release"
- "envía el release"
- "promueve este canary a estable"
- "corta el release estable"

## Precondiciones

Antes de proceder, verificar todo lo siguiente:

1. `.agents/skills/release-changelog/SKILL.md` existe y es utilizable.
2. El árbol de trabajo del repo está limpio, incluyendo archivos sin seguimiento.
3. Hay al menos un commit canary o candidato desde la última etiqueta estable.
4. El SHA candidato ha pasado la puerta de verificación o está por hacerlo.
5. Si los manifiestos cambiaron, la actualización de `pnpm-lock.yaml` propiedad de CI ya está mergeada en `master`.
6. Los permisos de publicación npm están disponibles a través de publicación confiable de GitHub, o a través de autenticación npm local para uso de emergencia/manual.
7. Si se ejecuta a través de TaskOrg, tienes contexto de issue para actualizaciones de estado y creación de tareas de seguimiento.

Si alguna precondición falla, detenerse y reportar el bloqueador.

## Entradas

Recopilar estas entradas por adelantado:

- si el objetivo es una verificación canary o una promoción a estable
- el `source_ref` candidato para estable
- si la ejecución estable es en modo de prueba o en vivo
- issue de release / contexto de compañía para seguimiento de sitio web y anuncios

## Paso 0 — Modelo de Release

TaskOrg ahora usa un modelo de release dirigido por commits:

1. cada push a `master` publica un canary automáticamente
2. los canaries usan `YYYY.MDD.P-canary.N`
3. los releases estables usan `YYYY.MDD.P`
4. el slot del medio es `MDD`, donde `M` es el mes UTC y `DD` es el día UTC con cero a la izquierda
5. el slot de parche estable se incrementa cuando más de un estable se envía en la misma fecha UTC
6. los releases estables se promueven manualmente desde un commit probado o commit fuente canary elegido
7. solo los releases estables obtienen `releases/vYYYY.MDD.P.md`, etiqueta git `vYYYY.MDD.P` y un GitHub Release

Consecuencias críticas:

- no usar ramas de release como la ruta por defecto
- no derivar incrementos de major/minor/patch
- no crear archivos de changelog canary
- no crear GitHub Releases canary

## Paso 1 — Elegir el Candidato

Para validación canary:

- inspeccionar la última ejecución canary exitosa en `master`
- registrar la versión canary y SHA fuente

Para promoción estable:

1. elegir el ref fuente probado
2. confirmar que es el SHA exacto que quieres promover
3. resolver la versión estable objetivo con `./scripts/release.sh stable --date YYYY-MM-DD --print-version`

Comandos útiles:

```bash
git tag --list 'v*' --sort=-version:refname | head -1
git log --oneline --no-merges
npm view taskorg@canary version
```

## Paso 2 — Redactar el Changelog Estable

Los archivos de changelog estable viven en:

- `releases/vYYYY.MDD.P.md`

Invocar `release-changelog` y generar o actualizar las notas estables solamente.

Reglas:

- revisar el borrador con un humano antes de publicar
- preservar ediciones manuales si el archivo ya existe
- mantener el nombre de archivo solo estable
- no crear un archivo de changelog canary

## Paso 3 — Verificar el SHA Candidato

Ejecutar la puerta estándar:

```bash
pnpm -r typecheck
pnpm test:run
pnpm build
```

Si el flujo de trabajo de GitHub Release ejecutará la publicación, puede re-ejecutar esta puerta. Aun así reportar el estado local si lo verificaste.

Para PRs que tocan lógica de release, el repo también ejecuta una prueba seca de release canary en CI. Eso es un guardia específico de release, no un sustituto de la puerta estándar.

## Paso 4 — Validar el Canary

La ruta normal de canary es automática desde `master` vía:

- `.github/workflows/release.yml`

Confirmar:

1. la verificación pasó
2. la publicación npm canary fue exitosa
3. la etiqueta git `canary/vYYYY.MDD.P-canary.N` existe

Verificaciones útiles:

```bash
npm view taskorg@canary version
git tag --list 'canary/v*' --sort=-version:refname | head -5
```

## Paso 5 — Prueba de Humo del Canary

Ejecutar:

```bash
TASKORG_VERSION=canary ./scripts/docker-onboard-smoke.sh
```

Variante aislada útil:

```bash
HOST_PORT=3232 DATA_DIR=./data/release-smoke-canary TASKORG_VERSION=canary ./scripts/docker-onboard-smoke.sh
```

Confirmar:

1. la instalación tiene éxito
2. la incorporación completa sin fallos
3. el servidor arranca
4. la UI carga
5. la creación básica de compañía y carga del dashboard funcionan

Si la prueba de humo falla:

- detener el release estable
- corregir el problema en `master`
- esperar el siguiente canary automático
- re-ejecutar la prueba de humo

## Paso 6 — Previsualizar o Publicar Estable

La ruta normal de estable es `workflow_dispatch` manual en:

- `.github/workflows/release.yml`

Entradas:

- `source_ref`
- `stable_date`
- `dry_run`

Antes del estable en vivo:

1. resolver la versión estable objetivo con `./scripts/release.sh stable --date YYYY-MM-DD --print-version`
2. asegurar que `releases/vYYYY.MDD.P.md` existe en el ref fuente
3. ejecutar el flujo de trabajo estable en modo de prueba seca primero cuando sea práctico
4. luego ejecutar la publicación estable real

El flujo de trabajo estable:

- re-verifica el ref fuente exacto
- calcula el siguiente slot de parche estable para la fecha UTC elegida
- publica `YYYY.MDD.P` bajo la etiqueta de distribución `latest`
- crea la etiqueta git `vYYYY.MDD.P`
- crea o actualiza el GitHub Release desde `releases/vYYYY.MDD.P.md`

Comandos locales de emergencia/manuales:

```bash
./scripts/release.sh stable --dry-run
./scripts/release.sh stable
git push public-gh refs/tags/vYYYY.MDD.P
./scripts/create-github-release.sh YYYY.MDD.P
```

## Paso 7 — Completar las Otras Superficies

Crear o verificar trabajo de seguimiento para:

- publicación del changelog en el sitio web
- publicación de lanzamiento / anuncio social
- resumen del release en el contexto de issue de TaskOrg

Estos deben referenciar el release estable, no el canary.

## Manejo de Fallos

Si el canary está mal:

- publicar otro canary, no enviar estable

Si la publicación npm estable tiene éxito pero el push de etiqueta o creación de GitHub Release falla:

- corregir el problema de git/GitHub inmediatamente desde el mismo resultado de release
- no re-publicar la misma versión

Si `latest` está mal después de la publicación estable:

```bash
./scripts/rollback-latest.sh <last-good-version>
```

Luego corregir hacia adelante con un nuevo release estable.

## Salida

Cuando el skill complete, proporcionar:

- SHA candidato y versión canary probada, si es relevante
- versión estable, si se promovió
- estado de verificación
- estado de npm
- estado de prueba de humo
- estado de etiqueta git / GitHub Release
- estado de seguimiento de sitio web / anuncios
- recomendación de reversión si algo aún está parcialmente completo
