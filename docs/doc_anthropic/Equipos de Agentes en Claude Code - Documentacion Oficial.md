---
created: 2026-03-11
tags:
  - claude-code
  - agent-teams
  - documentacion-oficial
  - referencia
  - experimental
type: guia
source: https://code.claude.com/docs
---

# Equipos de Agentes en Claude Code - Documentacion Oficial

> Documentacion oficial de Anthropic sobre como orquestar equipos de sesiones de Claude Code trabajando juntas, con tareas compartidas, mensajeria entre agentes y gestion centralizada. Fuente: code.claude.com/docs

**Temas Clave:** Agent Teams • Lider • Companeros de Equipo • Lista de Tareas Compartida • Mensajeria • Coordinacion Paralela • tmux

**Estado:** Experimental — deshabilitado por defecto

**Notas complementarias:** [[Subagentes de Claude Code - Documentacion Oficial]] | [[Skills de Claude Code - Documentacion Oficial]]

---

## Documentation Index

Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
Use this file to discover all available pages before exploring further.

---

## Que son los Equipos de Agentes

Los equipos de agentes permiten coordinar multiples instancias de Claude Code trabajando juntas. Una sesion actua como **lider del equipo**, coordinando trabajo, asignando tareas y sintetizando resultados. Los **companeros de equipo** trabajan de forma independiente, cada uno en su propia ventana de contexto, y se comunican directamente entre si.

A diferencia de los subagentes (que se ejecutan dentro de una unica sesion y solo informan al agente principal), los companeros de equipo pueden interactuar directamente entre si sin pasar por el lider.

---

## Habilitar (Experimental)

Deshabilitado por defecto. Habilitar con:

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

O como variable de entorno: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## Subagentes vs Equipos de Agentes

|  | Subagentes | Equipos de Agentes |
|---|---|---|
| **Contexto** | Ventana propia; resultados regresan al llamador | Ventana propia; completamente independiente |
| **Comunicacion** | Informar solo al agente principal | Companeros se envian mensajes directamente |
| **Coordinacion** | El agente principal gestiona todo | Lista de tareas compartida con auto-coordinacion |
| **Mejor para** | Tareas enfocadas donde solo importa el resultado | Trabajo complejo que requiere discusion y colaboracion |
| **Costo de tokens** | Menor: resultados resumidos al contexto principal | Mayor: cada companero es una instancia separada |

**Regla:** Usar subagentes cuando necesites trabajadores rapidos que informen de vuelta. Usar equipos cuando los companeros necesiten compartir hallazgos, desafiarse y coordinarse.

---

## Cuando Usar Equipos de Agentes

Casos de uso mas fuertes:

- **Investigacion y revision** — multiples companeros investigan diferentes aspectos simultaneamente
- **Nuevos modulos o features** — cada companero posee una pieza separada sin pisarse
- **Depuracion con hipotesis competidoras** — prueban diferentes teorias en paralelo
- **Coordinacion entre capas** — frontend, backend y tests, cada uno con un companero diferente

**Cuando NO usar:** Tareas secuenciales, ediciones del mismo archivo, trabajo con muchas dependencias. En esos casos, una sola sesion o subagentes son mas efectivos.

---

## Arquitectura

| Componente | Rol |
|---|---|
| **Lider del equipo** | Sesion principal que crea el equipo, genera companeros y coordina |
| **Companeros de equipo** | Instancias separadas de Claude Code que trabajan en tareas asignadas |
| **Lista de tareas** | Lista compartida de items que los companeros reclaman y completan |
| **Buzon** | Sistema de mensajeria para comunicacion entre agentes |

Almacenamiento local:
- Configuracion del equipo: `~/.claude/teams/{team-name}/config.json`
- Lista de tareas: `~/.claude/tasks/{team-name}/`

La config contiene un array `members` con nombre, agent ID y tipo de cada companero.

---

## Iniciar un Equipo

Pedirlo en lenguaje natural:

```
Estoy disenando una herramienta CLI que ayuda a rastrear TODOs en codigo.
Crea un equipo de agentes para explorar desde diferentes angulos: un
companero en UX, uno en arquitectura tecnica, uno jugando abogado del diablo.
```

