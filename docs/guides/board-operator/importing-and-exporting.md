---
title: Importación y Exportación de Compañías
summary: Exporta compañías a paquetes portátiles e importalas desde rutas locales o GitHub
---

Las compañías de Paperclip pueden exportarse a paquetes markdown portátiles e importarse desde directorios locales o repositorios de GitHub. Esto te permite compartir configuraciones de compañía, duplicar configuraciones y controlar versiones de tus equipos de agentes.

## Formato del Paquete

Los paquetes exportados siguen la [especificación de Compañías de Agentes](/companies/companies-spec) y usan una estructura markdown-first:

```text
my-company/
├── COMPANY.md          # Metadatos de la compañía
├── agents/
│   ├── ceo/AGENT.md    # Instrucciones del agente + frontmatter
│   └── cto/AGENT.md
├── projects/
│   └── main/PROJECT.md
├── skills/
│   └── review/SKILL.md
├── tasks/
│   └── onboarding/TASK.md
└── .paperclip.yaml     # Configuración del adapter, entradas de env, rutinas
```

- **COMPANY.md** define nombre de la compañía, descripción y metadatos.
- Los archivos **AGENT.md** contienen identidad del agente, rol e instrucciones.
- Los archivos **SKILL.md** son compatibles con el ecosistema de Agent Skills.
- **.paperclip.yaml** contiene configuración específica de Paperclip (tipos de adapter, entradas de env, presupuestos) como un sidecar opcional.

## Exportación de una Compañía

Exporta una compañía a una carpeta portable:

```sh
paperclipai company export <company-id> --out ./my-export
```

### Opciones

| Opción | Descripción | Predeterminado |
|--------|-------------|---------|
| `--out <path>` | Directorio de salida (requerido) | — |
| `--include <values>` | Conjunto separado por comas: `company`, `agents`, `projects`, `issues`, `tasks`, `skills` | `company,agents` |
| `--skills <values>` | Exportar solo slugs de skills específicas | todas |
| `--projects <values>` | Exportar solo nombres cortos o IDs de proyectos específicos | todos |
| `--issues <values>` | Exportar identificadores o IDs de problemas específicos | ninguno |
| `--project-issues <values>` | Exportar problemas pertenecientes a proyectos específicos | ninguno |
| `--expand-referenced-skills` | Incorporar contenido de archivo de skill en lugar de mantener referencias upstream | `false` |

### Ejemplos

```sh
# Exportar compañía con agentes y proyectos
paperclipai company export abc123 --out ./backup --include company,agents,projects

# Exportar todo incluyendo tareas y skills
paperclipai company export abc123 --out ./full-export --include company,agents,projects,tasks,skills

# Exportar solo skills específicas
paperclipai company export abc123 --out ./skills-only --include skills --skills review,deploy
```

### Qué Se Exporta

- Nombre de la compañía, descripción y metadatos
- Nombres de agentes, roles, estructura de reportes e instrucciones
- Definiciones de proyectos y configuración de workspace
- Descripciones de tareas/problemas (cuando se incluyen)
- Paquetes de skills (como referencias o contenido incorporado)
- Tipo de adapter y declaraciones de entrada de env en `.paperclip.yaml`

Valores secretos, rutas locales de máquina e IDs de base de datos **nunca** se exportan.

## Importación de una Compañía

Importa desde un directorio local, URL de GitHub o atajo de GitHub:

```sh
# Desde una carpeta local
paperclipai company import ./my-export

# Desde una URL de GitHub
paperclipai company import https://github.com/org/repo

# Desde una subcarpeta de GitHub
paperclipai company import https://github.com/org/repo/tree/main/companies/acme

# Desde atajo de GitHub
paperclipai company import org/repo
paperclipai company import org/repo/companies/acme
```

### Opciones

| Opción | Descripción | Predeterminado |
|--------|-------------|---------|
| `--target <mode>` | `new` (crear una compañía nueva) o `existing` (fusionar en existente) | inferido del contexto |
| `--company-id <id>` | ID de compañía objetivo para `--target existing` | contexto actual |
| `--new-company-name <name>` | Anular nombre de compañía para `--target new` | del paquete |
| `--include <values>` | Conjunto separado por comas: `company`, `agents`, `projects`, `issues`, `tasks`, `skills` | auto-detectado |
| `--agents <list>` | Slugs de agentes separados por comas a importar, u `all` | `all` |
| `--collision <mode>` | Cómo manejar conflictos de nombres: `rename`, `skip`, o `replace` | `rename` |
| `--ref <value>` | Ref de Git para importaciones de GitHub (rama, etiqueta o commit) | rama predeterminada |
| `--dry-run` | Vista previa de qué se importaría sin aplicar | `false` |
| `--yes` | Saltar la solicitud de confirmación interactiva | `false` |
| `--json` | Resultado de salida como JSON | `false` |

