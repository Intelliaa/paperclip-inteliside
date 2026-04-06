---
name: release-changelog
description: >
  Generar el changelog de release estable de Paperclip en releases/vYYYY.MDD.P.md
  leyendo commits, changesets y contexto de PRs mergeados desde la última etiqueta estable.
---

# Skill de Changelog de Release

Generar el changelog orientado al usuario para el release **estable** de Paperclip.

## Modelo de Versionado

Paperclip usa **versionado por calendario (calver)**:

- Releases estables: `YYYY.MDD.P` (ej. `2026.318.0`)
- Releases canary: `YYYY.MDD.P-canary.N` (ej. `2026.318.1-canary.0`)
- Etiquetas git: `vYYYY.MDD.P` para estable, `canary/vYYYY.MDD.P-canary.N` para canary

No hay incrementos de major/minor/patch. La versión estable se deriva de la
fecha de release prevista (UTC) más el siguiente slot de parche estable del mismo día.

Salida:

- `releases/vYYYY.MDD.P.md`

Reglas importantes:

- incluso si hay releases canary como `2026.318.1-canary.0`, el archivo de changelog se mantiene como `releases/v2026.318.1.md`
- no derivar versiones de tipos de incremento semver
- no crear archivos de changelog canary

## Paso 0 — Verificación de Idempotencia

Antes de generar algo, verificar si el archivo ya existe:

```bash
ls releases/vYYYY.MDD.P.md 2>/dev/null
```

Si existe:

1. leerlo primero
2. presentarlo al revisor
3. preguntar si mantenerlo, regenerarlo o actualizar secciones específicas
4. nunca sobreescribirlo silenciosamente

## Paso 1 — Determinar el Rango Estable

Encontrar la última etiqueta estable:

```bash
git tag --list 'v*' --sort=-version:refname | head -1
git log v{last}..HEAD --oneline --no-merges
```

La versión estable proviene de una de:

- una solicitud explícita del mantenedor
- `./scripts/release.sh stable --date YYYY-MM-DD --print-version`
- el plan de release ya acordado en `doc/RELEASING.md`

No derivar la versión del changelog de una etiqueta canary o sufijo de prerelease.
No derivar incrementos de major/minor/patch de la intención de la API — calver usa la fecha y el slot estable del mismo día.

## Paso 2 — Recopilar las Entradas Crudas

Recopilar datos del release desde:

1. commits de git desde la última etiqueta estable
2. archivos `.changeset/*.md`
3. PRs mergeados vía `gh` cuando esté disponible

Comandos útiles:

```bash
git log v{last}..HEAD --oneline --no-merges
git log v{last}..HEAD --format="%H %s" --no-merges
ls .changeset/*.md | grep -v README.md
gh pr list --state merged --search "merged:>={last-tag-date}" --json number,title,body,labels
```

## Paso 3 — Detectar Cambios Disruptivos

Buscar:

- migraciones destructivas
- campos/endpoints de API eliminados o cambiados
- claves de configuración renombradas o eliminadas
- señales de commit `BREAKING:` o `BREAKING CHANGE:`

Comandos clave:

```bash
git diff --name-only v{last}..HEAD -- packages/db/src/migrations/
git diff v{last}..HEAD -- packages/db/src/schema/
git diff v{last}..HEAD -- server/src/routes/ server/src/api/
git log v{last}..HEAD --format="%s" | rg -n 'BREAKING CHANGE|BREAKING:|^[a-z]+!:' || true
```

Si se detectan cambios disruptivos, destacarlos prominentemente — deben aparecer en la
sección de Cambios Disruptivos con una ruta de actualización.

## Paso 4 — Categorizar para Usuarios

Usar estas secciones del changelog estable:

- `Breaking Changes`
- `Highlights`
- `Improvements`
- `Fixes`
- `Upgrade Guide` cuando sea necesario

Excluir refactorizaciones puramente internas, cambios de CI y trabajo solo de documentación a menos que afecten materialmente a los usuarios.

Directrices:

- agrupar commits relacionados en una entrada orientada al usuario
- escribir desde la perspectiva del usuario
- mantener los destacados cortos y concretos
- detallar acciones de actualización para cambios disruptivos

### Atribución en línea de PR y contribuidores

Cuando un elemento claramente corresponde a un pull request mergeado, agregar atribución en línea al
final de la entrada en este formato:

```
- **Nombre de funcionalidad** — Descripción. ([#123](https://github.com/paperclipai/paperclip/pull/123), @contributor1, @contributor2)
```

Reglas:

- Solo agregar un enlace de PR cuando puedas rastrear con confianza el elemento a un PR mergeado específico.
  Usar mensajes de merge commit (`Merge pull request #N from user/branch`) para mapear PRs.
- Listar los contribuidores que crearon el PR. Usar nombres de usuario de GitHub, no nombres reales ni correos electrónicos.
- Si múltiples PRs contribuyeron a un solo elemento, listarlos todos: `([#10](url), [#12](url), @user1, @user2)`.
- Si no puedes determinar el número de PR o contribuidor con confianza, omitir el
  paréntesis de atribución — no adivinar.
- Los commits de mantenedores principales que no tienen un PR externo pueden omitir el paréntesis.

## Paso 5 — Escribir el Archivo

Plantilla:

```markdown
# vYYYY.MDD.P

> Released: YYYY-MM-DD

## Breaking Changes

## Highlights

## Improvements

## Fixes

## Upgrade Guide

## Contributors

Thank you to everyone who contributed to this release!

@username1, @username2, @username3
```

Omitir secciones vacías excepto `Highlights`, `Improvements` y `Fixes`, que usualmente deben existir.

La sección `Contributors` siempre debe incluirse. Listar a cada persona que hizo commit de
autoría en el rango del release, mencionándolos con @ por su **nombre de usuario de GitHub** (no su
nombre real ni correo electrónico). Para encontrar nombres de usuario de GitHub:

1. Extraer nombres de usuario de mensajes de merge commit: `git log v{last}..HEAD --oneline --merges` — el prefijo de rama (ej. `from username/branch`) da el nombre de usuario de GitHub.
2. Para correos noreply como `user@users.noreply.github.com`, el nombre de usuario es la parte antes de `@`.
3. Para contribuidores cuyo nombre de usuario es ambiguo, verificar `gh api users/{guess}` o la página del PR.

**Nunca exponer direcciones de correo electrónico de contribuidores.** Usar solo `@username`.

Excluir cuentas de bots (ej. `lockfile-bot`, `dependabot`) de la lista. Listar contribuidores
en orden alfabético por nombre de usuario de GitHub (insensible a mayúsculas).

## Paso 6 — Revisar Antes del Release

Antes de entregar:

1. confirmar que el encabezado es solo la versión estable
2. confirmar que no hay lenguaje `-canary` en el título o nombre de archivo
3. confirmar que cualquier cambio disruptivo tiene una ruta de actualización
4. presentar el borrador para aprobación humana

Este skill nunca publica nada. Solo prepara el artefacto del changelog estable.
