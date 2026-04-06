---
title: Comandos de Configuración
summary: Incorporar, ejecutar, doctor y configurar
---

Comandos de configuración de instancia y diagnósticos.

## `paperclipai run`

Bootstrap e inicio en un comando:

```sh
pnpm paperclipai run
```

Hace:

1. Auto-configura si falta configuración
2. Ejecuta `paperclipai doctor` con reparación habilitada
3. Inicia el servidor cuando los controles pasan

Elige una instancia específica:

```sh
pnpm paperclipai run --instance dev
```

## `paperclipai onboard`

Configuración interactiva de primera vez:

```sh
pnpm paperclipai onboard
```

Si Paperclip ya está configurado, ejecutar nuevamente `onboard` mantiene la configuración existente. Usa `paperclipai configure` para cambiar configuraciones en una instalación existente.

Primer prompt:

1. `Inicio Rápido` (recomendado): predeterminados locales (base de datos incorporada, sin proveedor de LLM, almacenamiento en disco local, secretos predeterminados)
2. `Configuración Avanzada`: configuración interactiva completa

Inicia inmediatamente después de la incorporación:

```sh
pnpm paperclipai onboard --run
```

Predeterminados no interactivos + inicio inmediato (abre navegador en escucha del servidor):

```sh
pnpm paperclipai onboard --yes
```

En una instalación existente, `--yes` ahora preserva la configuración actual e inicia Paperclip con esa configuración.

## `paperclipai doctor`

Verificaciones de salud con reparación automática opcional:

```sh
pnpm paperclipai doctor
pnpm paperclipai doctor --repair
```

Valida:

- Configuración del servidor
- Conectividad de la base de datos
- Configuración del adaptador de secretos
- Configuración de almacenamiento
- Archivos clave faltantes

## `paperclipai configure`

Actualizar secciones de configuración:

```sh
pnpm paperclipai configure --section server
pnpm paperclipai configure --section secrets
pnpm paperclipai configure --section storage
```

## `paperclipai env`

Mostrar configuración de entorno resuelta:

```sh
pnpm paperclipai env
```

## `paperclipai allowed-hostname`

Permite un nombre de host privado para modo autenticado/privado:

```sh
pnpm paperclipai allowed-hostname my-tailscale-host
```

## Rutas de Almacenamiento Local

| Datos | Ruta Predeterminada |
|------|-------------|
| Config | `~/.paperclip/instances/default/config.json` |
| Base de datos | `~/.paperclip/instances/default/db` |
| Logs | `~/.paperclip/instances/default/logs` |
| Almacenamiento | `~/.paperclip/instances/default/data/storage` |
| Clave de secretos | `~/.paperclip/instances/default/secrets/master.key` |

Anular con:

```sh
PAPERCLIP_HOME=/custom/home PAPERCLIP_INSTANCE_ID=dev pnpm paperclipai run
```

O pasa `--data-dir` directamente en cualquier comando:

```sh
pnpm paperclipai run --data-dir ./tmp/paperclip-dev
pnpm paperclipai doctor --data-dir ./tmp/paperclip-dev
```
