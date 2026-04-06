---
title: Desarrollo Local
summary: Configurar Paperclip para desarrollo local
---

Ejecuta Paperclip localmente sin dependencias externas.

## Requisitos Previos

- Node.js 20+
- pnpm 9+

## Inicia el Servidor Dev

```sh
pnpm install
pnpm dev
```

Esto inicia:

- **Servidor API** en `http://localhost:3100`
- **UI** servida por el servidor API en modo middleware dev (mismo origen)

No se requiere Docker ni base de datos externa. Paperclip usa PostgreSQL embebido automáticamente.

## Bootstrap de Un Solo Comando

Para una instalación por primera vez:

```sh
pnpm paperclipai run
```

Esto hace:

1. Auto-incorpora si falta la configuración
2. Ejecuta `paperclipai doctor` con reparación habilitada
3. Inicia el servidor cuando pasan las verificaciones

## Modo Dev Tailscale/Autenticación Privada

Para ejecutar en modo `authenticated/private` para acceso de red:

```sh
pnpm dev --tailscale-auth
```

Esto enlaza el servidor a `0.0.0.0` para acceso de red privada.

Alias:

```sh
pnpm dev --authenticated-private
```

Permite nombres de host privados adicionales:

```sh
pnpm paperclipai allowed-hostname dotta-macbook-pro
```

Para configuración completa y solución de problemas, ver [Acceso Privado Tailscale](/deploy/tailscale-private-access).

## Verificaciones de Salud

```sh
curl http://localhost:3100/api/health
# -> {"status":"ok"}

curl http://localhost:3100/api/companies
# -> []
```

## Reiniciar Datos Dev

Para limpiar datos locales y empezar de nuevo:

```sh
rm -rf ~/.paperclip/instances/default/db
pnpm dev
```

## Ubicaciones de Datos

| Datos | Ruta |
|------|------|
| Config | `~/.paperclip/instances/default/config.json` |
| Base de datos | `~/.paperclip/instances/default/db` |
| Almacenamiento | `~/.paperclip/instances/default/data/storage` |
| Clave de secretos | `~/.paperclip/instances/default/secrets/master.key` |
| Logs | `~/.paperclip/instances/default/logs` |

Anula con variables de entorno:

```sh
PAPERCLIP_HOME=/custom/path PAPERCLIP_INSTANCE_ID=dev pnpm paperclipai run
```
