# Flujo de Skills de Empresa

Usa esta referencia cuando un usuario del board, CEO o manager te pida encontrar un skill, instalarlo en la biblioteca de la empresa o asignarlo a un agente.

## Qué Existe

- Biblioteca de skills de empresa: instala, inspecciona, actualiza y lee skills importados para toda la empresa.
- Asignación de skills a agentes: agrega o quita skills de empresa en un agente existente.
- Composición en contratación/creación: pasa `desiredSkills` al crear o contratar un agente para que el mismo modelo de asignación se aplique inmediatamente.

El modelo canónico es:

1. instalar el skill en la empresa
2. asignar el skill de empresa al agente
3. opcionalmente hacer el paso 2 durante la contratación/creación con `desiredSkills`

## Modelo de Permisos

- Lecturas de skills de empresa: cualquier actor de la misma empresa
- Mutaciones de skills de empresa: board, CEO, o un agente con la capacidad efectiva `agents:create`
- Asignación de skills a agentes: mismo modelo de permisos que actualizar ese agente

## Endpoints Principales

- `GET /api/companies/:companyId/skills`
- `GET /api/companies/:companyId/skills/:skillId`
- `POST /api/companies/:companyId/skills/import`
- `POST /api/companies/:companyId/skills/scan-projects`
- `POST /api/companies/:companyId/skills/:skillId/install-update`
- `GET /api/agents/:agentId/skills`
- `POST /api/agents/:agentId/skills/sync`
- `POST /api/companies/:companyId/agent-hires`
- `POST /api/companies/:companyId/agents`

## Instalar un Skill en la Empresa

Importa usando una **URL de skills.sh**, una cadena de estilo clave, una URL de GitHub, o una ruta local.

### Tipos de fuente (en orden de preferencia)

| Formato de fuente | Ejemplo | Cuándo usar |
|---|---|---|
| **URL de skills.sh** | `https://skills.sh/google-labs-code/stitch-skills/design-md` | Cuando un usuario te da un enlace de `skills.sh`. Este es el registro administrado de skills — **siempre prefiérelo cuando esté disponible**. |
| **Cadena estilo clave** | `google-labs-code/stitch-skills/design-md` | Atajo para el mismo skill — formato `org/repo/skill-name`. Equivalente a la URL de skills.sh. |
| **URL de GitHub** | `https://github.com/vercel-labs/agent-browser` | Cuando el skill está en un repositorio de GitHub pero no en skills.sh. |
| **Ruta local** | `/abs/path/to/skill-dir` | Cuando el skill está en disco (solo desarrollo/pruebas). |

**Crítico:** Si un usuario te da una URL `https://skills.sh/...`, usa esa URL o su equivalente estilo clave (`org/repo/skill-name`) como `source`. **No** la conviertas a una URL de GitHub — skills.sh es el registro administrado y la fuente de verdad para versionado, descubrimiento y actualizaciones.

### Ejemplo: importación desde skills.sh (preferido)

```sh
curl -sS -X POST "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/skills/import" \
  -H "Authorization: Bearer $TASKORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "https://skills.sh/google-labs-code/stitch-skills/design-md"
  }'
```

O equivalentemente usando la cadena estilo clave:

```sh
curl -sS -X POST "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/skills/import" \
  -H "Authorization: Bearer $TASKORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "google-labs-code/stitch-skills/design-md"
  }'
```

### Ejemplo: importación desde GitHub

```sh
curl -sS -X POST "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/skills/import" \
  -H "Authorization: Bearer $TASKORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "https://github.com/vercel-labs/agent-browser"
  }'
```

También puedes usar cadenas de fuente como:

- `google-labs-code/stitch-skills/design-md`
- `vercel-labs/agent-browser/agent-browser`
- `npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser`

Si la tarea es descubrir skills desde los workspaces de proyectos de la empresa primero:

```sh
curl -sS -X POST "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/skills/scan-projects" \
  -H "Authorization: Bearer $TASKORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Inspeccionar lo Instalado

```sh
curl -sS "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/skills" \
  -H "Authorization: Bearer $TASKORG_API_KEY"
```

Lee la entrada del skill y su `SKILL.md`:

```sh
curl -sS "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/skills/<skill-id>" \
  -H "Authorization: Bearer $TASKORG_API_KEY"

curl -sS "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/skills/<skill-id>/files?path=SKILL.md" \
  -H "Authorization: Bearer $TASKORG_API_KEY"
```

## Asignar Skills a un Agente Existente

`desiredSkills` acepta:

- clave exacta del skill de empresa
- ID exacto del skill de empresa
- slug exacto cuando es único en la empresa

El servidor persiste las claves canónicas de skills de empresa.

```sh
curl -sS -X POST "$TASKORG_API_URL/api/agents/<agent-id>/skills/sync" \
  -H "Authorization: Bearer $TASKORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "desiredSkills": [
      "vercel-labs/agent-browser/agent-browser"
    ]
  }'
```

Si necesitas el estado actual primero:

```sh
curl -sS "$TASKORG_API_URL/api/agents/<agent-id>/skills" \
  -H "Authorization: Bearer $TASKORG_API_KEY"
```

## Incluir Skills Durante la Contratación o Creación

Usa las mismas claves o referencias de skills de empresa en `desiredSkills` al contratar o crear un agente:

```sh
curl -sS -X POST "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/agent-hires" \
  -H "Authorization: Bearer $TASKORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QA Browser Agent",
    "role": "qa",
    "adapterType": "codex_local",
    "adapterConfig": {
      "cwd": "/abs/path/to/repo"
    },
    "desiredSkills": [
      "agent-browser"
    ]
  }'
```

Para creación directa sin aprobación:

```sh
curl -sS -X POST "$TASKORG_API_URL/api/companies/$TASKORG_COMPANY_ID/agents" \
  -H "Authorization: Bearer $TASKORG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QA Browser Agent",
    "role": "qa",
    "adapterType": "codex_local",
    "adapterConfig": {
      "cwd": "/abs/path/to/repo"
    },
    "desiredSkills": [
      "agent-browser"
    ]
  }'
```

## Notas

- Los skills integrados del runtime de TaskOrg se agregan automáticamente cuando el adapter los requiere.
- Si una referencia falta o es ambigua, la API devuelve `422`.
- Prefiere vincular de vuelta al issue, aprobación y agente relevantes cuando comentes sobre cambios de skills.
- Usa las rutas de portabilidad de empresa cuando necesites importar/exportar paquetes completos, no solo un skill:
  - `POST /api/companies/:companyId/imports/preview`
  - `POST /api/companies/:companyId/imports/apply`
  - `POST /api/companies/:companyId/exports/preview`
  - `POST /api/companies/:companyId/exports`
- Usa la importación solo de skills cuando la tarea sea específicamente agregar un skill a la biblioteca de la empresa sin importar la estructura circundante de empresa/equipo/paquete.
