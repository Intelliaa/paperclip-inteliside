# Votación de Retroalimentación — Guía de Datos Locales

Cuando califica la respuesta de un agente con **Helpful** (pulgar arriba) o **Needs work** (pulgar abajo), TaskOrg guarda tu voto localmente junto con tu instancia en ejecución. Esta guía cubre qué se almacena, cómo acceder a ello y cómo exportarlo.

## Cómo funciona la votación

1. Haz clic en **Helpful** o **Needs work** en cualquier comentario de agente o revisión de documento.
2. Si haces clic en **Needs work**, aparece un prompt de texto opcional: _"¿Qué hubiera podido ser mejor?"_ Puedes escribir una razón o descartarlo.
3. Un diálogo de consentimiento pregunta si mantener el voto local o compartirlo. Tu elección se recuerda para futuros votos.

### Qué se almacena

Cada voto crea dos registros locales:

| Registro | Qué contiene |
|--------|-----------------|
| **Vote** | Tu voto (arriba/abajo), texto de razón opcional, preferencia de compartición, versión de consentimiento, timestamp |
| **Trace bundle** | Snapshot de contexto completo: texto del comentario/revisión votado, título del problema, información del agente, tu voto y razón — todo lo necesario para entender la retroalimentación aisladamente |

Todos los datos viven en tu base de datos local de TaskOrg. Nada sale de tu máquina a menos que explícitamente elijas compartir.

Cuando un voto está marcado para compartir, TaskOrg intenta inmediatamente subir el trace bundle a través del Telemetry Backend. La subida se comprime en tránsito para que los bundles de trace completos se mantengan bajo los límites de tamaño de gateway. Si ese push inmediato falla, el trace se deja en un estado fallido reintentable para intentos posteriores de flush. El servidor de aplicación nunca sube bundles de trace de retroalimentación sin procesar directamente al almacenamiento de objetos.

## Visualizando tus votos

### Reporte rápido (terminal)

```bash
pnpm taskorg feedback report
```

Muestra un resumen codificado por colores: conteos de votos, detalles por trace con razones, y estados de exportación.

```bash
# CLI instalado
taskorg feedback report

# Apuntar a un servidor o compañía diferente
pnpm taskorg feedback report --api-base http://127.0.0.1:3000 --company-id <company-id>

# Incluir volcados de payload sin procesar en el reporte
pnpm taskorg feedback report --payloads
```

### Endpoints de API

Todos los endpoints requieren acceso board-user (automático en local dev).

**Listar votos para un issue:**
```bash
curl http://127.0.0.1:3102/api/issues/<issueId>/feedback-votes
```

**Listar trace bundles para un issue (con payloads completos):**
```bash
curl 'http://127.0.0.1:3102/api/issues/<issueId>/feedback-traces?includePayload=true'
```

**Listar todos los traces a nivel de compañía:**
```bash
curl 'http://127.0.0.1:3102/api/companies/<companyId>/feedback-traces?includePayload=true'
```

**Obtener un registro envelope de trace único:**
```bash
curl http://127.0.0.1:3102/api/feedback-traces/<traceId>
```

**Obtener el bundle de exportación completo para un trace:**
```bash
curl http://127.0.0.1:3102/api/feedback-traces/<traceId>/bundle
```

#### Filtrado

Los endpoints de trace aceptan parámetros de query:

| Parámetro | Valores | Descripción |
|-----------|--------|-------------|
| `vote` | `up`, `down` | Filtrar por dirección de voto |
| `status` | `local_only`, `pending`, `sent`, `failed` | Filtrar por estado de exportación |
| `targetType` | `issue_comment`, `issue_document_revision` | Filtrar por qué fue votado |
| `sharedOnly` | `true` | Mostrar solo votos que el usuario eligió compartir |
| `includePayload` | `true` | Incluir el snapshot de contexto completo |
| `from` / `to` | ISO date | Filtro de rango de fechas |

## Exportando tus datos

### Exportar a archivos + zip

```bash
pnpm taskorg feedback export
```

Crea un directorio con timestamp:

```
feedback-export-20260331T120000Z/
  index.json                    # manifiesto con estadísticas resumidas
  votes/
    PAP-123-a1b2c3d4.json      # metadatos de voto (uno por voto)
  traces/
    PAP-123-e5f6g7h8.json      # envelope de retroalimentación TaskOrg (uno por trace)
  full-traces/
    PAP-123-e5f6g7h8/
      bundle.json              # manifiesto de exportación completo para el trace
      ...raw adapter files     # artefactos de sesión codex / claude / opencode cuando están disponibles
feedback-export-20260331T120000Z.zip
```

