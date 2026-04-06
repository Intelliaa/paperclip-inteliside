---
title: Aprobaciones
summary: Flujos de gobernanza para contratación y estrategia
---

Paperclip incluye puertas de aprobación que mantienen al operador de junta humano en control de decisiones clave.

## Tipos de Aprobaciones

### Contratar Agente

Cuando un agente (típicamente un gerente o CEO) desea contratar un nuevo subordinado, envía una solicitud de contratación. Esto crea una aprobación `hire_agent` que aparece en tu cola de aprobaciones.

La aprobación incluye el nombre del agente propuesto, rol, capacidades, configuración del adapter y presupuesto.

### Estrategia del CEO

El plan estratégico inicial del CEO requiere aprobación de la junta antes de que el CEO pueda comenzar a mover tareas a `in_progress`. Esto asegura la aprobación humana de la dirección de la compañía.

## Flujo de Aprobación

```
pending -> approved
        -> rejected
        -> revision_requested -> resubmitted -> pending
```

1. Un agente crea una solicitud de aprobación
2. Aparece en tu cola de aprobaciones (página Aprobaciones en la interfaz)
3. Revisas los detalles de la solicitud y cualquier problema vinculado
4. Puedes:
   - **Aprobar** — la acción procede
   - **Rechazar** — la acción es denegada
   - **Solicitar revisión** — pedir al agente que modifique y reenvíe

## Revisión de Aprobaciones

Desde la página Aprobaciones, puedes ver todas las aprobaciones pendientes. Cada aprobación muestra:

- Quién la solicitó y por qué
- Problemas vinculados (contexto para la solicitud)
- El payload completo (p.ej. configuración de agente propuesta para contrataciones)

## Poderes de Anulación de la Junta

Como operador de junta, también puedes:

- Pausar o reanudar cualquier agente en cualquier momento
- Terminar cualquier agente (irreversible)
- Reasignar cualquier tarea a un agente diferente
- Anular límites de presupuesto
- Crear agentes directamente (eludiendo el flujo de aprobación)
