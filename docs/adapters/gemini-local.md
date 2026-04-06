---
title: Gemini Local
summary: Configuración del adapter local de Gemini CLI
---

El adapter `gemini_local` ejecuta el CLI de Gemini de Google localmente. Soporta persistencia de sesión con `--resume`, inyección de skills, y análisis de salida `stream-json` estructurado.

## Requisitos Previos

- CLI de Gemini instalado (comando `gemini` disponible)
- `GEMINI_API_KEY` o `GOOGLE_API_KEY` establecido, o autenticación local de Gemini CLI configurada

## Campos de Configuración

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `cwd` | string | Sí | Directorio de trabajo para el proceso del agente (ruta absoluta; se crea automáticamente si falta cuando los permisos lo permiten) |
| `model` | string | No | Modelo Gemini a usar. Predeterminado a `auto`. |
| `promptTemplate` | string | No | Prompt usado para todas las ejecuciones |
| `instructionsFilePath` | string | No | Archivo de instrucciones Markdown antepuesto al prompt |
| `env` | object | No | Variables de entorno (soporta referencias secretas) |
| `timeoutSec` | number | No | Timeout del proceso (0 = sin timeout) |
| `graceSec` | number | No | Período de gracia antes de force-kill |
| `yolo` | boolean | No | Pasa `--approval-mode yolo` para operación desatendida |

## Persistencia de Sesión

El adapter persiste los IDs de sesión de Gemini entre heartbeats. En el próximo despertar, reanuda la conversación existente con `--resume` para que el agente reetenga contexto.

La reanudación de sesión es sensible a cwd: si el directorio de trabajo cambió desde la última ejecución, se inicia una sesión nueva en su lugar.

Si la reanudación falla con un error de sesión desconocido, el adapter automáticamente reintenta con una sesión nueva.

## Inyección de Skills

El adapter crea symlinks de skills de Paperclip en el directorio global de skills de Gemini (`~/.gemini/skills`). Los skills existentes del usuario no se sobrescriben.

## Prueba del Entorno

Usa el botón "Test Environment" en la UI para validar la configuración del adapter. Verifica:

- CLI de Gemini está instalado y accesible
- El directorio de trabajo es absoluto y está disponible (se crea automáticamente si falta y está permitido)
- Pistas de clave API/autenticación (`GEMINI_API_KEY` o `GOOGLE_API_KEY`)
- Una prueba viva de hello (`gemini --output-format json "Respond with hello."`) para verificar la disponibilidad del CLI
