# Guía de Runtime del Agente

Estado: Guía dirigida al usuario
Última actualización: 2026-03-26
Audiencia: Operadores que configuren y ejecuten agentes en TaskOrg

## 1. Qué hace este sistema

Los agentes en TaskOrg no se ejecutan continuamente.  
Se ejecutan en **heartbeats**: ventanas de ejecución cortas activadas por un despertar.

Cada heartbeat:

1. Inicia el adapter del agente configurado (por ejemplo, Claude CLI o Codex CLI)
2. Le da el prompt/contexto actual
3. Lo deja trabajar hasta que salga, agote el tiempo o sea cancelado
4. Almacena resultados (estado, uso de tokens, errores, logs)
5. Actualiza la interfaz en vivo

## 2. Cuándo un agente se despierta

Un agente puede ser despertado de cuatro formas:

- `timer`: intervalo programado (por ejemplo cada 5 minutos)
- `assignment`: cuando trabajo es asignado/checkeado al agente
- `on_demand`: despertar manual (botón/API)
- `automation`: despertar activado por el sistema para automaciones futuras

Si un agente ya está ejecutándose, nuevos despertares se fusionan (coalescen) en lugar de lanzar ejecuciones duplicadas.

## 3. Qué configurar por agente

## 3.1 Elección del Adapter

Adapters incorporados:

- `claude_local`: ejecuta tu CLI `claude` local
- `codex_local`: ejecuta tu CLI `codex` local
- `opencode_local`: ejecuta tu CLI `opencode` local
- `cursor`: ejecuta Cursor en modo background
- `pi_local`: ejecuta un agente Pi incr ustado localmente
- `hermes_local`: ejecuta tu CLI `hermes` local (`hermes-taskorg-adapter`)
- `openclaw_gateway`: se conecta a un endpoint de gateway OpenClaw
- `process`: adapter genérico de comandos shell
- `http`: llama un endpoint HTTP externo

Adapters de plugins externos (instala vía el administrador de adapters o API):

- `droid_local`: ejecuta tu CLI Factory Droid local (`@henkey/droid-taskorg-adapter`)

Para adapters de CLI locales (`claude_local`, `codex_local`, `opencode_local`, `hermes_local`, `droid_local`), TaskOrg asume que el CLI ya está instalado y autenticado en la máquina host.

## 3.2 Comportamiento de Runtime

En la configuración de runtime del agente, configura la política de heartbeat:

- `enabled`: permitir heartbeats programados
- `intervalSec`: intervalo del timer (0 = deshabilitado)
- `wakeOnAssignment`: despertar cuando se asigna trabajo
- `wakeOnOnDemand`: permitir despertares bajo demanda estilo ping
- `wakeOnAutomation`: permitir despertares de automatización del sistema

## 3.3 Directorio de trabajo y límites de ejecución

Para adapters locales, establece:

- `cwd` (directorio de trabajo)
- `timeoutSec` (máximo runtime por heartbeat)
- `graceSec` (tiempo antes de matar forzadamente después de timeout/cancelación)
- variables env opcionales y argumentos CLI extra
- usa **Test environment** en la configuración del agente para ejecutar diagnósticos específicos del adapter antes de guardar

## 3.4 Plantillas de Prompt

Puedes establecer:

- `promptTemplate`: usado para cada ejecución (primera ejecución y sesiones reanudadas)

Las plantillas soportan variables como `{{agent.id}}`, `{{agent.name}}`, y valores de contexto de ejecución.

> **Nota:** `bootstrapPromptTemplate` está deprecado y no debe usarse para nuevos agentes. Las configuraciones existentes que lo usan continuarán funcionando pero deberían migrarse al sistema de bundle de instrucciones gestionado.

## 4. Comportamiento de Reanudación de Sesión

TaskOrg almacena IDs de sesión para adapters reanudables.

- El próximo heartbeat reutiliza la sesión guardada automáticamente.
- Esto proporciona continuidad entre heartbeats.
- Puedes reiniciar una sesión si el contexto se vuelve obsoleto o confuso.

