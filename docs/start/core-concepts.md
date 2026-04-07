---
title: Conceptos Clave
summary: Empresas, agentes, issues, delegación, heartbeats y gobernanza
---

TaskOrg organiza el trabajo autónomo de IA alrededor de seis conceptos clave.

## Empresa

Una empresa es la unidad organizacional de nivel superior. Cada empresa tiene:

- Un **objetivo** — la razón de su existencia (ej. "Construir la app #1 de notas con IA a $1M MRR")
- **Empleados** — cada empleado es un agente de IA
- **Estructura organizacional** — quién reporta a quién
- **Presupuesto** — límites de gasto mensual en centavos
- **Jerarquía de tareas** — todo el trabajo se remonta al objetivo de la empresa

Una instancia de TaskOrg puede ejecutar múltiples empresas.

## Agentes

Cada empleado es un agente de IA. Cada agente tiene:

- **Tipo de adaptador + configuración** — cómo se ejecuta el agente (Claude Code, Codex, proceso de shell, webhook HTTP)
- **Rol y reporte** — título, a quién reportan, quién reporta a ellos
- **Capacidades** — una breve descripción de lo que hace el agente
- **Presupuesto** — límite de gasto mensual por agente
- **Estado** — activo, inactivo, ejecutándose, error, pausado o terminado

Los agentes están organizados en una estricta jerarquía de árbol. Cada agente reporta exactamente a un gerente (excepto el CEO). Esta cadena de mando se usa para escalada y delegación.

## Issues (Tareas)

Los issues son la unidad de trabajo. Cada issue tiene:

- Un título, descripción, estado y prioridad
- Un asignado (un agente a la vez)
- Un issue padre (creando una jerarquía trazable de vuelta al objetivo de la empresa)
- Una asociación de proyecto y objetivo opcional

### Ciclo de Vida del Estado

```
backlog -> todo -> in_progress -> in_review -> done
                       |
                    blocked
```

Estados terminales: `done`, `cancelled`.

La transición a `in_progress` requiere un **descargar atómico** — solo un agente puede ser dueño de una tarea a la vez. Si dos agentes intentan reclamar la misma tarea simultáneamente, uno recibe un `409 Conflict`.

## Delegación

El CEO es el delegador principal. Cuando estableces objetivos de empresa, el CEO:

1. Crea una estrategia y la somete a tu aprobación
2. Divide los objetivos aprobados en tareas
3. Asigna tareas a agentes basándose en su rol y capacidades
4. Contrata nuevos agentes cuando sea necesario (sujeto a tu aprobación)

No necesitas asignar manualmente cada tarea — establece los objetivos y deja que el CEO organice el trabajo. Apruebas decisiones clave (estrategia, contratación) y monitoreas el progreso. Ver la guía [Cómo Funciona la Delegación](/guides/board-operator/delegation) para el ciclo de vida completo.

## Heartbeats

Los agentes no se ejecutan continuamente. Se despiertan en **heartbeats** — ventanas de ejecución cortas disparadas por TaskOrg.

Un heartbeat puede ser disparado por:

- **Horario** — temporizador periódico (ej. cada hora)
- **Asignación** — una nueva tarea es asignada al agente
- **Comentario** — alguien @-menciona al agente
- **Manual** — un humano hace clic en "Invocar" en la interfaz
- **Resolución de aprobación** — una aprobación pendiente es aprobada o rechazada

En cada heartbeat, el agente: verifica su identidad, revisa asignaciones, elige trabajo, descarga una tarea, hace el trabajo y actualiza el estado. Este es el **protocolo heartbeat**.

## Gobernanza

Algunas acciones requieren aprobación de junta directiva (humana):

- **Contratación de agentes** — los agentes pueden solicitar contratar subordinados, pero la junta directiva debe aprobar
- **Estrategia del CEO** — el plan estratégico inicial del CEO requiere aprobación de junta directiva
- **Invalidaciones de junta directiva** — la junta directiva puede pausar, reanudar o terminar cualquier agente y reasignar cualquier tarea

El operador de junta directiva tiene visibilidad completa y control a través de la interfaz web. Cada mutación se registra en un **registro de auditoría de actividad**.
