# Guía Completa para Crear Skills en Claude

> Transforma a Claude en un experto especializado en tu dominio

Aprende a crear, probar y desplegar skills personalizados que extienden las capacidades de Claude con conocimiento especializado de dominio, flujos de trabajo y mejores prácticas.

**Temas Clave:** Arquitectura de Skills • Escritura de Instrucciones • Pruebas y Evaluación • Mejores Prácticas • Patrones Avanzados • Despliegue

---

## Tabla de Contenidos

1. [[#1. Qué son los Skills de Claude]]
2. [[#2. Por qué Crear Skills]]
3. [[#3. Estructura de un Skill]]
4. [[#4. Archivo SKILL.md en Detalle]]
5. [[#5. Cómo Escribir Instrucciones Efectivas]]
6. [[#6. Contexto y Archivos de Referencia]]
7. [[#7. Uso Avanzado de Skills]]
8. [[#8. Mejores Prácticas]]
9. [[#9. Pruebas y Depuración]]
10. [[#10. Despliegue y Distribución]]
11. [[#11. Resumen Rápido]]

---

## 1. Qué son los Skills de Claude

Los Skills son paquetes de instrucciones que transforman a Claude en un especialista de dominio. Piensa en ellos como **guías de experto** que Claude sigue al realizar tareas específicas.

Un skill puede enseñar a Claude a:

- Crear documentos de Word con formato profesional
- Generar presentaciones de PowerPoint
- Seguir el estilo y guía de voz de tu marca
- Ejecutar flujos de trabajo complejos paso a paso
- Aplicar mejores prácticas específicas de la industria

> [!tip] Concepto Clave
> Los skills no le dan a Claude nuevas capacidades de herramientas; en su lugar, le dan **conocimiento experto** sobre cómo usar las herramientas que ya tiene de la mejor manera.

### Analogía: Piensa en los Skills Como Recetas

Así como una receta le dice a un chef qué ingredientes usar y en qué orden, un skill le dice a Claude qué herramientas usar, en qué secuencia, y qué estándares de calidad seguir. El chef (Claude) ya sabe cocinar — la receta (skill) solo le dice *cómo* preparar un platillo específico.

---

## 2. Por qué Crear Skills

### Razones Clave para Construir Skills

- **Consistencia** — Obtener el mismo resultado de alta calidad cada vez
- **Conocimiento de Dominio** — Incorporar expertise especializado que Claude no tiene por defecto
- **Automatización de Flujos de Trabajo** — Automatizar procesos complejos de múltiples pasos
- **Control de Calidad** — Establecer estándares y requisitos específicos
- **Reutilización** — Crear una vez, usar muchas veces en diferentes proyectos
- **Compartir en Equipo** — Distribuir expertise estandarizado a todo tu equipo

### Sin Skill vs. Con Skill

| Sin Skill | Con Skill |
|---|---|
| Resultados inconsistentes | Salida consistente y predecible |
| Requiere indicaciones detalladas cada vez | Las instrucciones están integradas |
| Claude usa enfoques genéricos | Sigue mejores prácticas específicas |
| Depuración es ensayo y error | Manejo de errores estructurado |
| Difícil de compartir conocimiento | Fácil de distribuir y versionar |

---

## 3. Estructura de un Skill

Cada skill vive en su propio directorio con una estructura específica. El único archivo requerido es `SKILL.md`.

### Estructura Mínima

```
mi-skill/
  SKILL.md          # Requerido: Instrucciones principales
```

### Estructura Completa

```
mi-skill/
  SKILL.md          # Requerido: Instrucciones principales
  REFERENCE.md      # Opcional: Documentación detallada
  FORMS.md          # Opcional: Guías especializadas
  templates/        # Opcional: Archivos de plantilla
  examples/         # Opcional: Archivos de ejemplo
  assets/           # Opcional: Recursos adicionales
```

### Jerarquía de Archivos

| Archivo | Propósito | Cuándo Usarlo |
|---|---|---|
| `SKILL.md` | Instrucciones principales y punto de entrada | Siempre (requerido) |
| `REFERENCE.md` | Documentación detallada de API/biblioteca | Cuando se necesita info técnica extensa |
| `templates/` | Plantillas reutilizables | Cuando los resultados siguen patrones fijos |
| `examples/` | Archivos de ejemplo | Cuando los ejemplos aclaran el resultado esperado |

---

## 4. Archivo SKILL.md en Detalle

El archivo SKILL.md es el corazón de cada skill. Tiene dos partes: **frontmatter** (metadatos) y **contenido** (instrucciones).

### Frontmatter (Metadatos)

El frontmatter YAML al inicio del archivo define los metadatos del skill:

```yaml
---
name: mi-skill
description: |
  Descripción del skill que ayuda a Claude
  a saber cuándo activarlo.
---
```

### Campos del Frontmatter

| Campo | Requerido | Descripción |
|---|---|---|
| `name` | Sí | Identificador único del skill |
| `description` | Sí | Lo que hace el skill y cuándo se activa. Incluir palabras clave de activación |

> [!warning] Importante
> La descripción es **crítica** para la activación del skill. Incluye disparadores obligatorios, palabras clave y extensiones de archivo que deberían activar tu skill. Piensa en ello como una instrucción para Claude sobre cuándo usar tu skill.

### Contenido (Instrucciones)

Después del frontmatter viene el cuerpo Markdown con las instrucciones. Aquí es donde defines exactamente lo que Claude debe hacer:

- Pasos del flujo de trabajo
- Requisitos de calidad
- Manejo de errores
- Referencias a archivos adicionales
- Ejemplos y patrones

---

## 5. Cómo Escribir Instrucciones Efectivas

### Principios Clave

- **Sé Específico** — No digas "formatea bien". Di "usa encabezados H2, párrafos de máximo 3 oraciones, y listas con viñetas para más de 3 elementos".
- **Sé Secuencial** — Lista los pasos en orden. Claude los sigue de arriba hacia abajo.
- **Sé Exhaustivo** — Cubre los casos límite. ¿Qué pasa si falta un dato? ¿Qué pasa si el formato es incorrecto?
- **Usa Ejemplos** — Muestra la entrada y salida esperada. Claude aprende mejor con ejemplos concretos.
- **Referencia Archivos Externos** — Para documentación extensa, usa REFERENCE.md en lugar de sobrecargar SKILL.md.

### Patrón de Instrucciones Recomendado

```markdown
# Nombre del Skill

## Descripción General
Qué hace este skill y cuándo usarlo.

## Flujo de Trabajo
1. Primer paso
2. Segundo paso
3. Tercer paso

## Requisitos de Calidad
- Requisito A
- Requisito B

## Manejo de Errores
- Si ocurre X, hacer Y
- Si falta Z, preguntar al usuario

## Ejemplos
### Entrada
...
### Salida Esperada
...
```

### Errores Comunes al Escribir Instrucciones

| Error | Mejor Alternativa |
|---|---|
| "Haz un buen documento" | "Crea un documento con título en H1, resumen ejecutivo de 3 párrafos, y tabla de contenidos" |
| "Maneja los errores" | "Si el archivo no existe, muestra un mensaje de error específico y sugiere alternativas" |
| Instrucciones de 2000+ palabras en SKILL.md | Instrucciones concisas en SKILL.md, detalles en REFERENCE.md |

---

## 6. Contexto y Archivos de Referencia

Los skills pueden incluir archivos adicionales que proporcionan contexto, documentación de referencia, plantillas y ejemplos.

### REFERENCE.md

El archivo REFERENCE.md contiene documentación técnica detallada que es demasiado extensa para SKILL.md. Claude lo lee cuando necesita información técnica específica.

- Documentación de API y bibliotecas
- Snippets de código detallados
- Guías de solución de problemas
- Especificaciones técnicas

### Plantillas

Las plantillas proporcionan estructuras reutilizables. Colocadas en el directorio `templates/`, Claude las puede leer y adaptar:

```
mi-skill/
  templates/
    reporte-basico.md
    reporte-detallado.md
    email-formal.md
```

### Ejemplos

Los archivos de ejemplo muestran a Claude el resultado esperado. Son especialmente útiles para formatos complejos o estándares de calidad específicos:

- Muestras de documentos terminados
- Pares de entrada/salida
- Ejemplos de antes/después

> [!tip] Consejo
> Usa la directiva `Read` en SKILL.md para indicar a Claude que lea archivos adicionales. Por ejemplo: "Lee REFERENCE.md para los detalles de la API".

---

## 7. Uso Avanzado de Skills

### Composición de Skills

Los skills se pueden combinar. Claude puede usar múltiples skills en una sola tarea. Por ejemplo, al crear un reporte que incluye gráficas, Claude podría usar el skill de `docx` para el documento y el skill de `xlsx` para los datos.

### Skills Condicionales

Puedes escribir instrucciones condicionales dentro de un skill:

```markdown
## Flujo de Trabajo
1. Leer el archivo de entrada
2. Si es un CSV:
   - Usar pandas para procesamiento
   - Validar columnas requeridas
3. Si es un JSON:
   - Parsear con json.loads()
   - Verificar esquema esperado
4. Generar el reporte de salida
```

### Delegación a Sub-agentes

Los skills pueden instruir a Claude para que use la herramienta Task y delegue trabajo complejo a sub-agentes especializados. Esto es útil para tareas que requieren verificación independiente o procesamiento paralelo.

### Integración con Herramientas MCP

Los skills pueden hacer referencia a herramientas MCP (Model Context Protocol) disponibles. Si tu skill necesita interactuar con servicios externos como Google Calendar, Notion, Linear, etc., puedes incluir instrucciones para usar las herramientas MCP correspondientes.

---

## 8. Mejores Prácticas

- ✅ **Mantener SKILL.md Conciso** — Las instrucciones principales deben ser claras y directas. Mueve la documentación detallada a REFERENCE.md.
- ✅ **Usar Disparadores Claros** — En la descripción del frontmatter, incluye todas las palabras clave, extensiones de archivo y frases que deberían activar tu skill.
- ✅ **Incluir Manejo de Errores** — Siempre define qué hacer cuando las cosas salen mal. Claude necesita instrucciones explícitas para manejar errores.
- ✅ **Probar Iterativamente** — Prueba tu skill con diferentes entradas. Refina las instrucciones basándote en los resultados reales.
- ✅ **Versionar tus Skills** — Usa control de versiones (git) para rastrear cambios en tus skills.
- ✅ **Documentar Dependencias** — Si tu skill requiere bibliotecas o herramientas específicas, documéntalas claramente.
- ✅ **Ejemplo de Entrada/Salida** — Incluye al menos un par de ejemplo que muestre exactamente lo que el skill produce.

> [!tip] Regla de Oro
> Recuerda: Un buen skill es como una buena receta. Debe ser lo suficientemente detallado para que cualquiera lo siga, pero no tan largo que sea difícil de leer.

---

## 9. Pruebas y Depuración

### Estrategia de Pruebas

Probar skills es esencial para garantizar resultados consistentes. Aquí hay un enfoque sistemático:

1. **Prueba Básica** — Verifica que el skill se activa correctamente con las palabras clave esperadas.
2. **Prueba de Caso Feliz** — Proporciona una entrada ideal y verifica que la salida cumple con los estándares.
3. **Prueba de Casos Límite** — Prueba con entradas inusuales, incompletas o incorrectas.
4. **Prueba de Regresión** — Después de hacer cambios, verifica que la funcionalidad existente sigue funcionando.

### Herramienta de Evaluación (Evals)

El skill-creator incluye capacidades de evaluación que te permiten medir el rendimiento de tu skill de manera cuantitativa:

- Define casos de prueba con criterios de evaluación
- Ejecuta evaluaciones automatizadas
- Obtiene puntuaciones y métricas de rendimiento
- Analiza la varianza entre ejecuciones

### Depuración Común

| Problema | Solución |
|---|---|
| El skill no se activa | Revisa los disparadores en la descripción del frontmatter |
| Claude ignora instrucciones | Haz las instrucciones más explícitas y específicas |
| Salida inconsistente | Agrega más ejemplos y criterios de calidad |
| Errores de bibliotecas | Verifica que las dependencias están documentadas y disponibles |
| Skill demasiado lento | Divide en pasos más pequeños, usa sub-agentes para tareas paralelas |

---

## 10. Despliegue y Distribución

### Ubicaciones de Skills

Los skills se pueden colocar en varias ubicaciones según su alcance:

- **Skills de Proyecto** — En la carpeta `.skills/` dentro de tu proyecto. Disponibles solo para ese proyecto.
- **Skills del Usuario** — En la carpeta de configuración personal. Disponibles en todos los proyectos para ese usuario.
- **Skills de Equipo** — Compartidos a través de repositorios git o paquetes de plugins. Disponibles para todo el equipo.

### Plugins y Marketplaces

Los skills pueden empaquetarse como parte de **plugins** para distribución más amplia. Un plugin puede contener:

- Uno o más skills
- Servidores MCP para integraciones externas
- Configuración de herramientas y conectores
- Documentación y ejemplos

### Versionado

Es recomendable versionar tus skills usando control de versiones (git). Esto te permite:

- Rastrear cambios a lo largo del tiempo
- Revertir a versiones anteriores si algo sale mal
- Colaborar con otros desarrolladores de skills
- Mantener un historial de mejoras y correcciones

---

## 11. Resumen Rápido

1. Un skill es un paquete de instrucciones en una carpeta con un archivo SKILL.md
2. El frontmatter define el nombre y los disparadores de activación
3. Las instrucciones deben ser específicas, secuenciales y cubrir errores
4. Usa REFERENCE.md para documentación técnica extensa
5. Las plantillas y ejemplos mejoran la consistencia de la salida
6. Los skills se pueden componer y combinar entre sí
7. Prueba iterativamente con diferentes entradas
8. Versiona y documenta tus skills para fácil mantenimiento

> [!important] Recuerda
> Los mejores skills son aquellos que convierten tareas complejas y repetitivas en flujos de trabajo automatizados y consistentes. Empieza simple, prueba frecuentemente, y mejora iterativamente.
