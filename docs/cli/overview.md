---
title: Descripción General de CLI
summary: Instalación de CLI y configuración
---

El CLI de TaskOrg maneja la configuración de instancia, diagnósticos y operaciones del plano de control.

## Uso

```sh
pnpm taskorg --help
```

## Opciones Globales

Todos los comandos soportan:

| Bandera | Descripción |
|------|-------------|
| `--data-dir <path>` | Raíz de datos local de TaskOrg (aísla de `~/.taskorg`) |
| `--api-base <url>` | URL base de la API |
| `--api-key <token>` | Token de autenticación de API |
| `--context <path>` | Ruta del archivo de contexto |
| `--profile <name>` | Nombre de perfil de contexto |
| `--json` | Salida como JSON |

Los comandos con alcance de empresa también aceptan `--company-id <id>`.

Para instancias locales limpias, pasa `--data-dir` en el comando que ejecutas:

```sh
pnpm taskorg run --data-dir ./tmp/taskorg-dev
```

## Perfiles de Contexto

Almacena predeterminados para evitar repetir banderas:

```sh
# Establecer predeterminados
pnpm taskorg context set --api-base http://localhost:3100 --company-id <id>

# Ver contexto actual
pnpm taskorg context show

# Listar perfiles
pnpm taskorg context list

# Cambiar perfil
pnpm taskorg context use default
```

Para evitar almacenar secretos en el contexto, usa una variable de entorno:

```sh
pnpm taskorg context set --api-key-env-var-name TASKORG_API_KEY
export TASKORG_API_KEY=...
```

El contexto se almacena en `~/.taskorg/context.json`.

## Categorías de Comandos

El CLI tiene dos categorías:

1. **[Comandos de configuración](/cli/setup-commands)** — bootstrap de instancia, diagnósticos, configuración
2. **[Comandos del plano de control](/cli/control-plane-commands)** — issues, agentes, aprobaciones, actividad