Usa reinicio de sesión cuando:

- hayas cambiado significativamente la estrategia de prompt
- el agente esté atrapado en un mal bucle
- quieras un reinicio limpio

## 5. Logs, estado e historial de ejecución

Para cada ejecución de heartbeat obtienes:

- estado de ejecución (`queued`, `running`, `succeeded`, `failed`, `timed_out`, `cancelled`)
- texto de error y fragmentos de stderr/stdout
- uso de tokens/costo cuando está disponible del adapter
- logs completos (almacenados fuera de las filas de ejecución principal, optimizados para salida grande)

En configuraciones local/dev, los logs completos se almacenan en disco bajo la ruta de run-log configurada.

## 6. Actualizaciones en vivo en la UI

TaskOrg empuja actualizaciones de runtime/actividad al navegador en tiempo real.

Deberías ver cambios en vivo para:

- estado del agente
- estado de ejecución de heartbeat
- actualizaciones de tarea/actividad causadas por trabajo del agente
- paneles de dashboard/costo/actividad según sea relevante

Si la conexión se cae, la UI se reconecta automáticamente.

## 7. Patrones Operacionales Comunes

## 7.1 Bucle autónomo simple

1. Habilita despertares por timer (por ejemplo cada 300s)
2. Mantén despertares por asignación activados
3. Usa una plantilla de prompt enfocada
4. Observa los logs de ejecución y ajusta prompt/config con el tiempo

## 7.2 Bucle impulsado por eventos (menos polling constante)

1. Deshabilita timer o establece un intervalo largo
2. Mantén wake-on-assignment habilitado
3. Usa despertares bajo demanda para nudos manuales

## 7.3 Bucle prioritario en seguridad

1. Timeout corto
2. Prompt conservador
3. Monitorea errores + cancela rápidamente cuando sea necesario
4. Reinicia sesiones cuando aparezca divergencia

## 8. Solución de Problemas

Si las ejecuciones fallan repetidamente:

1. Verifica disponibilidad de comando adapter (p.ej. `claude`/`codex`/`opencode`/`hermes` instalado e iniciado sesión).
2. Verifica que `cwd` exista y sea accesible.
3. Inspecciona error de ejecución + fragmento de stderr, luego log completo.
4. Confirma que timeout no sea demasiado bajo.
5. Reinicia sesión e intenta de nuevo.
6. Pausa agente si está causando actualizaciones malas repetidas.

Causas típicas de fallo:

- CLI no instalado/autenticado
- directorio de trabajo incorrecto
- argumentos/env del adapter malformados
- prompt demasiado amplio o restricciones faltantes
- timeout de proceso

Nota específica de Claude:

- Si `ANTHROPIC_API_KEY` está configurada en env del adapter o entorno host, Claude usa autenticación por clave API en lugar de login de suscripción. TaskOrg lo muestra como una advertencia en tests de entorno, no como un error duro.

## 9. Notas de Seguridad y Riesgo

Los adapters CLI locales se ejecutan sin sandbox en la máquina host.

Eso significa:

- las instrucciones de prompt importan
- las credenciales configuradas/variables env son sensibles
- los permisos del directorio de trabajo importan

Comienza con privilegios mínimos donde sea posible, y evita exponer secretos en prompts reutilizables amplios a menos que sea intencionalmente requerido.

## 10. Lista de Verificación de Configuración Mínima

1. Elige adapter (p.ej. `claude_local`, `codex_local`, `opencode_local`, `hermes_local`, `cursor`, u `openclaw_gateway`). Los plugins externos como `droid_local` también están disponibles vía el administrador de adapters.
2. Establece `cwd` al workspace de destino (para adapters locales).
3. Opcionalmente agrega una plantilla de prompt (`promptTemplate`) o usa el bundle de instrucciones gestionado.
4. Configura la política de heartbeat (despertares por timer y/o asignación).
5. Activa un despertar manual.
6. Confirma que la ejecución tiene éxito y que el uso de sesión/tokens se registra.
7. Observa actualizaciones en vivo e itera prompt/config.
