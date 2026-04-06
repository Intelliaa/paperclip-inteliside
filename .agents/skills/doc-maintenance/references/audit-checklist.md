# Lista de Verificación de Auditoría de Mantenimiento de Documentación

Usar esta lista de verificación al auditar cada documento objetivo. Para cada elemento, comparar
contra el resumen de cambios del historial de git.

## README.md

### Tabla de funcionalidades
- [ ] Cada tarjeta de funcionalidad refleja una capacidad enviada
- [ ] No hay tarjetas de funcionalidad para cosas que aún no existen
- [ ] No faltan funcionalidades principales enviadas en la tabla

### Hoja de ruta
- [ ] Nada listado como "planificado" o "próximamente" que ya se envió
- [ ] No hay elementos eliminados/cancelados aún listados
- [ ] Los elementos reflejan las prioridades actuales (verificar cruzando con PRs recientes)

### Inicio rápido
- [ ] El comando `npx paperclipai onboard` es correcto
- [ ] Los pasos de instalación manual son precisos (URL de clonación, comandos)
- [ ] Los prerequisitos (versión de Node, versión de pnpm) están actualizados
- [ ] La URL y puerto del servidor son correctos

### Sección "Qué es Paperclip"
- [ ] La descripción de alto nivel es precisa
- [ ] La tabla de pasos (Definir objetivo / Contratar equipo / Aprobar y ejecutar) es correcta

### Tabla "Funciona con"
- [ ] Todos los adapters/runtimes soportados están listados
- [ ] No hay adapters eliminados aún listados
- [ ] Los logos y etiquetas coinciden con los nombres actuales de adapter

### "Paperclip es para ti si"
- [ ] Los casos de uso siguen siendo precisos
- [ ] No hay afirmaciones sobre capacidades que no existen

### "Por qué Paperclip es especial"
- [ ] Las afirmaciones técnicas son precisas (ejecución atómica, gobernanza, etc.)
- [ ] No hay funcionalidades listadas que fueron eliminadas o cambiaron significativamente

### FAQ
- [ ] Las respuestas siguen siendo correctas
- [ ] No hay referencias a funcionalidades eliminadas o comportamiento obsoleto

### Sección de desarrollo
- [ ] Los comandos son precisos (`pnpm dev`, `pnpm build`, etc.)
- [ ] El enlace a DEVELOPING.md es correcto

## doc/SPEC.md

### Modelo de Compañía
- [ ] Los campos coinciden con el esquema actual
- [ ] La descripción del modelo de gobernanza es precisa

### Modelo de Agente
- [ ] Los tipos de adapter coinciden con lo que realmente está soportado
- [ ] La descripción de configuración del agente es precisa
- [ ] No hay funcionalidades descritas como "no soportado" o "no en V1" que se enviaron

### Modelo de Tarea
- [ ] La descripción de jerarquía de tareas es precisa
- [ ] Los valores de estado coinciden con la implementación actual

### Extensiones / Plugins
- [ ] Si los plugins están enviados, no hay lenguaje de "no en V1" o "futuro"
- [ ] La descripción del modelo de plugin coincide con la implementación

### Preguntas Abiertas
- [ ] Preguntas resueltas eliminadas o actualizadas
- [ ] No hay elementos "por definir" que ya se decidieron

## doc/PRODUCT.md

### Conceptos Fundamentales
- [ ] Las descripciones de Compañía, Empleados, Gestión de Tareas son precisas
- [ ] Los modos de Ejecución de Agentes están descritos correctamente
- [ ] No faltan conceptos principales

### Principios
- [ ] Los principios no han sido contradichos por funcionalidades enviadas
- [ ] No hay principios que referencien capacidades eliminadas

### Flujo de Usuario
- [ ] El escenario ideal sigue reflejando la incorporación real
- [ ] Los pasos son alcanzables con las funcionalidades actuales
