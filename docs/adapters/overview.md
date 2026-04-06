---
title: Descripción General de Adapters
summary: Qué son los adapters y cómo conectan agentes a TaskOrg
---

Los adapters son el puente entre la capa de orquestación de TaskOrg y los runtimes del agente. Cada adapter sabe cómo invocar un tipo específico de agente de IA y capturar sus resultados.

## Cómo Funcionan los Adapters

Cuando se dispara un heartbeat, TaskOrg:

1. Busca `adapterType` y `adapterConfig` del agente
2. Llama a la función `execute()` del adapter con el contexto de ejecución
3. El adapter genera o llama al runtime del agente
4. El adapter captura stdout, analiza datos de uso/costo, y devuelve un resultado estructurado

## Adapters Incorporados

| Adapter | Clave de Tipo | Descripción |
|---------|----------|-------------|
| [Claude Local](/adapters/claude-local) | `claude_local` | Ejecuta Claude Code CLI localmente |
| [Codex Local](/adapters/codex-local) | `codex_local` | Ejecuta OpenAI Codex CLI localmente |
| [Gemini Local](/adapters/gemini-local) | `gemini_local` | Ejecuta Gemini CLI localmente (experimental — el paquete del adapter existe, aún no en enum de tipo estable) |
| OpenCode Local | `opencode_local` | Ejecuta OpenCode CLI localmente (multi-proveedor `provider/model`) |
| Cursor | `cursor` | Ejecuta Cursor en modo de fondo |
| Pi Local | `pi_local` | Ejecuta un agente Pi embebido localmente |
| Hermes Local | `hermes_local` | Ejecuta Hermes CLI localmente (`hermes-taskorg-adapter`) |
| OpenClaw Gateway | `openclaw_gateway` | Se conecta a un endpoint de puerta de enlace OpenClaw |
| [Process](/adapters/process) | `process` | Ejecuta comandos shell arbitrarios |
| [HTTP](/adapters/http) | `http` | Envía webhooks a agentes externos |

### Adapters externos (plugin)

Estos adapters se distribuyen como paquetes npm independientes e se instalan a través del sistema de plugins:

| Adapter | Paquete | Clave de Tipo | Descripción |
|---------|---------|----------|-------------|
| Droid Local | `@henkey/droid-taskorg-adapter` | `droid_local` | Ejecuta Factory Droid localmente |

## Adapters Externos

Puedes construir y distribuir adapters como paquetes independientes — sin cambios requeridos en el código fuente de TaskOrg. Los adapters externos se cargan al inicio a través del sistema de plugins.

```sh
# Instala desde npm vía API
curl -X POST http://localhost:3102/api/adapters \
  -d '{"packageName": "my-taskorg-adapter"}'

# O enlaza desde un directorio local
curl -X POST http://localhost:3102/api/adapters \
  -d '{"localPath": "/home/user/my-adapter"}'
```

Ver [Adapters Externos](/adapters/external-adapters) para la guía completa.

## Arquitectura del Adapter

Cada adapter es un paquete con módulos consumidos por tres registros:

```
mi-adapter/
  src/
    index.ts            # Metadatos compartidos (tipo, etiqueta, modelos)
    server/
      execute.ts        # Lógica de ejecución central
      parse.ts          # Análisis de salida
      test.ts           # Diagnósticos del entorno
    ui-parser.ts        # Parser de transcripción UI autónomo (para adapters externos)
    cli/
      format-event.ts   # Salida de terminal para `taskorg run --watch`
```

| Registro | Qué hace | Fuente |
|----------|-------------|--------|
| **Server** | Ejecuta agentes, captura resultados | `createServerAdapter()` de la raíz del paquete |
| **UI** | Renderiza transcripciones de ejecución, proporciona formularios de configuración | `ui-parser.js` (dinámico) o importación estática (incorporado) |
| **CLI** | Formatea la salida del terminal para ver en directo | Importación estática |

## Elegir un Adapter

- **¿Necesitas un agente de codificación?** Usa `claude_local`, `codex_local`, `opencode_local`, `hermes_local`, o instala `droid_local` como plugin externo
- **¿Necesitas ejecutar un script o comando?** Usa `process`
- **¿Necesitas llamar a un servicio externo?** Usa `http`
- **¿Necesitas algo personalizado?** [Crea tu propio adapter](/adapters/creating-an-adapter) o [construye un plugin de adapter externo](/adapters/external-adapters)

## Contrato UI Parser

Los adapters externos pueden distribuir un parser UI autónomo que le dice a la UI web de TaskOrg cómo renderizar su stdout. Sin él, la UI usa un parser shell genérico. Ver el [Contrato UI Parser](/adapters/adapter-ui-parser) para detalles.
