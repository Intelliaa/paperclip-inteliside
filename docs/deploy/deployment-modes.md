---
title: Modos de Despliegue
summary: local_trusted vs authenticated (privado/público)
---

TaskOrg soporta dos modos de runtime con diferentes perfiles de seguridad.

## `local_trusted`

El modo predeterminado. Optimizado para uso local de un solo operador.

- **Enlace de host**: solo loopback (localhost)
- **Autenticación**: no se requiere login
- **Caso de uso**: desarrollo local, experimentación solo
- **Identidad de la junta**: usuario de junta local creado automáticamente

```sh
# Establecer durante la incorporación
pnpm taskorg onboard
# Elige "local_trusted"
```

## `authenticated`

Login requerido. Soporta dos políticas de exposición.

### `authenticated` + `private`

Para acceso a red privada (Tailscale, VPN, LAN).

- **Autenticación**: login requerido vía Better Auth
- **Manejo de URL**: modo URL base automático (menos fricción)
- **Confianza de host**: política de confianza de host privado requerida

```sh
pnpm taskorg onboard
# Elige "authenticated" -> "private"
```

Permite nombres de host Tailscale personalizados:

```sh
pnpm taskorg allowed-hostname mi-máquina
```

### `authenticated` + `public`

Para despliegue con acceso a internet.

- **Autenticación**: login requerido
- **URL**: URL pública explícita requerida
- **Seguridad**: verificaciones de despliegue más estrictas en doctor

```sh
pnpm taskorg onboard
# Elige "authenticated" -> "public"
```

## Flujo de Reclamo de Junta

Cuando migras de `local_trusted` a `authenticated`, TaskOrg emite una URL de reclamo de una sola vez al inicio:

```
/board-claim/<token>?code=<code>
```

Un usuario conectado visita esta URL para reclamar la propiedad de la junta. Esto:

- Promueve al usuario actual a administrador de instancia
- Degrada al administrador de junta local creado automáticamente
- Asegura la membresía de compañía activa para el usuario que reclama

## Cambiar Modos

Actualiza el modo de despliegue:

```sh
pnpm taskorg configure --section server
```

Anulación de runtime a través de variable de entorno:

```sh
TASKORG_DEPLOYMENT_MODE=authenticated pnpm taskorg run
```
