# Ejecutando OpenClaw en Docker (Desarrollo Local)

Cómo hacer que OpenClaw se ejecute en un contenedor Docker para desarrollo local y prueba de la integración del adaptador OpenClaw de Paperclip.

## Prueba de Humo de Unión Automatizada (Recomendado Primero)

Paperclip incluye un arnés de humo de unión end-to-end:

```bash
pnpm smoke:openclaw-join
```

El arnés automatiza:

- creación de invitación (`allowedJoinTypes=agent`)
- solicitud de unión de agente OpenClaw (`adapterType=openclaw`)
- aprobación de board
- reclamación de clave API de una sola vez (incluyendo verificaciones de reclamación inválida/replay)
- entrega de callback de despertar a un receptor webhook estilo OpenClaw dockerizado

Por defecto, esto usa una imagen de receptor Docker preconfigurada (`docker/openclaw-smoke`) para que la ejecución sea determinística y no requiera ediciones manuales de configuración de OpenClaw.

Nota de permisos:

- El arnés realiza acciones gobernadas por board (creación de invitación, aprobación de unión, despertar del nuevo agente).
- En modo autenticado, proporciona autenticación de board/operador o la ejecución sale temprano con un error de permisos explícito.

## UI de Gateway OpenClaw de Un Comando (Flujo Docker Manual)

Para girar OpenClaw en Docker e imprimir una URL de dashboard de navegador host en un comando:

```bash
pnpm smoke:openclaw-docker-ui
```

El comportamiento predeterminado es cero-flag: puedes ejecutar el comando tal cual sin variables env relacionadas con emparejamiento.

Lo que este comando hace:

- clona/actualiza `openclaw/openclaw` en `/tmp/openclaw-docker`
- construye `openclaw:local` (a menos que `OPENCLAW_BUILD=0`)
- escribe configuración de humo aislada bajo `~/.openclaw-paperclip-smoke/openclaw.json` y Docker `.env`
- fija valores por defecto de modelo de agente a OpenAI (`openai/gpt-5.2` con fallback de OpenAI)
- inicia `openclaw-gateway` vía Compose (con anulación tmpfs `/tmp` requerida)
- prueba e imprime una URL de host de Paperclip que es alcanzable desde dentro de Docker de OpenClaw
- espera por salud e imprime:
  - `http://127.0.0.1:18789/#token=...`
- deshabilita emparejamiento de dispositivo de Control UI por defecto para ergonomía local de humo

Controles de entorno:

- `OPENAI_API_KEY` (requerido; cargado desde env o `~/.secrets`)
- `OPENCLAW_DOCKER_DIR` (predeterminado `/tmp/openclaw-docker`)
- `OPENCLAW_GATEWAY_PORT` (predeterminado `18789`)
- `OPENCLAW_GATEWAY_TOKEN` (predeterminado aleatorio)
- `OPENCLAW_BUILD=0` para saltar reconstrucción
- `OPENCLAW_OPEN_BROWSER=1` para abrir automáticamente la URL en macOS
- `OPENCLAW_DISABLE_DEVICE_AUTH=1` (predeterminado) deshabilita emparejamiento de dispositivo de Control UI para humo local
- `OPENCLAW_DISABLE_DEVICE_AUTH=0` mantiene emparejamiento habilitado (luego aprueba navegador con comandos CLI `devices`)
- `OPENCLAW_MODEL_PRIMARY` (predeterminado `openai/gpt-5.2`)
- `OPENCLAW_MODEL_FALLBACK` (predeterminado `openai/gpt-5.2-chat-latest`)
- `OPENCLAW_CONFIG_DIR` (predeterminado `~/.openclaw-paperclip-smoke`)
- `OPENCLAW_RESET_STATE=1` (predeterminado) reinicia estado de agente de humo en cada ejecución para evitar deriva de autenticación/sesión obsoleta
- `PAPERCLIP_HOST_PORT` (predeterminado `3100`)
- `PAPERCLIP_HOST_FROM_CONTAINER` (predeterminado `host.docker.internal`)

### Modo autenticado

Si tu implementación de Paperclip es `authenticated`, proporciona contexto de autenticación:

```bash
PAPERCLIP_AUTH_HEADER="Bearer <token>" pnpm smoke:openclaw-join
# o
PAPERCLIP_COOKIE="your_session_cookie=..." pnpm smoke:openclaw-join
```

### Consejos de topología de red

- Humo local de mismo-host: callback predeterminado usa `http://127.0.0.1:<port>/webhook`.
- Dentro de Docker de OpenClaw, `127.0.0.1` apunta al contenedor mismo, no a tu servidor Paperclip host.
- Para URLs de invitación/onboarding consumidas por OpenClaw en Docker, usa la URL Paperclip impresa por script (típicamente `http://host.docker.internal:3100`).
- Si Paperclip rechaza el host visible por contenedor con un error de nombre de host, permítelo desde host:

