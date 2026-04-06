---
name: doc-maintenance
description: >
  Auditar documentación de nivel superior (README, SPEC, PRODUCT) contra el historial
  reciente de git para encontrar desviaciones — funcionalidades enviadas que faltan en
  la documentación o funcionalidades listadas como futuras que ya se implementaron.
  Propone ediciones mínimas, crea una rama y abre un PR. Usar cuando se pida revisar
  la precisión de la documentación, después de merges importantes de funcionalidades
  o en un calendario periódico.
---

# Skill de Mantenimiento de Documentación

Detectar desviaciones de documentación y corregirlas vía PR — sin reescrituras, sin cambios innecesarios.

## Cuándo Usar

- Revisión periódica de documentación (ej. semanal o después de releases)
- Después de merges importantes de funcionalidades
- Cuando se pregunte "¿están nuestros docs actualizados?"
- Cuando se pida auditar la precisión del README / SPEC / PRODUCT

## Documentos Objetivo

| Documento | Ruta | Qué importa |
|-----------|------|-------------|
| README | `README.md` | Tabla de funcionalidades, hoja de ruta, inicio rápido, precisión de "qué es", tabla "funciona con" |
| SPEC | `doc/SPEC.md` | Sin afirmaciones falsas de "no soportado", precisión de modelos/esquemas principales |
| PRODUCT | `doc/PRODUCT.md` | Conceptos fundamentales, lista de funcionalidades, precisión de principios |

Fuera de alcance: DEVELOPING.md, DATABASE.md, CLI.md, doc/plans/, archivos de skill,
notas de release. Estos son orientados al desarrollador o efímeros — menor riesgo de
confusión para el usuario final.

## Flujo de Trabajo

### Paso 1 — Detectar qué cambió

Encontrar el último cursor de revisión:

```bash
# Leer el último SHA de commit revisado
CURSOR_FILE=".doc-review-cursor"
if [ -f "$CURSOR_FILE" ]; then
  LAST_SHA=$(cat "$CURSOR_FILE" | head -1)
else
  # Primera ejecución: mirar 60 días atrás
  LAST_SHA=$(git log --format="%H" --after="60 days ago" --reverse | head -1)
fi
```

Luego recopilar commits desde el cursor:

```bash
git log "$LAST_SHA"..HEAD --oneline --no-merges
```

### Paso 2 — Clasificar cambios

Escanear mensajes de commit y archivos modificados. Categorizar en:

- **Funcionalidad** — nuevas capacidades (palabras clave: `feat`, `add`, `implement`, `support`)
- **Ruptura** — cosas eliminadas/renombradas (palabras clave: `remove`, `breaking`, `drop`, `rename`)
- **Estructural** — nuevos directorios, cambios de configuración, nuevos adapters, nuevos comandos CLI

**Ignorar:** refactorizaciones, cambios solo de pruebas, configuración de CI, actualizaciones de
dependencias, cambios solo de documentación, commits de estilo/formato. Estos no afectan la
precisión de la documentación.

Para casos límite, verificar el diff real — un commit titulado "refactor: X"
que agrega una nueva API pública es una funcionalidad.

### Paso 3 — Construir un resumen de cambios

Producir una lista concisa como:

```
Desde la última revisión (<sha>, <fecha>):
- FUNCIONALIDAD: Sistema de plugins mergeado (runtime, SDK, CLI, slots, puente de eventos)
- FUNCIONALIDAD: Archivado de proyectos agregado
- RUPTURA: Adapter legacy de webhook eliminado
- ESTRUCTURAL: Nueva convención de directorio .agents/skills/
```

Si no hay cambios notables, saltar al Paso 7 (actualizar cursor y salir).

### Paso 4 — Auditar cada documento objetivo

Para cada documento objetivo, leerlo completamente y cruzar referencias contra el resumen
de cambios. Verificar:

1. **Falsos negativos** — funcionalidades principales enviadas no mencionadas en absoluto
2. **Falsos positivos** — funcionalidades listadas como "próximamente" / "hoja de ruta" / "planificado"
   / "no soportado" / "por definir" que ya se enviaron
3. **Precisión del inicio rápido** — comandos de instalación, prerequisitos e instrucciones de
   arranque aún correctos (solo README)
4. **Precisión de la tabla de funcionalidades** — ¿la sección de funcionalidades refleja las
   capacidades actuales? (solo README)
5. **Precisión de "funciona con"** — ¿están los adapters/integraciones soportados listados correctamente?

