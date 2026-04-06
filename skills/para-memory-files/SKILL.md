---
name: para-memory-files
description: >
  Sistema de memoria basado en archivos usando el método PARA de Tiago Forte. Usa este skill cada vez
  que necesites almacenar, recuperar, actualizar u organizar conocimiento entre sesiones. Cubre
  tres capas de memoria: (1) Grafo de conocimiento en carpetas PARA con hechos atómicos en YAML,
  (2) Notas diarias como línea de tiempo en bruto, (3) Conocimiento tácito sobre patrones del usuario. También
  gestiona archivos de planificación, decaimiento de memoria, síntesis semanal y recuperación vía qmd.
  Se activa con cualquier operación de memoria: guardar hechos, escribir notas diarias, crear
  entidades, ejecutar síntesis semanal, recuperar contexto pasado o gestionar planes.
---

# Archivos de Memoria PARA

Memoria persistente basada en archivos, organizada según el método PARA de Tiago Forte. Tres capas: un grafo de conocimiento, notas diarias y conocimiento tácito. Todas las rutas son relativas a `$AGENT_HOME`.

## Tres Capas de Memoria

### Capa 1: Grafo de Conocimiento (`$AGENT_HOME/life/` -- PARA)

Almacenamiento basado en entidades. Cada entidad obtiene una carpeta con dos niveles:

1. `summary.md` -- contexto rápido, cargar primero.
2. `items.yaml` -- hechos atómicos, cargar bajo demanda.

```text
$AGENT_HOME/life/
  projects/          # Trabajo activo con objetivos/fechas límite claros
    <name>/
      summary.md
      items.yaml
  areas/             # Responsabilidades continuas, sin fecha de fin
    people/<name>/
    companies/<name>/
  resources/         # Material de referencia, temas de interés
    <topic>/
  archives/          # Elementos inactivos de las otras tres categorías
  index.md
```

**Reglas PARA:**

- **Projects** -- trabajo activo con un objetivo o fecha límite. Mover a archives al completar.
- **Areas** -- continuo (personas, empresas, responsabilidades). Sin fecha de fin.
- **Resources** -- material de referencia, temas de interés.
- **Archives** -- elementos inactivos de cualquier categoría.

**Reglas de hechos:**

- Guarda hechos duraderos inmediatamente en `items.yaml`.
- Semanalmente: reescribe `summary.md` a partir de los hechos activos.
- Nunca elimines hechos. Reemplázalos en su lugar (`status: superseded`, agrega `superseded_by`).
- Cuando una entidad quede inactiva, mueve su carpeta a `$AGENT_HOME/life/archives/`.

**Cuándo crear una entidad:**

- Mencionada 3+ veces, O
- Relación directa con el usuario (familia, compañero de trabajo, pareja, cliente), O
- Proyecto o empresa significativa en la vida del usuario.
- De lo contrario, anótalo en las notas diarias.

Para el esquema YAML de hechos atómicos y las reglas de decaimiento de memoria, consulta [references/schemas.md](references/schemas.md).

### Capa 2: Notas Diarias (`$AGENT_HOME/memory/YYYY-MM-DD.md`)

Línea de tiempo en bruto de eventos -- la capa del "cuándo".

- Escribe continuamente durante las conversaciones.
- Extrae hechos duraderos a la Capa 1 durante los heartbeats.

### Capa 3: Conocimiento Tácito (`$AGENT_HOME/MEMORY.md`)

Cómo opera el usuario -- patrones, preferencias, lecciones aprendidas.

- No son hechos sobre el mundo; son hechos sobre el usuario.
- Actualiza cada vez que aprendas nuevos patrones de operación.

## Escríbelo -- Sin Notas Mentales

La memoria no sobrevive a los reinicios de sesión. Los archivos sí.

- ¿Quieres recordar algo? -> ESCRÍBELO EN UN ARCHIVO.
- "Recuerda esto" -> actualiza `$AGENT_HOME/memory/YYYY-MM-DD.md` o el archivo de entidad relevante.
- ¿Aprendiste una lección? -> actualiza AGENTS.md, TOOLS.md, o el archivo de skill relevante.
- ¿Cometiste un error? -> documéntalo para que tu yo futuro no lo repita.
- Los archivos de texto en disco siempre son mejores que mantenerlo en contexto temporal.

## Recuperación de Memoria -- Usa qmd

Usa `qmd` en lugar de hacer grep en archivos:

```bash
qmd query "what happened at Christmas"   # Búsqueda semántica con re-ranking
qmd search "specific phrase"              # Búsqueda por palabras clave BM25
qmd vsearch "conceptual question"         # Similitud vectorial pura
```

Indexa tu carpeta personal: `qmd index $AGENT_HOME`

Vectores + BM25 + re-ranking encuentra cosas incluso cuando la redacción difiere.

## Planificación

Mantén los planes en archivos con marca de tiempo en `plans/` en la raíz del proyecto (fuera de la memoria personal para que otros agentes puedan acceder). Usa `qmd` para buscar planes. Los planes se vuelven obsoletos -- si existe un plan más nuevo, no te confundas con una versión anterior. Si notas obsolescencia, actualiza el archivo para anotar por qué fue reemplazado (supersededBy).