```bash
pnpm paperclipai allowed-hostname host.docker.internal
```

Luego reinicia Paperclip y reejecutar el script de humo.
- Docker/OpenClaw remoto: prefiere un nombre de host alcanzable (alias de host Docker, nombre de host Tailscale, o dominio público).
- Modo autenticado/privado: asegura que nombres de host estén en la lista permitida cuando sea requerido:

```bash
pnpm paperclipai allowed-hostname <host>
```

## Requisitos Previos

- **Docker Desktop v29+** (con soporte de Docker Sandbox)
- **2 GB+ RAM** disponible para la construcción de imagen Docker
- **Claves API** en `~/.secrets` (como mínimo `OPENAI_API_KEY`)

## Opción A: Docker Sandbox (Recomendado)

Docker Sandbox proporciona mejor aislamiento (basado en microVM) y configuración más simple que Docker Compose. Requiere Docker Desktop v29+ / Docker Sandbox v0.12+.

```bash
# 1. Clonar el repositorio de OpenClaw y construir la imagen
git clone https://github.com/openclaw/openclaw.git /tmp/openclaw-docker
cd /tmp/openclaw-docker
docker build -t openclaw:local -f Dockerfile .

# 2. Crear el sandbox usando la imagen construida
docker sandbox create --name openclaw -t openclaw:local shell ~/.openclaw/workspace

# 3. Permitir acceso a la red a OpenAI API
docker sandbox network proxy openclaw \
  --allow-host api.openai.com \
  --allow-host localhost

# 4. Escribir la configuración dentro del sandbox
docker sandbox exec openclaw sh -c '
mkdir -p /home/node/.openclaw/workspace /home/node/.openclaw/identity /home/node/.openclaw/credentials
cat > /home/node/.openclaw/openclaw.json << INNEREOF
{
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "sandbox-dev-token-12345"
    },
    "controlUi": { "enabled": true }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "openai/gpt-5.2",
        "fallbacks": ["openai/gpt-5.2-chat-latest"]
      },
      "workspace": "/home/node/.openclaw/workspace"
    }
  }
}
INNEREOF
chmod 600 /home/node/.openclaw/openclaw.json
'

# 5. Iniciar el gateway (pasar tu clave API desde ~/.secrets)
source ~/.secrets
docker sandbox exec -d \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -w /app openclaw \
  node dist/index.js gateway --bind loopback --port 18789

# 6. Esperar ~15 segundos, luego verificar
sleep 15
docker sandbox exec openclaw curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:18789/
# Debe imprimir: 200

# 7. Verificar estado
docker sandbox exec -e OPENAI_API_KEY="$OPENAI_API_KEY" -w /app openclaw \
  node dist/index.js status
```

### Gestión de Sandbox

```bash
# Listar sandboxes
docker sandbox ls

# Shell en el sandbox
docker sandbox exec -it openclaw bash

# Detener el sandbox (preserva estado)
docker sandbox stop openclaw

# Remover el sandbox
docker sandbox rm openclaw

# Verificar versión de sandbox
docker sandbox version
```

## Opción B: Docker Compose (Fallback)

Usa esto si Docker Sandbox no está disponible (Docker Desktop < v29).

```bash
# 1. Clonar el repositorio de OpenClaw
git clone https://github.com/openclaw/openclaw.git /tmp/openclaw-docker
cd /tmp/openclaw-docker

# 2. Construir la imagen Docker (~5-10 min en la primera ejecución)
docker build -t openclaw:local -f Dockerfile .

# 3. Crear directorios de configuración
mkdir -p ~/.openclaw/workspace ~/.openclaw/identity ~/.openclaw/credentials
chmod 700 ~/.openclaw ~/.openclaw/credentials

# 4. Generar un token de gateway
export OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)
echo "Tu token de gateway: $OPENCLAW_GATEWAY_TOKEN"

# 5. Crear el archivo de configuración
cat > ~/.openclaw/openclaw.json << EOF
{
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "lan",
    "auth": {
      "mode": "token",
      "token": "$OPENCLAW_GATEWAY_TOKEN"
    },
    "controlUi": {
      "enabled": true,
      "allowedOrigins": ["http://127.0.0.1:18789"]
    }
  },
  "env": {
    "OPENAI_API_KEY": "\${OPENAI_API_KEY}"
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "openai/gpt-5.2",
        "fallbacks": ["openai/gpt-5.2-chat-latest"]
      },
      "workspace": "/home/node/.openclaw/workspace"
    }
  }
}
EOF
chmod 600 ~/.openclaw/openclaw.json

# 6. Crear el archivo .env (cargar claves API desde ~/.secrets)
source ~/.secrets
cat > .env << EOF
OPENCLAW_CONFIG_DIR=$HOME/.openclaw
OPENCLAW_WORKSPACE_DIR=$HOME/.openclaw/workspace
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_BRIDGE_PORT=18790
OPENCLAW_GATEWAY_BIND=lan
OPENCLAW_GATEWAY_TOKEN=$OPENCLAW_GATEWAY_TOKEN
OPENCLAW_IMAGE=openclaw:local
OPENAI_API_KEY=$OPENAI_API_KEY
OPENCLAW_EXTRA_MOUNTS=
OPENCLAW_HOME_VOLUME=
OPENCLAW_DOCKER_APT_PACKAGES=
EOF

# 7. Agregar tmpfs a docker-compose.yml (requerido — ver Problemas Conocidos)
# Agregar a AMBOS servicios openclaw-gateway y openclaw-cli:
#   tmpfs:
#     - /tmp:exec,size=512M

# 8. Iniciar el gateway
docker compose up -d openclaw-gateway

# 9. Esperar ~15 segundos para el startup, luego obtener la URL del dashboard
sleep 15
docker compose run --rm openclaw-cli dashboard --no-open
```

