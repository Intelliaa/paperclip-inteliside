---
title: Docker
summary: Inicio rápido con Docker Compose
---

Ejecuta Paperclip en Docker sin instalar Node o pnpm localmente.

## Compose Inicio Rápido (Recomendado)

```sh
docker compose -f docker/docker-compose.quickstart.yml up --build
```

Abre [http://localhost:3100](http://localhost:3100).

Predeterminados:

- Puerto del host: `3100`
- Directorio de datos: `./data/docker-paperclip`

Anula con variables de entorno:

```sh
PAPERCLIP_PORT=3200 PAPERCLIP_DATA_DIR=../data/pc \
  docker compose -f docker/docker-compose.quickstart.yml up --build
```

**Nota:** `PAPERCLIP_DATA_DIR` se resuelve relativo al archivo compose (`docker/`), así que `../data/pc` se asigna a `data/pc` en la raíz del proyecto.

## Build Manual de Docker

```sh
docker build -t paperclip-local .
docker run --name paperclip \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e PAPERCLIP_HOME=/paperclip \
  -v "$(pwd)/data/docker-paperclip:/paperclip" \
  paperclip-local
```

## Persistencia de Datos

Todos los datos se persisten bajo el bind mount (`./data/docker-paperclip`):

- Datos de PostgreSQL embebido
- Assets subidos
- Clave de secretos local
- Datos del workspace del agente

## Adapters Claude y Codex en Docker

La imagen Docker preinstala:

- `claude` (CLI de Anthropic Claude Code)
- `codex` (CLI de OpenAI Codex)

Pasa las claves API para habilitar ejecuciones del adapter local dentro del contenedor:

```sh
docker run --name paperclip \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e PAPERCLIP_HOME=/paperclip \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-... \
  -v "$(pwd)/data/docker-paperclip:/paperclip" \
  paperclip-local
```

Sin claves API, la app se ejecuta normalmente — las verificaciones del entorno del adapter surfacearán los requisitos previos faltantes.
