---
title: Comandos de Configuración
summary: Incorporar, ejecutar, doctor y configurar
---

Comandos de configuración de instancia y diagnósticos.

## `taskorg run`

Bootstrap e inicio en un comando:

```sh
pnpm taskorg run
```

Hace:

1. Auto-configura si falta configuración
2. Ejecuta `taskorg doctor` con reparación habilitada
3. Inicia el servidor cuando los controles pasan

Elige una instancia específica:

```sh
pnpm taskorg run --instance dev
```

## `taskorg onboard`

Configuración interactiva de primera vez:

```sh
pnpm taskorg onboard
```

Si TaskOrg ya está configurado, ejecutar nuevamente `onboard` mantiene la configuración existente. Usa `taskorg configure` para cambiar configuraciones en una instalación existente.

Primer prompt:

1. `Inicio Rápido` (recomendado): predeterminados locales (base de datos incorporada, sin proveedor de LLM, almacenamiento en disco local, secretos predeterminados)
2. `Configuración Avanzada`: configuración interactiva completa

Inicia inmediatamente después de la incorporación:

```sh
pnpm taskorg onboard --run
```

Predeterminados no interactivos + inicio inmediato (abre navegador en escucha del servidor):

```sh
pnpm taskorg onboard --yes
```

En una instalación existente, `--yes` ahora preserva la configuración actual e inicia TaskOrg con esa configuración.

## `taskorg doctor`

Verificaciones de salud con reparación automática opcional:

```sh
pnpm taskorg doctor
pnpm taskorg doctor --repair
```

Valida:

- Configuración del servidor
- Conectividad de la base de datos
- Configuración del adaptador de secretos
- Configuración de almacenamiento
- Archivos clave faltantes

## `taskorg configure`

Actualizar secciones de configuración:

```sh
pnpm taskorg configure --section server
pnpm taskorg configure --section secrets
pnpm taskorg configure --section storage
```

## `taskorg env`

Mostrar configuración de entorno resuelta:

```sh
pnpm taskorg env
```

## `taskorg allowed-hostname`

Permite un nombre de host privado para modo autenticado/privado:

```sh
pnpm taskorg allowed-hostname my-tailscale-host
```

## Rutas de Almacenamiento Local

| Datos | Ruta Predeterminada |
|------|-------------|
| Config | `~/.taskorg/instances/default/config.json` |
| Base de datos | `~/.taskorg/instances/default/db` |
| Logs | `~/.taskorg/instances/default/logs` |
| Almacenamiento | `~/.taskorg/instances/default/data/storage` |
| Clave de secretos | `~/.taskorg/instances/default/secrets/master.key` |

Anular con:

```sh
TASKORG_HOME=/custom/home TASKORG_INSTANCE_ID=dev pnpm taskorg run
```

O pasa `--data-dir` directamente en cualquier comando:

```sh
pnpm taskorg run --data-dir ./tmp/taskorg-dev
pnpm taskorg doctor --data-dir ./tmp/taskorg-dev
```