La URL del dashboard se verá como: `http://127.0.0.1:18789/#token=<your-token>`

### Gestión de Docker Compose

```bash
cd /tmp/openclaw-docker

# Detener
docker compose down

# Iniciar de nuevo (no se necesita reconstrucción)
docker compose up -d openclaw-gateway

# Ver logs
docker compose logs -f openclaw-gateway

# Verificar estado
docker compose run --rm openclaw-cli status

# Obtener URL del dashboard
docker compose run --rm openclaw-cli dashboard --no-open
```

## Problemas Conocidos y Soluciones

### "no space left on device" al iniciar contenedores

El disco virtual de Docker Desktop puede estar lleno.

```bash
docker system df                   # verificar uso
docker system prune -f             # remover contenedores detenidos, redes no usadas
docker image prune -f              # remover imágenes dañadas
```

### "Unable to create fallback OpenClaw temp dir: /tmp/openclaw-1000" (Solo Compose)

El contenedor no puede escribir en `/tmp`. Agrega un mount `tmpfs` a `docker-compose.yml` para **ambos** servicios:

```yaml
services:
  openclaw-gateway:
    tmpfs:
      - /tmp:exec,size=512M
  openclaw-cli:
    tmpfs:
      - /tmp:exec,size=512M
```

Este problema no afecta el enfoque de Docker Sandbox.

### Discrepancia de versión de Node en imágenes de plantilla comunitaria

Algunas plantillas de sandbox construidas por la comunidad (p.ej. `olegselajev241/openclaw-dmr:latest`) envían Node 20, pero OpenClaw requiere Node >=22.12.0. Usa nuestra imagen `openclaw:local` construida localmente como la plantilla de sandbox en su lugar, que incluye Node 22.

### Gateway tarda ~15 segundos en responder después de iniciar

El gateway Node.js necesita tiempo para inicializar. Espera 15 segundos antes de acceder a `http://127.0.0.1:18789/`.

### Advertencias CLAUDE_AI_SESSION_KEY (Solo Compose)

Estas advertencias de Docker Compose son inofensivas y pueden ser ignoradas:
```
level=warning msg="The \"CLAUDE_AI_SESSION_KEY\" variable is not set. Defaulting to a blank string."
```

## Configuración

Archivo de configuración: `~/.openclaw/openclaw.json` (formato JSON5)

Configuraciones clave:
- `gateway.auth.token` — el token de autenticación para la UI web y API
- `agents.defaults.model.primary` — el modelo de IA (usa `openai/gpt-5.2` o más nuevo)
- `env.OPENAI_API_KEY` — hace referencia a la variable env `OPENAI_API_KEY` (enfoque Compose)

Las claves API se almacenan en `~/.secrets` y se pasan a contenedores vía variables env.

## Referencia

- [Docs de Docker de OpenClaw](https://docs.openclaw.ai/install/docker)
- [Referencia de Configuración de OpenClaw](https://docs.openclaw.ai/gateway/configuration-reference)
- [Blog de Docker: Ejecutar OpenClaw de Forma Segura en Docker Sandboxes](https://www.docker.com/blog/run-openclaw-securely-in-docker-sandboxes/)
- [Docs de Docker Sandbox](https://docs.docker.com/ai/sandboxes)
- [Modelos de OpenAI](https://platform.openai.com/docs/models) — modelos actuales: gpt-5.2, gpt-5.2-chat-latest, gpt-5.2-pro