Claude crea el equipo, genera companeros, los tiene explorar el problema, sintetiza hallazgos y limpia al terminar.

### Especificar companeros y modelos

```
Crea un equipo con 4 companeros para refactorizar estos modulos en paralelo.
Usa Sonnet para cada companero.
```

---

## Modos de Visualizacion

| Modo | Descripcion | Requisitos |
|---|---|---|
| **En proceso** (default) | Todos los companeros en tu terminal principal. Shift+Down para ciclar | Cualquier terminal |
| **Paneles divididos** | Cada companero en su propio panel visible simultaneamente | tmux o iTerm2 |

Configurar en settings.json:

```json
{
  "teammateMode": "in-process"  // o "tmux" o "auto" (default)
}
```

Flag para una sesion: `claude --teammate-mode in-process`

`"auto"` usa paneles divididos si ya estas en tmux, sino en proceso.

### Requisitos para paneles divididos

- **tmux**: instalar via gestor de paquetes del sistema
- **iTerm2**: instalar CLI `it2` + habilitar Python API en Settings > General > Magic

> tmux tiene limitaciones en ciertos OS. `tmux -CC` en iTerm2 es la opcion sugerida.

---

## Interaccion con Companeros

### Hablar directamente

- **Modo en proceso:** Shift+Down para ciclar, escribir para enviar mensaje. Enter para ver sesion, Escape para interrumpir turno. Ctrl+T para alternar lista de tareas
- **Modo paneles:** Click en el panel del companero

### Requerir aprobacion de plan

```
Genera un companero arquitecto para refactorizar el modulo de auth.
Requiere aprobacion de plan antes de que haga cambios.
```

El companero trabaja en modo plan (solo lectura) hasta que el lider apruebe. Si se rechaza, revisa y reenvia.

---

## Gestion de Tareas

La lista de tareas compartida coordina todo el equipo. Estados: **pendiente**, **en progreso**, **completada**. Las tareas pueden tener dependencias.

### Asignacion

- **Lider asigna:** decirle que tarea dar a quien
- **Auto-reclamar:** companeros toman la siguiente tarea sin asignar al terminar

El reclamo usa bloqueo de archivos para prevenir condiciones de carrera.

Las dependencias se gestionan automaticamente — cuando una tarea se completa, las tareas bloqueadas se desbloquean.

---

## Permisos

Los companeros **heredan** la config de permisos del lider. Si el lider usa `--dangerously-skip-permissions`, todos los companeros tambien. Se puede cambiar modos individuales despues de generar, pero no al momento de la generacion.

---

## Contexto y Comunicacion

Cada companero tiene su propia ventana de contexto. Al generarse, carga el mismo contexto de proyecto que una sesion regular (CLAUDE.md, MCP servers, skills) + la indicacion del lider. **No hereda historial de conversacion.**

### Mecanismos de comunicacion

- **Entrega automatica de mensajes** — se entregan sin polling
- **Notificaciones de inactividad** — al detenerse, notifica al lider automaticamente
- **Lista de tareas compartida** — todos ven estado y reclaman trabajo

### Tipos de mensaje

- **message** — enviar a un companero especifico
- **broadcast** — enviar a todos (usar con moderacion, costos escalan)

---

## Hooks para Equipos

| Evento | Cuando se dispara | Uso |
|---|---|---|
| `TeammateIdle` | Companero esta a punto de quedarse inactivo | Exit code 2 para enviar feedback y mantenerlo trabajando |
| `TaskCompleted` | Tarea siendo marcada como completada | Exit code 2 para prevenir finalizacion y enviar feedback |

---

## Apagado y Limpieza

### Apagar companero

```
Pidele al companero investigador que se apague
```

El companero puede aprobar (sale) o rechazar con explicacion. Terminan su solicitud/herramienta actual antes de apagarse.

### Limpiar equipo

```
Limpia el equipo
```

**Siempre usar el lider** para limpiar. Verifica que no haya companeros activos (apagarlos primero). Los companeros no deben ejecutar limpieza.

---

## Mejores Practicas

### Tamano de equipo