Las exportaciones son completas por defecto. `traces/` mantiene el envelope TaskOrg, mientras que `full-traces/` contiene el bundle por trace más rico más cualquier archivo nativo de adapter recuperable.

```bash
# Servidor personalizado y directorio de salida
pnpm taskorg feedback export --api-base http://127.0.0.1:3000 --company-id <company-id> --out ./my-export
```

### Leyendo un trace exportado

Abre cualquier archivo en `traces/` para ver:

```json
{
  "id": "trace-uuid",
  "vote": "down",
  "issueIdentifier": "PAP-123",
  "issueTitle": "Fix login timeout",
  "targetType": "issue_comment",
  "targetSummary": {
    "label": "Comment",
    "excerpt": "Los primeros 80 caracteres del comentario que fue votado..."
  },
  "payloadSnapshot": {
    "vote": {
      "value": "down",
      "reason": "Did not address the root cause"
    },
    "target": {
      "body": "Texto completo del comentario del agente..."
    },
    "issue": {
      "identifier": "PAP-123",
      "title": "Fix login timeout"
    }
  }
}
```

Abre `full-traces/<issue>-<trace>/bundle.json` para ver los metadatos de exportación expandidos, incluyendo notas de captura, tipo de adapter, metadatos de integridad, e inventario de archivos sin procesar escritos junto a él.

Cada entrada en `bundle.json.files[]` incluye el payload real del archivo capturado bajo `contents`, no solo un pathname. Para artefactos de texto esto se almacena como texto UTF-8; los artefactos binarios usan base64 más un marcador `encoding`.

Los adapters locales incorporados ahora exportan sus artefactos de sesión nativos más directamente:

- `codex_local`: `adapter/codex/session.jsonl`
- `claude_local`: `adapter/claude/session.jsonl`, más cualquier archivo `adapter/claude/session/...` sidecar y `adapter/claude/debug.txt` cuando está presente
- `opencode_local`: `adapter/opencode/session.json`, `adapter/opencode/messages/*.json`, y `adapter/opencode/parts/<messageId>/*.json`, con `project.json`, `todo.json`, y `session-diff.json` opcionales

## Preferencias de compartición

La primera vez que votas, un diálogo de consentimiento pregunta:

- **Mantener local** — voto se almacena solo localmente (`sharedWithLabs: false`)
- **Compartir este voto** — voto está marcado para compartir (`sharedWithLabs: true`)

Tu preferencia se guarda por compañía. Puedes cambiarla en cualquier momento vía la configuración de retroalimentación. Los votos marcados "mantener local" nunca se ponen en cola para exportación.

## Ciclo de vida de datos

| Estado | Significado |
|--------|---------|
| `local_only` | Voto almacenado localmente, no marcado para compartir |
| `pending` | Marcado para compartir, almacenado localmente, y esperando el intento de subida inmediato |
| `sent` | Transmitido exitosamente |
| `failed` | Intento de transmisión pero falló (por ejemplo el backend no está disponible o no configurado); los flushes posteriores reintentan una vez que un backend está disponible |

Tu base de datos local siempre retiene los datos completos de voto y trace sin importar el estado de compartición.

## Sincronización remota

Los votos que eliges compartir se envían al Telemetry Backend inmediatamente desde la solicitud de voto. El servidor también mantiene un worker de flush en segundo plano para que los traces fallidos puedan reintentar después. El Telemetry Backend valida la solicitud, luego persiste el bundle en su almacenamiento de objetos configurado.

- Responsabilidad del servidor de aplicación: construir el bundle, POSTear a Telemetry Backend, actualizar estado del trace
- Responsabilidad del Telemetry Backend: autenticar la solicitud, validar forma de payload, comprimir/almacenar el bundle, retornar la clave de objeto final
- Comportamiento de reintento: las subidas fallidas se mueven a `failed` con un mensaje de error en `failureReason`, y el worker los reintenta en ticks posteriores
- Endpoint predeterminado: cuando ninguna URL de backend de exportación de retroalimentación está configurada, TaskOrg vuelve a `https://telemetry.taskorg.ing`
- Matiz importante: el objeto subido es un snapshot del bundle completo en tiempo de voto. Si recuperas un bundle local después y el archivo de sesión del adapter subyacente ha continuado creciendo, el bundle regenerado localmente puede ser más grande que el snapshot ya subido para ese mismo trace.

Los objetos exportados usan un patrón de clave determinístico para que sean fáciles de inspeccionar:

```text
feedback-traces/<companyId>/YYYY/MM/DD/<exportId-or-traceId>.json
```
