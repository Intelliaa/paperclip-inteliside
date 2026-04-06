---
title: Arquitectura
summary: Descripción general del stack, flujo de solicitudes y modelo de adaptadores
---

Paperclip es un monorepo con cuatro capas principales.

## Descripción General del Stack

```
┌─────────────────────────────────────┐
│  React UI (Vite)                    │
│  Dashboard, gestión org, tareas     │
├─────────────────────────────────────┤
│  Express.js REST API (Node.js)      │
│  Rutas, servicios, auth, adaptadores│
├─────────────────────────────────────┤
│  PostgreSQL (Drizzle ORM)           │
│  Schema, migraciones, modo incorp.  │
├─────────────────────────────────────┤
│  Adaptadores                        │
│  Claude Local, Codex Local,         │
│  Proceso, HTTP                      │
└─────────────────────────────────────┘
```

## Stack Tecnológico

| Capa | Tecnología |
|-------|-----------|
| Frontend | React 19, Vite 6, React Router 7, Radix UI, Tailwind CSS 4, TanStack Query |
| Backend | Node.js 20+, Express.js 5, TypeScript |
| Base de datos | PostgreSQL 17 (o PGlite incorporado), Drizzle ORM |
| Auth | Better Auth (sesiones + claves API) |
| Adaptadores | CLI de Claude Code, CLI de Codex, proceso de shell, webhook HTTP |
| Gestor de paquetes | pnpm 9 con workspaces |

## Estructura del Repositorio

```
paperclip/
├── ui/                          # Frontend React
│   ├── src/pages/              # Páginas de ruta
│   ├── src/components/         # Componentes React
│   ├── src/api/                # Cliente de API
│   └── src/context/            # Proveedores de contexto React
│
├── server/                      # API Express.js
│   ├── src/routes/             # Endpoints REST
│   ├── src/services/           # Lógica de negocios
│   ├── src/adapters/           # Adaptadores de ejecución de agentes
│   └── src/middleware/         # Auth, logging
│
├── packages/
│   ├── db/                      # Schema de Drizzle + migraciones
│   ├── shared/                  # Tipos de API, constantes, validadores
│   ├── adapter-utils/           # Interfaces y auxiliares de adaptadores
│   └── adapters/
│       ├── claude-local/        # Adaptador de Claude Code
│       └── codex-local/         # Adaptador de OpenAI Codex
│
├── skills/                      # Skills de agentes
│   └── paperclip/               # Skill central de Paperclip (protocolo heartbeat)
│
├── cli/                         # Cliente CLI
│   └── src/                     # Comandos de configuración y plano de control
│
└── doc/                         # Documentación interna
```

## Flujo de Solicitud

Cuando se dispara un heartbeat:

1. **Disparador** — Planificador, invocación manual o evento (asignación, mención) dispara un heartbeat
2. **Invocación de adaptador** — Servidor llama a la función `execute()` del adaptador configurado
3. **Proceso de agente** — Adaptador genera el agente (ej. CLI de Claude Code) con variables de entorno de Paperclip y un prompt
4. **Trabajo del agente** — El agente llama a la API REST de Paperclip para verificar asignaciones, descargar tareas, hacer trabajo y actualizar estado
5. **Captura de resultado** — Adaptador captura stdout, parsea datos de uso/costo, extrae estado de sesión
6. **Registro de ejecución** — Servidor registra el resultado de ejecución, costos y cualquier estado de sesión para el próximo heartbeat

## Modelo de Adaptador

Los adaptadores son el puente entre Paperclip y los runtimes de agentes. Cada adaptador es un paquete con tres módulos:

- **Módulo de servidor** — Función `execute()` que genera/llama el agente, más diagnósticos de entorno
- **Módulo de UI** — Parser de stdout para el visor de ejecución, campos de formulario de configuración para creación de agentes
- **Módulo de CLI** — Formateador de terminal para `paperclipai run --watch`

Adaptadores incorporados: `claude_local`, `codex_local`, `process`, `http`. Puedes crear adaptadores personalizados para cualquier runtime.

## Decisiones de Diseño Clave

- **Plano de control, no plano de ejecución** — Paperclip orquesta agentes; no los ejecuta
- **Alcance de empresa** — todas las entidades pertenecen exactamente a una empresa; límites de datos estrictos
- **Tareas de asignación única** — descargas atómicas previenen trabajo concurrente en la misma tarea
- **Agnóstico a adaptadores** — cualquier runtime que pueda llamar una API HTTP funciona como agente
- **Incorporado por defecto** — modo local sin configuración con PostgreSQL incorporado