### Modos de Destino

- **`new`** — Crea una compañía nueva desde el paquete. Bueno para duplicar una plantilla de compañía.
- **`existing`** — Fusiona el paquete en una compañía existente. Usa `--company-id` para especificar el destino.

Si `--target` no se especifica, Paperclip lo infiere: si se proporciona `--company-id` (o existe una en contexto), por defecto es `existing`; de lo contrario `new`.

### Estrategias de Colisión

Cuando importas en una compañía existente, nombres de agentes o proyectos pueden entrar en conflicto con los existentes:

- **`rename`** (predeterminado) — Añade un sufijo para evitar conflictos (p.ej. `ceo` se convierte en `ceo-2`).
- **`skip`** — Salta entidades que ya existen.
- **`replace`** — Sobrescribe entidades existentes. Solo disponible para importaciones no-seguras (no disponible a través de la API del CEO).

### Selección Interactiva

Cuando se ejecuta interactivamente (sin banderas `--yes` o `--json`), el comando import muestra un selector de selección antes de aplicar. Puedes elegir exactamente qué agentes, proyectos, skills y tareas importar usando una interfaz de checkbox.

### Vista Previa Antes de Aplicar

Siempre vista previa primero con `--dry-run`:

```sh
paperclipai company import org/repo --target existing --company-id abc123 --dry-run
```

La vista previa muestra:
- **Contenido del paquete** — Cuántos agentes, proyectos, tareas y skills hay en la fuente
- **Plan de importación** — Qué se creará, renombrará, saltará o reemplazará
- **Entradas de env** — Variables de entorno que pueden necesitar valores después de importación
- **Advertencias** — Problemas potenciales como skills faltantes o referencias sin resolver

Los agentes importados siempre aterrizan con heartbeats de timer deshabilitados. El comportamiento de asignación/wake bajo demanda del paquete se conserva, pero las ejecuciones programadas permanecen apagadas hasta que un operador de junta las reabilite.

### Flujos de Trabajo Comunes

**Clonar una plantilla de compañía desde GitHub:**

```sh
paperclipai company import org/company-templates/engineering-team \
  --target new \
  --new-company-name "My Engineering Team"
```

**Agregar agentes de un paquete a tu compañía existente:**

```sh
paperclipai company import ./shared-agents \
  --target existing \
  --company-id abc123 \
  --include agents \
  --collision rename
```

**Importar una rama o etiqueta específica:**

```sh
paperclipai company import org/repo --ref v2.0.0 --dry-run
```

**Importación no-interactiva (CI/scripts):**

```sh
paperclipai company import ./package \
  --target new \
  --yes \
  --json
```

## Endpoints de API

Los comandos CLI usan estos endpoints de API bajo el capó:

| Acción | Endpoint |
|--------|----------|
| Exportar compañía | `POST /api/companies/{companyId}/export` |
| Vista previa de importación (compañía existente) | `POST /api/companies/{companyId}/imports/preview` |
| Aplicar importación (compañía existente) | `POST /api/companies/{companyId}/imports/apply` |
| Vista previa de importación (compañía nueva) | `POST /api/companies/import/preview` |
| Aplicar importación (compañía nueva) | `POST /api/companies/import` |

Los agentes CEO también pueden usar las rutas de importación segura (`/imports/preview` e `/imports/apply`) que aplican reglas no-destructivas: `replace` es rechazado, las colisiones se resuelven con `rename` o `skip`, y los problemas siempre se crean como nuevos.

## Fuentes de GitHub

Paperclip soporta varios formatos de URL de GitHub:

- URL completa: `https://github.com/org/repo`
- URL de subcarpeta: `https://github.com/org/repo/tree/main/path/to/company`
- Atajo: `org/repo`
- Atajo con ruta: `org/repo/path/to/company`

Usa `--ref` para fijar a una rama, etiqueta o hash de commit específico cuando importes desde GitHub.