Usar `references/audit-checklist.md` como la lista de verificación estructurada.
Usar `references/section-map.md` para saber dónde buscar cada área de funcionalidad.

### Paso 5 — Crear rama y aplicar ediciones mínimas

```bash
# Crear una rama para las actualizaciones de documentación
BRANCH="docs/maintenance-$(date +%Y%m%d)"
git checkout -b "$BRANCH"
```

Aplicar **solo** las ediciones necesarias para corregir desviaciones. Reglas:

- **Solo parches mínimos.** Corregir inexactitudes, no reescribir secciones.
- **Preservar voz y estilo.** Coincidir con el tono existente de cada documento.
- **Sin cambios cosméticos.** No corregir errores tipográficos, reformatear tablas ni reorganizar
  secciones a menos que sean parte de una corrección factual.
- **Sin secciones nuevas.** Si una funcionalidad necesita una sección completamente nueva, anotarlo
  en la descripción del PR como seguimiento — no agregarlo en un pase de mantenimiento.
- **Elementos de hoja de ruta:** Mover funcionalidades enviadas fuera de la Hoja de Ruta. Agregar
  una mención breve en la sección existente apropiada si no hay una ya. No agregar
  descripciones largas.

### Paso 6 — Abrir un PR

Hacer commit de los cambios y abrir un PR:

```bash
git add README.md doc/SPEC.md doc/PRODUCT.md .doc-review-cursor
git commit -m "docs: update documentation for accuracy

- [listar cada corrección brevemente]

Co-Authored-By: TaskOrg <noreply@taskorg.ing>"

git push -u origin "$BRANCH"

gh pr create \
  --title "docs: periodic documentation accuracy update" \
  --body "$(cat <<'EOF'
## Resumen
Pase automático de mantenimiento de documentación. Corrige desviaciones de
documentación detectadas desde la última revisión.

### Cambios
- [listar cada corrección]

### Resumen de cambios (desde la última revisión)
- [listar cambios de código notables que provocaron actualizaciones de documentación]

## Notas de revisión
- Solo correcciones de precisión factual — sin cambios de estilo/cosméticos
- Preserva la voz y estructura existente
- Adiciones mayores de documentación (nuevas secciones, tutoriales) anotadas como seguimiento

🤖 Generado por el skill doc-maintenance
EOF
)"
```

### Paso 7 — Actualizar el cursor

Después de una auditoría exitosa (ya sea que se hicieron ediciones o no), actualizar el cursor:

```bash
git rev-parse HEAD > .doc-review-cursor
```

Si se hicieron ediciones, esto ya está incluido en el commit de la rama del PR. Si no se
necesitaron ediciones, hacer commit de la actualización del cursor en la rama actual.

## Reglas de Clasificación de Cambios

| Señal | Categoría | ¿Se necesita actualización de documentación? |
|-------|-----------|---------------------------------------------|
| `feat:`, `add`, `implement`, `support` en el mensaje | Funcionalidad | Sí si es visible para el usuario |
| `remove`, `drop`, `breaking`, `!:` en el mensaje | Ruptura | Sí |
| Nuevo directorio de nivel superior o archivo de configuración | Estructural | Tal vez |
| `fix:`, `bugfix` | Corrección | No (a menos que cambie comportamiento descrito en docs) |
| `refactor:`, `chore:`, `ci:`, `test:` | Mantenimiento | No |
| `docs:` | Cambio de documentación | No (ya está manejado) |
| Solo actualizaciones de dependencias | Mantenimiento | No |

## Guía de Estilo de Parches

- Corregir el hecho, no la prosa
- Si se elimina un elemento de la hoja de ruta, no dejar un vacío — eliminar la viñeta limpiamente
- Si se agrega una mención de funcionalidad, coincidir con el formato de las entradas circundantes
  (ej. si las funcionalidades están en una tabla, agregar una fila a la tabla)
- Mantener los cambios del README especialmente mínimos — no debería cambiar frecuentemente
- Para SPEC/PRODUCT, preferir actualizar declaraciones existentes sobre agregar nuevas
  (ej. cambiar "no soportado en V1" a "soportado vía X" en lugar de agregar
  una nueva sección)

## Salida

Cuando el skill complete, reportar:

- Cuántos commits se escanearon
- Cuántos cambios notables se encontraron
- Cuántas ediciones de documentación se hicieron (y en qué archivos)
- Enlace del PR (si se hicieron ediciones)
- Cualquier elemento de seguimiento que necesite trabajo de documentación mayor
