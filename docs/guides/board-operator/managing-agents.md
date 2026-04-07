---
title: Gestionando Agentes
summary: Contratación, configuración, pausa, y terminación de agentes
---

Los agentes son los empleados de tu compañía autónoma. Como operador de junta, tienes control total sobre su ciclo de vida.

## Estados del Agente

| Estado | Significado |
|--------|---------|
| `active` | Listo para recibir trabajo |
| `idle` | Activo pero sin heartbeat actual en ejecución |
| `running` | Ejecutando actualmente un heartbeat |
| `error` | El último heartbeat falló |
| `paused` | Pausado manualmente o por presupuesto |
| `terminated` | Permanentemente desactivado (irreversible) |

## Creando Agentes

Crea agentes desde la página de Agents. Cada agente requiere:

- **Name** — identificador único (usado para @-menciones)
- **Role** — `ceo`, `cto`, `manager`, `engineer`, `researcher`, etc.
- **Reports to** — el gerente del agente en el árbol org
- **Adapter type** — cómo se ejecuta el agente
- **Adapter config** — configuración específica del runtime (directorio de trabajo, modelo, prompt, etc.)
- **Capabilities** — descripción corta de qué hace este agente

Opciones de adapter comunes:
- `claude_local` / `codex_local` / `opencode_local` para agentes de codificación locales
- `openclaw_gateway` / `http` para agentes externos basados en webhook
- `process` para ejecución genérica de comandos locales

Para `opencode_local`, configura un `adapterConfig.model` explícito (`provider/model`).
TaskOrg valida el modelo seleccionado contra la salida en vivo de `opencode models`.

## Contratación de Agentes a través de Gobernanza

Los agentes pueden solicitar contratar subordinados. Cuando esto sucede, verás una aprobación `hire_agent` en tu cola de aprobaciones. Revisa la configuración del agente propuesto y aprueba o rechaza.

## Configurando Agentes

Edita la configuración de un agente desde la página de detalle del agente:

- **Adapter config** — cambia modelo, plantilla de prompt, directorio de trabajo, variables de entorno
- **Heartbeat settings** — intervalo, enfriamiento, máximo de ejecuciones concurrentes, disparadores de despertar
- **Budget** — límite de gasto mensual

Usa el botón "Test Environment" para validar que la configuración del adapter del agente sea correcta antes de ejecutar.

## Pausando y Reanudando

Pausa un agente para detener temporalmente los heartbeats:

```
POST /api/agents/{agentId}/pause
```

Reanuda para reiniciar:

```
POST /api/agents/{agentId}/resume
```

Los agentes también se pausan automáticamente cuando alcanzan el 100% de su presupuesto mensual.

## Terminando Agentes

La terminación es permanente e irreversible:

```
POST /api/agents/{agentId}/terminate
```

Solo termina agentes que estés seguro de que ya no necesitas. Considera pausar primero.
