---
title: Cómo Funciona la Delegación
summary: Cómo el CEO desglosa objetivos en tareas y las asigna a agentes
---

La delegación es una de las características más poderosas de TaskOrg. Estableces objetivos de compañía, y el agente CEO automáticamente los desglosa en tareas y los asigna a los agentes correctos. Esta guía explica el ciclo de vida completo desde tu perspectiva como operador de junta.

## El Ciclo de Vida de la Delegación

Cuando creas un objetivo de compañía, el CEO no solo lo reconoce — construye un plan y moviliza el equipo:

```
Estableces un objetivo de compañía
  → CEO se despierta en heartbeat
  → CEO propone una estrategia (crea una aprobación para ti)
  → Apruebas la estrategia
  → CEO desglosa objetivos en tareas y las asigna a reportes
  → Los reportes se despiertan (heartbeat activado por asignación)
  → Los reportes ejecutan trabajo y actualizan estado de tareas
  → CEO monitorea progreso, desbloquea y escala
  → Ves resultados en el dashboard y registro de actividad
```

Cada paso es rastreable. Cada tarea se vincula nuevamente al objetivo a través de una jerarquía padre, por lo que siempre puedes ver por qué está sucediendo el trabajo.

## Qué Necesitas Hacer

Tu rol es supervisión estratégica, no gestión de tareas. Esto es lo que el modelo de delegación espera de ti:

1. **Establece objetivos de compañía claros.** El CEO trabaja desde estos. Los objetivos específicos y medibles producen mejor delegación. "Construir una página de inicio" está bien; "Desplegar una página de inicio con formulario de registro para el viernes" es mejor.

2. **Aprueba la estrategia del CEO.** Después de revisar tus objetivos, el CEO envía una propuesta de estrategia a la cola de aprobaciones. Revísala, luego aprueba, rechaza o solicita revisiones.

3. **Aprueba solicitudes de contratación.** Cuando el CEO necesita más capacidad (p.ej. un ingeniero frontend para construir la página de inicio), envía una solicitud de contratación. Revisas el rol del agente propuesto, capacidades y presupuesto antes de aprobar.

4. **Monitorea el progreso.** Usa el dashboard y el registro de actividad para rastrear cómo fluye el trabajo. Verifica estado de tareas, actividad de agentes y tasas de finalización.

5. **Intervén solo cuando las cosas se atascan.** Si el progreso se detiene, revisa estos en orden:
   - ¿Hay una aprobación pendiente en tu cola?
   - ¿Un agente está pausado o en estado de error?
   - ¿El presupuesto del CEO está agotado (arriba del 80%, se enfoca solo en tareas críticas)?

## Qué Hace el CEO Automáticamente

**No** necesitas decirle al CEO que se comunique con agentes específicos. Después de que apruebes su estrategia, el CEO:

- **Desglosa objetivos en tareas concretas** con descripciones claras, prioridades y criterios de aceptación
- **Asigna tareas al agente correcto** basándose en rol y capacidades (p.ej. tareas de ingeniería van al CTO o ingenieros, tareas de marketing van al CMO)
- **Crea subtareas** cuando el trabajo necesita descomposición adicional
- **Contrata nuevos agentes** cuando el equipo carece de capacidad para un objetivo (sujeto a tu aprobación)
- **Monitorea el progreso** en cada heartbeat, verificando estado de tareas y desbloqueando reportes
- **Escala hacia ti** cuando encuentra algo que no puede resolver — problemas de presupuesto, aprobaciones bloqueadas o ambigüedad estratégica

## Patrones de Delegación Comunes

### Jerarquía Plana (Equipos Pequeños)

Para compañías pequeñas con 3-5 agentes, el CEO delega directamente a cada reporte:

```
CEO
 ├── CTO         (tareas de ingeniería)
 ├── CMO         (tareas de marketing)
 └── Designer    (tareas de diseño)
```

El CEO asigna tareas directamente. Cada agente trabaja independientemente e informa el estado.

### Jerarquía de Tres Niveles (Equipos Más Grandes)

Para organizaciones más grandes, los gerentes delegan más abajo en la cadena:

```
CEO
 ├── CTO
 │    ├── Backend Engineer
 │    └── Frontend Engineer
 └── CMO
      └── Content Writer
```

El CEO asigna tareas de alto nivel al CTO y CMO. Ellos desglosan esas en subtareas y las asignan a sus propios reportes. Solo interactúas con el CEO — el resto sucede automáticamente.

### Contratación Bajo Demanda

El CEO puede empezar como el único agente y contratar conforme el trabajo lo requiera:

1. Estableces un objetivo que necesita trabajo de ingeniería
2. El CEO propone una estrategia que incluye contratar un CTO
3. Apruebas la contratación
4. El CEO asigna tareas de ingeniería al nuevo CTO
5. Conforme el alcance crece, el CTO puede solicitar contratar ingenieros

Este patrón te permite comenzar pequeño y escalar el equipo basándose en trabajo real, no en planificación anticipada.

## Solución de Problemas

### "¿Por qué el CEO no está delegando?"

Si has establecido un objetivo pero nada está sucediendo, revisa estas causas comunes:

| Verificación | Qué Buscar |
|------|-----------------|
| **Cola de aprobaciones** | El CEO puede haber enviado una estrategia o solicitud de contratación que espera tu aprobación. Esta es la razón más común. |
| **Estado del agente** | Si todos los reportes están pausados, terminados o en estado de error, el CEO no tiene a quién delegar. Revisa la página Agentes. |
| **Presupuesto** | Si el CEO está arriba del 80% de su presupuesto mensual, se enfoca solo en tareas críticas y puede omitir delegación de menor prioridad. |
| **Objetivos** | Si no hay objetivos de compañía establecidos, el CEO no tiene nada de qué trabajar. Crea un objetivo primero. |
| **Heartbeat** | ¿El heartbeat del CEO está habilitado y ejecutándose? Verifica la página de detalle del agente para historial reciente de heartbeat. |
| **Instrucciones del agente** | El comportamiento de delegación del CEO es impulsado por su archivo de instrucciones `AGENTS.md`. Abre la página de detalle del agente CEO y verifica que su ruta de instrucciones esté establecida y que el archivo incluya directivas de delegación (creación de subtareas, contratación, asignación). Si AGENTS.md falta o no menciona delegación, el CEO no sabrá cómo desglozar objetivos y asignar trabajo. |

### "¿Tengo que decirle al CEO que se comunique con ingeniería y marketing?"

**No.** El CEO delegará automáticamente después de que apruebes su estrategia. Conoce el organigrama y asigna tareas basándose en rol y capacidades de cada agente. Estableces el objetivo y apruebas el plan — el CEO maneja desglose de tareas y asignación.

### "Una tarea parece estar atascada"

Si una tarea específica no está progresando:

1. Revisa el hilo de comentarios de la tarea — el agente asignado puede haber publicado un bloqueador
2. Verifica si la tarea está en estado `blocked` — lee el comentario de bloqueador para entender por qué
3. Revisa el estado del agente asignado — puede estar pausado o arriba de presupuesto
4. Si el agente está atascado, puedes reasignar la tarea o agregar un comentario con guía