- **3-5 companeros** para la mayoria de flujos de trabajo
- **5-6 tareas por companero** los mantiene productivos
- 15 tareas independientes → 3 companeros es buen punto de partida
- Tres companeros enfocados a menudo superan a cinco dispersos

### Tamano de tareas

- **Muy pequenas:** sobrecarga de coordinacion excede beneficio
- **Muy grandes:** trabajan demasiado sin check-ins, riesgo de esfuerzo desperdiciado
- **Ideal:** unidades auto-contenidas con entregable claro (funcion, archivo de test, revision)

### Dar contexto suficiente

Los companeros cargan CLAUDE.md, MCP, skills automaticamente pero **no heredan historial**. Incluir detalles especificos en la indicacion de generacion.

### Evitar conflictos de archivos

Dos companeros editando el mismo archivo = sobrescrituras. Dividir trabajo para que cada uno posea archivos diferentes.

### Monitorear y dirigir

Verificar progreso, redirigir enfoques que no funcionen, sintetizar hallazgos. No dejar equipos sin supervision demasiado tiempo.

### Esperar a companeros

Si el lider empieza a implementar en vez de delegar:

```
Espera a que tus companeros completen sus tareas antes de proceder
```

### Empezar con investigacion y revision

Si eres nuevo en equipos, comenzar con tareas de limites claros que no requieran escribir codigo (revisar PR, investigar libreria, investigar bug).

---

## Ejemplos

### Revision de codigo paralela

```
Crea un equipo para revisar la PR #142. Genera tres revisores:
- Uno enfocado en seguridad
- Uno verificando rendimiento
- Uno validando cobertura de tests
Que cada uno revise e informe hallazgos.
```

### Hipotesis competidoras

```
Los usuarios reportan que la app se cierra despues de un mensaje.
Genera 5 companeros para investigar diferentes hipotesis. Haz que se
hablen entre si para intentar refutar las teorias de cada uno,
como un debate cientifico.
```

La estructura de debate combate el anclaje: multiples investigadores refutandose mutuamente hacen que la teoria sobreviviente sea mas probable que sea la causa raiz real.

---

## Limitaciones Conocidas

- **Sin reanudacion de sesion con companeros en proceso** — `/resume` y `/rewind` no restauran companeros
- **Estado de tarea puede retrasarse** — companeros a veces no marcan tareas como completadas
- **Apagado lento** — terminan solicitud actual antes de apagarse
- **Un equipo por sesion** — limpiar antes de crear otro
- **Sin equipos anidados** — companeros no pueden generar equipos propios
- **Lider fijo** — no se puede transferir liderazgo
- **Permisos al generar** — todos heredan del lider, cambiar individualmente despues
- **Paneles divididos** — no compatible con terminal de VS Code, Windows Terminal o Ghostty

---

## Troubleshooting

| Problema | Solucion |
|---|---|
| Companeros no aparecen | Shift+Down para buscarlos; verificar que tarea justifica equipo; verificar `which tmux` |
| Demasiadas solicitudes de permiso | Pre-aprobar operaciones comunes en config de permisos antes de generar |
| Companeros se detienen en errores | Verificar output, dar instrucciones adicionales o generar reemplazo |
| Lider se apaga antes de tiempo | Decirle que espere a que companeros terminen |
| Sesiones tmux huerfanas | `tmux ls` y `tmux kill-session -t <name>` |

---

## Conexiones

- [[Subagentes de Claude Code - Documentacion Oficial]] — Subagentes individuales (alternativa mas ligera)
- [[Skills de Claude Code - Documentacion Oficial]] — Skills que companeros cargan automaticamente
- [[Hooks de Claude Code - Referencia Completa]] — Hooks incluyendo TeammateIdle y TaskCompleted
- [[Orquestacion del Flujo de Trabajo - Claude Code]] — Workflows y coordinacion
- [[40 Consejos de Claude Code - Basico a Avanzado 2026]] — Tips generales
- [[04 - Patrones Multi-Agente]] — Context engineering con multiples agentes
- [[05 - Sistemas de Memoria]] — Sistemas de memoria para equipos

---

*Creado: 11 Mar 2026*
*Fuente: Documentacion oficial de Anthropic — code.claude.com/docs*
