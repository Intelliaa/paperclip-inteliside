---
title: Acceso Privado Tailscale
summary: Ejecutar Paperclip con enlace de host compatible con Tailscale y conectar desde otros dispositivos
---

Usa esto cuando quieras acceder a Paperclip sobre Tailscale (o una LAN privada/VPN) en lugar de solo `localhost`.

## 1. Inicia Paperclip en modo autenticado privado

```sh
pnpm dev --tailscale-auth
```

Esto configura:

- `PAPERCLIP_DEPLOYMENT_MODE=authenticated`
- `PAPERCLIP_DEPLOYMENT_EXPOSURE=private`
- `PAPERCLIP_AUTH_BASE_URL_MODE=auto`
- `HOST=0.0.0.0` (enlazar en todas las interfaces)

Bandera equivalente:

```sh
pnpm dev --authenticated-private
```

## 2. Encuentra tu dirección Tailscale accesible

Desde la máquina que ejecuta Paperclip:

```sh
tailscale ip -4
```

También puedes usar tu nombre de host Tailscale MagicDNS (por ejemplo `mi-macbook.tailnet.ts.net`).

## 3. Abre Paperclip desde otro dispositivo

Usa la IP de Tailscale o el host MagicDNS con el puerto de Paperclip:

```txt
http://<tailscale-host-o-ip>:3100
```

Ejemplo:

```txt
http://mi-macbook.tailnet.ts.net:3100
```

## 4. Permite nombres de host privados personalizados cuando sea necesario

Si accedes a Paperclip con un nombre de host privado personalizado, añádelo a la lista de permitidos:

```sh
pnpm paperclipai allowed-hostname mi-macbook.tailnet.ts.net
```

## 5. Verifica que el servidor sea alcanzable

Desde un dispositivo conectado remotamente a Tailscale:

```sh
curl http://<tailscale-host-o-ip>:3100/api/health
```

Resultado esperado:

```json
{"status":"ok"}
```

## Solución de Problemas

- Errores de login o redirección en un nombre de host privado: añádelo con `paperclipai allowed-hostname`.
- La app solo funciona en `localhost`: asegúrate de que iniciaste con `--tailscale-auth` (o establece `HOST=0.0.0.0` en modo privado).
- Puedes conectar localmente pero no remotamente: verifica que ambos dispositivos están en la misma red Tailscale y el puerto `3100` es alcanzable.
