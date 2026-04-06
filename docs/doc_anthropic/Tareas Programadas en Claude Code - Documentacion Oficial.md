---
created: 2026-03-21
tags:
  - claude-code
  - automatizacion
  - tareas-programadas
  - cron
type: guia
source: https://code.claude.com/docs
---

# Tareas Programadas en Claude Code — Documentacion Oficial

> Referencia completa sobre como ejecutar prompts de forma programada usando /loop y las herramientas CronCreate/CronList/CronDelete dentro de una sesion de Claude Code.

---

## Requisitos

- Claude Code v2.1.72 o superior
- Verificar version con `claude --version`

---

## Conceptos clave

Las tareas programadas permiten que Claude re-ejecute un prompt automaticamente en un intervalo. Casos de uso:

- Monitorear un deployment
- Vigilar un PR
- Verificar un build de larga duracion
- Recordatorios puntuales

**Son session-scoped**: viven en el proceso actual de Claude Code y desaparecen al salir. Para scheduling persistente usar [[Agent SDK y Uso Programatico de Claude Code - Documentacion Oficial|GitHub Actions]] o Desktop scheduled tasks.

---

## /loop — Forma rapida

El skill `/loop` es la manera mas rapida de programar una tarea recurrente:

```
/loop 5m check if the deployment finished and tell me what happened
```

Claude parsea el intervalo, lo convierte a cron, programa el job y confirma.

### Sintaxis de intervalo

| Forma | Ejemplo | Intervalo parseado |
|---|---|---|
| Token al inicio | `/loop 30m check the build` | cada 30 minutos |
| Clausula `every` al final | `/loop check the build every 2 hours` | cada 2 horas |
| Sin intervalo | `/loop check the build` | default: cada 10 minutos |

**Unidades soportadas**: `s` (segundos), `m` (minutos), `h` (horas), `d` (dias). Los segundos se redondean al minuto mas cercano.

### Loop sobre otro comando

El prompt programado puede ser otro skill o comando:

```
/loop 20m /review-pr 1234
```

---

## Recordatorios puntuales (one-shot)

Para recordatorios de una sola vez, usar lenguaje natural:

```
remind me at 3pm to push the release branch
```

```
in 45 minutes, check whether the integration tests passed
```

Claude calcula el momento exacto con una expresion cron y confirma cuando se disparara.

---

## Herramientas subyacentes

| Herramienta | Proposito |
|---|---|
| `CronCreate` | Programar nueva tarea. Acepta expresion cron de 5 campos, prompt, y si es recurrente o one-shot |
| `CronList` | Listar todas las tareas con IDs, schedules y prompts |
| `CronDelete` | Cancelar tarea por ID |

Cada tarea tiene un ID de 8 caracteres. Maximo 50 tareas por sesion.

### Gestionar tareas en lenguaje natural

```
what scheduled tasks do I have?
cancel the deploy check job
```

---

## Expresiones cron — Referencia

Formato estandar de 5 campos: `minuto hora dia-mes mes dia-semana`

Todos los campos soportan: wildcards (`*`), valores unicos (`5`), steps (`*/15`), rangos (`1-5`), listas (`1,15,30`).

| Expresion | Significado |
|---|---|
| `*/5 * * * *` | Cada 5 minutos |
| `0 * * * *` | Cada hora en punto |
| `7 * * * *` | Cada hora al minuto 7 |
| `0 9 * * *` | Todos los dias a las 9am local |
| `0 9 * * 1-5` | Lunes a viernes a las 9am local |
| `30 14 15 3 *` | 15 de marzo a las 2:30pm local |

**Dia de la semana**: `0` o `7` = Domingo, `1-6` = Lunes a Sabado.

**NO soportado**: `L`, `W`, `?`, ni aliases como `MON` o `JAN`.

Cuando ambos dia-mes y dia-semana estan restringidos, una fecha matchea si **cualquiera** de los dos campos coincide (semantica vixie-cron).

---

## Comportamiento en runtime

### Ejecucion

- El scheduler verifica cada segundo si hay tareas pendientes
- Las tareas se encolan con **prioridad baja**
- Solo se disparan cuando Claude esta **idle** (entre turnos del usuario)
- Si Claude esta ocupado, la tarea espera hasta que termine el turno actual
- Todas las horas se interpretan en **timezone local** del sistema

### Jitter (offset aleatorio)

Para evitar que todas las sesiones golpeen la API al mismo tiempo:

- **Tareas recurrentes**: se disparan hasta 10% de su periodo tarde, max 15 minutos
- **Tareas one-shot**: si estan programadas en :00 o :30, se disparan hasta 90 segundos antes

El offset se deriva del task ID (deterministico). Para evitar jitter, usar minutos que no sean :00 o :30 (ej: `3 9 * * *` en vez de `0 9 * * *`).

### Expiracion automatica

Las tareas recurrentes se auto-eliminan despues de **3 dias** (la documentacion oficial actualizo de 7 a 3 dias). Se disparan una ultima vez y luego se borran.

Para tareas que necesiten durar mas: cancelar y recrear antes de que expiren, o usar Desktop scheduled tasks para scheduling durable.

---

## Desactivar tareas programadas

Variable de entorno `CLAUDE_CODE_DISABLE_CRON=1` desactiva el scheduler completamente. Las herramientas cron y `/loop` quedan no disponibles.

---

## Limitaciones importantes

1. **Solo mientras Claude corre**: cerrar la terminal o salir de la sesion cancela todo
2. **Sin catch-up**: si se pierde un disparo porque Claude estaba ocupado, se ejecuta una vez al quedar idle, no una vez por cada intervalo perdido
3. **Sin persistencia**: reiniciar Claude Code limpia todas las tareas
4. **Session-scoped**: no sobreviven reinicios

---

## Alternativas para scheduling persistente

- **GitHub Actions**: workflow con trigger `schedule` para automatizacion sin terminal
- **Desktop scheduled tasks**: configuracion grafica para scheduling durable
- **Channels**: para reaccionar a eventos en tiempo real (CI push, webhooks) en vez de polling

---

## Conexiones

- [[Skills de Claude Code - Documentacion Oficial]] — /loop es un bundled skill
- [[Hooks de Claude Code - Referencia Completa]] — Hooks complementan tareas programadas
- [[Flujos de Trabajo Comunes en Claude Code - Documentacion Oficial]] — Flujos que pueden automatizarse
- [[Base de Conocimiento]] — Indice de la base de conocimiento

---

*Creado: 21 Mar 2026*
