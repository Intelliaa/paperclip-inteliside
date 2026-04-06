---
created: 2026-03-10
tags:
  - claude-code
  - automatizacion
  - hooks
  - prompts
  - agentes
  - self-healing
type: guia
---

# Claude Code Avanzado — Tips del Podcast "Corres o te Encaramas"

> Clase magistral sobre cómo llevar Claude Code al siguiente nivel de automatización y desarrollo autónomo. Un experto comparte técnicas avanzadas de hooks, self-healing software, doc gardening, evals y orquestación de agentes paralelos.

---

## 1. Ingeniería Inversa sobre la CLI de Claude

**Idea central:** La mejor forma de escribir buenos prompts es estudiar cómo los escribe Anthropic.

- Cada vez que sale una nueva versión del CLI, extraer los **System Prompts** y los **compact prompts** que Anthropic usa internamente
- Basarse en esos patrones para crear `CLAUDE.md` personalizados por proyecto (`CLAUDE.md`, `CLAUDE.improved.md`, etc.)
- Esto garantiza que tu archivo de instrucciones siga los mismos estándares de calidad que usa el equipo de Anthropic

> Ver también: [[Hooks de Claude Code - Referencia Completa]] para entender el sistema sobre el que se construyen estos flujos.

---

## 2. Hooks: Automatización y Seguridad

Los hooks son scripts que se ejecutan antes o después de acciones específicas. Permiten bloquear acciones peligrosas y forzar reglas deterministas sin depender de que el modelo "recuerde" las instrucciones.

### File Size Guard (Pre/PostToolUse)
- Hook que bloquea la creación de archivos con más de **500 líneas**
- Fuerza separación de conceptos y facilita la inferencia del modelo
- Garantiza archivos más mantenibles sin intervención manual

### Pre-tool Use Hook — Seguridad crítica
- Bloquear acciones destructivas antes de que ocurran
- Ejemplo: impedir que Claude corra `terraform apply` que podría borrar bases de datos en producción
- Regla: cualquier operación irreversible debe tener un hook de bloqueo

### Post-tool Use Hook — Validación semántica
- Se ejecuta después de una edición para revisar el contexto completo del archivo
- Verifica reglas semánticas del proyecto (no solo sintaxis)
- Ejemplo: prohibir `window.location.search` en Next.js y forzar `useSearchParams`

> Ver referencia técnica completa: [[Hooks de Claude Code - Referencia Completa]]

---

## 3. Self-Healing Software y Determinismo

**Concepto:** Reducir la dependencia de que el modelo recuerde instrucciones, reemplazándola con validaciones programáticas automáticas.

### Skill Check Server (Stop hook asíncrono)
1. Cuando Claude para (Stop event), un hook asíncrono analiza el **diff** de los cambios
2. Verifica los cambios contra una base de datos de **"skills"** (malas prácticas conocidas)
3. Si detecta una mala práctica, genera automáticamente una **regla determinista** (regex)
4. La regla se agrega a los hooks o al `CLAUDE.md` para que nunca vuelva a ocurrir

### Por qué funciona
- Las instrucciones en `CLAUDE.md` se olvidan o ignoran con contextos largos
- Una regla determinista en un hook **no se puede ignorar** — bloquea la acción directamente
- El sistema se auto-mejora: cada error detectado se convierte en una validación permanente

### Ejemplo práctico
```
Mala práctica detectada: window.location.search en Next.js
→ Se genera regex: /window\.location\.search/
→ Se agrega hook PostToolUse que bloquea cualquier edición que contenga ese patrón
→ Claude recibe feedback: "Usa useSearchParams en su lugar"
```

---

## 4. Doc Gardening — Documentación siempre actualizada

**Problema:** Si la documentación queda obsoleta, el modelo alucina basándose en información incorrecta.

### Cómo implementarlo
1. Crear un prompt específico llamado **"doc gardening"** en el `CLAUDE.md`
2. El prompt instruye a Claude para escanear el proyecto periódicamente
3. Compara archivos de código nuevos/modificados con los `.md` de documentación existentes
4. Sincroniza y actualiza la documentación automáticamente

### Estructura recomendada del CLAUDE.md para doc gardening
- El `CLAUDE.md` debe servir como **brújula central** para los agentes
- Debe reflejar infraestructura, backend y frontend actualizados
- Hooks post-edición que invocan actualización de docs tras generar código nuevo

### Generación determinista de código limpio
- Forzar reglas que prohíban malas prácticas (ej: `any` en TypeScript)
- Código bien estructurado desde el inicio = menos necesidad de documentar workarounds

---

## 5. Sandwich de Contextos — Orquestación de Agentes Paralelos

Técnica de planificación paralela estructurada en tres capas para maximizar velocidad de desarrollo.

```
┌─────────────────────────────────────────────┐
│  CAPA 1 — Scaffolding (Agente líder)        │
│  Prepara entorno, estructura, contexto base │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ↓              ↓              ↓
┌────────┐   ┌─────────┐   ┌──────────┐
│Agente 1│   │Agente 2 │   │Agente N  │
│ Bug 1  │   │Feature A│   │Tests     │
└────────┘   └─────────┘   └──────────┘
    │              │              │
    └──────────────┼──────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  CAPA 3 — Consolidación (Agente final)      │
│  Integra cambios, trazabilidad, tests       │
└─────────────────────────────────────────────┘
```

- **Capa 1 (Pan superior):** Un agente líder hace el scaffolding secuencial — crea estructura y define contexto
- **Capa 2 (Relleno):** 5+ agentes trabajando en paralelo en tareas independientes (bugs, features, tests)
- **Capa 3 (Pan inferior):** Agente final integra, verifica trazabilidad y corre tests

> Ver más sobre orquestación: [[Orquestacion del Flujo de Trabajo - Claude Code]]

---

## 6. Evals — Optimizar el CLAUDE.md con datos

- Crear evaluaciones programáticas **dentro del repo**
- Comparar versiones de `CLAUDE.md` ejecutando tareas específicas contra cada una
- Medir qué versión produce mejores resultados en tareas reales del proyecto
- Iterar hasta tener el `CLAUDE.md` óptimo para tu stack

**Uso más allá del código:**
- Claude Code no es solo para programar — sirve para PPTs, generación de imágenes con skills personalizadas, análisis de documentos

---

## 7. Truco "Try" — Aprender librerías sin leer docs

Flujo para absorber rápidamente una librería nueva:

1. Usar el comando `try` — clona el repositorio de la librería en tu entorno
2. Pedirle a Claude que investigue el código y explique cómo funciona
3. Guardar el conocimiento generado en Obsidian como referencia futura
4. Usar esa nota como contexto en proyectos futuros que usen esa librería

---

## 8. Modelos Locales para Privacidad

- Usar modelos locales pequeños para **tareas repetitivas en bucle** donde la privacidad importa más que la potencia
- Casos de uso: documentos sensibles con restricciones legales (ej: archivos de catastro que no pueden salir de España)
- Evaluar con servidores locales cuando la data no puede enviarse a APIs externas

---

## Conexiones

- [[Hooks de Claude Code - Referencia Completa]]
- [[Orquestacion del Flujo de Trabajo - Claude Code]]
- [[40 Consejos de Claude Code - Basico a Avanzado 2026]]
- [[Guia Completa - Creacion de Skills para Claude]]
- [[Context Engineering/05 - Sistemas de Memoria]]
- [[Base de Conocimiento]]

---

*Creado: 10 Mar 2026 — Fuente: Podcast "Corres o te Encaramas" con experto en Claude Code*
