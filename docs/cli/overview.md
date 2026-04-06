---
title: Descripción General de CLI
summary: Instalación de CLI y configuración
---

El CLI de Paperclip maneja la configuración de instancia, diagnósticos y operaciones del plano de control.

## Uso

```sh
pnpm paperclipai --help
```

## Opciones Globales

Todos los comandos soportan:

| Bandera | Descripción |
|------|-------------|
| `--data-dir <path>` | Raíz de datos local de Paperclip (aísla de `~/.paperclip`) |
| `--api-base <url>` | URL base de la API |
| `--api-key <token>` | Token de autenticación de API |
| `--context <path>` | Ruta del archivo de contexto |
| `--profile <name>` | Nombre de perfil de contexto |
| `--json` | Salida como JSON |

Los comandos con alcance de empresa también aceptan `--company-id <id>`.

Para instancias locales limpias, pasa `--data-dir` en el comando que ejecutas:

```sh
pnpm paperclipai run --data-dir ./tmp/paperclip-dev
```

## Perfiles de Contexto

Almacena predeterminados para evitar repetir banderas:

```sh
# Establecer predeterminados
pnpm paperclipai context set --api-base http://localhost:3100 --company-id <id>

# Ver contexto actual
pnpm paperclipai context show

# Listar perfiles
pnpm paperclipai context list

# Cambiar perfil
pnpm paperclipai context use default
```

Para evitar almacenar secretos en el contexto, usa una variable de entorno:

```sh
pnpm paperclipai context set --api-key-env-var-name PAPERCLIP_API_KEY
export PAPERCLIP_API_KEY=...
```

El contexto se almacena en `~/.paperclip/context.json`.

## Categorías de Comandos

El CLI tiene dos categorías:

1. **[Comandos de configuración](/cli/setup-commands)** — bootstrap de instancia, diagnósticos, configuración
2. **[Comandos del plano de control](/cli/control-plane-commands)** — issues, agentes, aprobaciones, actividad
