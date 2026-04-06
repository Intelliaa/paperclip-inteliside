---
name: pr-report
description: >
  Revisar un pull request o contribución en profundidad, explicarlo estilo tutorial para
  un mantenedor y producir un artefacto de reporte pulido como HTML o Markdown.
  Usar cuando se pida analizar un PR, explicar las decisiones de diseño de un
  contribuidor, compararlo con sistemas similares o preparar una recomendación de merge.
---

# Skill de Reporte de PR

Producir una revisión de nivel mantenedor de un PR, rama o contribución grande.

Postura por defecto:

- entender el cambio antes de juzgarlo
- explicar el sistema tal como fue construido, no solo el diff
- separar problemas arquitectónicos de objeciones de alcance de producto
- hacer una recomendación concreta, no una impresión vaga

## Cuándo Usar

Usar este skill cuando el usuario pida cosas como:

- "revisa este PR en profundidad"
- "explícame esta contribución"
- "hazme un reporte o página web para este PR"
- "compara este diseño con sistemas similares"
- "¿debería mergear esto?"

## Salidas

Salidas comunes:

- reporte HTML independiente en `tmp/reports/...`
- reporte Markdown en `report/` u otra carpeta solicitada
- resumen corto para mantenedor en el chat

Si el usuario pide una página web, construir un artefacto HTML independiente pulido con
secciones claras y jerarquía visual legible.

Recursos incluidos con este skill:

- `references/style-guide.md` para la dirección visual y reglas de presentación del reporte
- `assets/html-report-starter.html` para un inicio reutilizable de HTML/CSS independiente

## Flujo de Trabajo

### 1. Adquirir y enmarcar el objetivo

Trabajar desde código local cuando sea posible, no solo la página del PR en GitHub.

Recopilar:

- rama objetivo o worktree
- tamaño del diff y subsistemas afectados
- documentación relevante del repo, especificaciones e invariantes
- intención del contribuidor si está documentada en el texto del PR o documentos de diseño

Comenzar respondiendo: ¿en qué *intenta convertirse* este cambio?

### 2. Construir un modelo mental del sistema

No detenerse en notas archivo por archivo. Reconstruir el diseño:

- qué nuevo runtime o contrato existe
- qué capas cambiaron: bd, tipos compartidos, servidor, UI, CLI, documentación
- ciclo de vida: instalación, arranque, ejecución, UI, falla, desactivación
- límite de confianza: qué código se ejecuta dónde, bajo qué autoridad

Para contribuciones grandes, incluir una sección estilo tutorial que enseñe el
sistema desde los primeros principios.

### 3. Revisar como un mantenedor

Los hallazgos van primero. Ordenar por severidad.

Priorizar:

- regresiones de comportamiento
- brechas de confianza o seguridad
- abstracciones engañosas
- riesgos de ciclo de vida y operacionales
- acoplamiento difícil de deshacer
- pruebas faltantes o afirmaciones no verificables

Siempre citar referencias concretas a archivos cuando sea posible.

### 4. Distinguir el tipo de objeción

Ser explícito sobre si una preocupación es:

- dirección de producto
- arquitectura
- calidad de implementación
- estrategia de despliegue
- honestidad de documentación

No esconder una objeción arquitectónica dentro de una objeción de alcance.

### 5. Comparar con precedentes externos cuando sea necesario

Si la contribución introduce un concepto de framework o plataforma, compararlo con
sistemas open-source similares.

Al comparar:

- preferir documentación oficial o código fuente
- enfocarse en límites de extensión, paso de contexto, modelo de confianza y propiedad de UI
- extraer lecciones, no solo similitudes

Buenas preguntas de comparación:

- ¿Quién es dueño del ciclo de vida?
- ¿Quién es dueño de la composición de UI?
- ¿El contexto es explícito o ambiental?
- ¿Los plugins son código confiable o código en sandbox?
- ¿Los puntos de extensión están nombrados y tipados?

### 6. Hacer la recomendación accionable

No detenerse en "mergear" o "no mergear".

Elegir una:

- mergear tal cual
- mergear después de un rediseño específico
- rescatar piezas específicas
- mantener como investigación de diseño

Si se rechaza o reduce, decir qué debería conservarse.

Categorías útiles de recomendación:

- conservar el modelo de protocolo/tipos
- rediseñar el límite de UI
- reducir la superficie inicial
- diferir la ejecución de terceros
- enviar primero un modelo de punto de extensión propio del host

### 7. Construir el artefacto

Estructura sugerida del reporte:

1. Resumen ejecutivo
2. Qué agrega realmente el PR
3. Tutorial: cómo funciona el sistema
4. Fortalezas
5. Hallazgos principales
6. Comparaciones
7. Recomendación

Para reportes HTML:

- usar tipografía y color intencionales
- facilitar la navegación en reportes largos
- favorecer encabezados de sección fuertes y etiquetas de referencia pequeñas
- evitar estilos genéricos de dashboard

Antes de construir desde cero, leer `references/style-guide.md`.
Si un inicio rápido pulido es útil, comenzar desde `assets/html-report-starter.html`
y reemplazar el contenido de marcador de posición con el reporte real.

### 8. Verificar antes de entregar

Verificar:

- la ruta del artefacto existe
- los hallazgos aún coinciden con el código real
- cualquier cadena prohibida solicitada está ausente de la salida generada
- si no se ejecutaron pruebas, decirlo explícitamente

## Heurísticas de Revisión

### Trabajo de plugins y plataforma

Vigilar de cerca:

- documentación que afirma sandboxing mientras el runtime ejecuta procesos confiables del host
- estado global de módulo usado para pasar contexto React de contrabando
- dependencia oculta en orden de renderizado
- plugins accediendo a internos del host en lugar de usar APIs explícitas
- "capacidades" que son realmente etiquetas de política sobre código completamente confiable

### Buenas señales

- contratos tipados compartidos entre capas
- puntos de extensión explícitos
- ciclo de vida propiedad del host
- modelo de confianza honesto
- primer despliegue reducido con espacio para crecer

## Respuesta Final

En el chat, resumir:

- dónde está el reporte
- tu veredicto general
- las una o dos razones principales
- si se omitieron verificaciones o pruebas

Mantener el resumen del chat más corto que el reporte mismo.
