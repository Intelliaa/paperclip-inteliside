---
title: Desarrollo Local
summary: Configurar TaskOrg para desarrollo local
---

Ejecuta TaskOrg localmente sin dependencias externas.

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

No se requiere Docker ni base de datos externa. TaskOrg usa PostgreSQL embebido automáticamente.

## Bootstrap de Un Solo Comando

Para una instalación por primera vez:

```sh
pnpm taskorg run
```

Esto hace:

1. Auto-incorpora si falta la configuración
2. Ejecuta `taskorg doctor` con reparación habilitada
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
pnpm taskorg allowed-hostname dotta-macbook-pro
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
rm -rf ~/.taskorg/instances/default/db
pnpm dev
```

## Ubicaciones de Datos

| Datos | Ruta |
|------|------|
| Config | `~/.taskorg/instances/default/config.json` |
| Base de datos | `~/.taskorg/instances/default/db` |
| Almacenamiento | `~/.taskorg/instances/default/data/storage` |
| Clave de secretos | `~/.taskorg/instances/default/secrets/master.key` |
| Logs | `~/.taskorg/instances/default/logs` |

Anula con variables de entorno:

```sh
TASKORG_HOME=/custom/path TASKORG_INSTANCE_ID=dev pnpm taskorg run
```
