---
title: Descripción General de Despliegue
summary: Modos de despliegue de un vistazo
---

TaskOrg soporta tres configuraciones de despliegue, desde local sin fricción hasta producción en internet.

## Modos de Despliegue

| Modo | Autenticación | Mejor para |
|------|----------|----------|
| `local_trusted` | No se requiere login | Máquina local de un solo operador |
| `authenticated` + `private` | Login requerido | Red privada (Tailscale, VPN, LAN) |
| `authenticated` + `public` | Login requerido | Despliegue en nube con acceso a internet |

## Comparación Rápida

### Local Trusted (Predeterminado)

- Enlace de host solo en loopback (localhost)
- Sin flujo de login de usuario
- Inicio local más rápido
- Mejor para: desarrollo solo y experimentación

### Authenticated + Private

- Login requerido vía Better Auth
- Se enlaza a todas las interfaces para acceso de red
- Modo URL base automático (menos fricción)
- Mejor para: acceso de equipo sobre Tailscale o red local

### Authenticated + Public

- Login requerido
- URL pública explícita requerida
- Verificaciones de seguridad más estrictas
- Mejor para: hosting en nube, despliegue con acceso a internet

## Elegir un Modo

- **¿Solo probando TaskOrg?** Usa `local_trusted` (predeterminado)
- **¿Compartiendo con un equipo en red privada?** Usa `authenticated` + `private`
- **¿Desplegando a la nube?** Usa `authenticated` + `public`

Establece el modo durante la incorporación:

```sh
pnpm taskorg onboard
```

O actualízalo después:

```sh
pnpm taskorg configure --section server
```
